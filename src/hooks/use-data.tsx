
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { addYears, format, parseISO, differenceInYears } from 'date-fns';

// Types
interface Investment {
    id: number;
    userId: string;
    name: string;
    amount: number;
    interestRate: number;
    startDate: string; // ISO string
    maturityDate: string; // ISO string
    status: 'Active' | 'Matured' | 'Withdrawn';
}

interface FDRequest {
    id: number;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'Investment' | 'Withdrawal';
    amount: number;
    date: string; // ISO string
    status: 'Pending' | 'Approved' | 'Rejected';
    years?: number;
    investmentIdToWithdraw?: number;
}

interface BalanceRequest {
    id: number;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'Add' | 'Withdraw';
    amount: number;
    date: string; // ISO string
    status: 'Pending' | 'Approved' | 'Rejected';
}

interface UserBalance {
    id: number;
    userId: string;
    userName: string;
    userAvatar: string;
    balance: number;
}

interface BalanceHistory {
    id: number,
    userId: string;
    date: string; // ISO string
    description: string;
    amount: number;
    type: "Credit" | "Debit";
}

interface AppUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    joinDate: string;
}


// Context
interface DataContextType {
    users: AppUser[];
    investments: Investment[];
    fdRequests: FDRequest[];
    balanceRequests: BalanceRequest[];
    userBalances: UserBalance[];
    balanceHistory: BalanceHistory[];
    addFdRequest: (request: FDRequest) => void;
    approveFdRequest: (requestId: number) => void;
    rejectFdRequest: (requestId: number) => void;
    removeInvestment: (investmentId: number) => void;
    addBalanceRequest: (request: BalanceRequest) => void;
    approveBalanceRequest: (requestId: number) => void;
    rejectBalanceRequest: (requestId: number) => void;
    payInterestToAll: (annualRate: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock Data
const MOCK_USERS: AppUser[] = [
    { id: "user1", name: "Ramesh Patel", email: "ramesh.patel@example.com", avatar: "/placeholder-user.jpg", joinDate: "2023-01-15" },
    { id: "user2", name: "Sunita Reddy", email: "sunita.reddy@example.com", avatar: "/placeholder-user.jpg", joinDate: "2023-02-20" },
    { id: "user3", name: "Vijay Verma", email: "vijay.verma@example.com", avatar: "/placeholder-user.jpg", joinDate: "2023-03-10" },
];

const MOCK_INVESTMENTS: Investment[] = [
    { id: 1, userId: "user1", name: "SBI Fixed Deposit", amount: 50000, interestRate: 0.07, startDate: "2024-07-24", maturityDate: "2029-07-24", status: "Active" },
    { id: 2, userId: "user2", name: "HDFC Fixed Deposit", amount: 100000, interestRate: 0.0725, startDate: "2023-08-15", maturityDate: "2028-08-15", status: "Active" },
    { id: 3, userId: "user1", name: "Post Office TD", amount: 25000, interestRate: 0.0714, startDate: "2021-01-01", maturityDate: "2024-01-01", status: "Matured" },
];

const MOCK_USER_BALANCES: UserBalance[] = [
    { id: 1, userId: "user1", userName: "Ramesh Patel", userAvatar: "/placeholder-user.jpg", balance: 55000 },
    { id: 2, userId: "user2", userName: "Sunita Reddy", userAvatar: "/placeholder-user.jpg", balance: 75000 },
    { id: 3, userId: "user3", userName: "Vijay Verma", userAvatar: "/placeholder-user.jpg", balance: 120000 },
];

const MOCK_BALANCE_HISTORY: BalanceHistory[] = [
    { id: 1, userId: 'user1', date: "2024-07-28", description: "Added to wallet", amount: 5000, type: "Credit" },
    { id: 2, userId: 'user1', date: "2024-07-27", description: "FD Investment", amount: 50000, type: "Debit" },
    { id: 3, userId: 'user2', date: "2024-07-25", description: "Added to wallet", amount: 60000, type: "Credit" },
];


export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
    const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
    const [fdRequests, setFdRequests] = useState<FDRequest[]>([]);
    const [balanceRequests, setBalanceRequests] = useState<BalanceRequest[]>([]);
    const [userBalances, setUserBalances] = useState<UserBalance[]>(MOCK_USER_BALANCES);
    const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>(MOCK_BALANCE_HISTORY);

    const addFdRequest = (request: FDRequest) => {
        setFdRequests(prev => [...prev, request]);
    };

    const approveFdRequest = (requestId: number) => {
        const request = fdRequests.find(r => r.id === requestId);
        if (!request) return;

        if (request.type === "Investment") {
            const userBalance = userBalances.find(b => b.userId === request.userId);
            if (!userBalance || userBalance.balance < request.amount) {
                // Optionally: handle insufficient balance
                setFdRequests(prev => prev.filter(r => r.id !== requestId));
                return;
            }

            const newInvestment: Investment = {
                id: Date.now(),
                userId: request.userId,
                name: "New Fixed Deposit", // Or generate a better name
                amount: request.amount,
                interestRate: 0.07, // Default rate
                startDate: new Date().toISOString(),
                maturityDate: addYears(new Date(), request.years || 5).toISOString(),
                status: 'Active',
            };
            setInvestments(prev => [...prev, newInvestment]);
            // Deduct from balance
            setUserBalances(prev => prev.map(b => b.userId === request.userId ? { ...b, balance: b.balance - request.amount } : b));
            setBalanceHistory(prev => [...prev, { id: Date.now(), userId: request.userId, date: new Date().toISOString(), description: `FD Investment #${newInvestment.id}`, amount: request.amount, type: "Debit" }]);

        } else if (request.type === "Withdrawal" && request.investmentIdToWithdraw) {
            const investment = investments.find(inv => inv.id === request.investmentIdToWithdraw);
            if (!investment) return;

            const penalizedRate = 0.065;
            const years = differenceInYears(parseISO(new Date().toISOString()), parseISO(investment.startDate));
            const penalizedInterest = investment.amount * penalizedRate * years;
            const totalValue = investment.amount + penalizedInterest;
            
            // Update investment status
            setInvestments(prev => prev.map(inv => inv.id === request.investmentIdToWithdraw ? { ...inv, status: 'Withdrawn' } : inv));
            
            // Add to balance
            setUserBalances(prev => prev.map(b => b.userId === request.userId ? { ...b, balance: b.balance + totalValue } : b));
            setBalanceHistory(prev => [...prev, { id: Date.now(), userId: request.userId, date: new Date().toISOString(), description: `FD Withdrawal #${investment.id}`, amount: totalValue, type: "Credit" }]);
        }
        
        setFdRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const rejectFdRequest = (requestId: number) => {
        setFdRequests(prev => prev.filter(r => r.id !== requestId));
    };
    
    const removeInvestment = (investmentId: number) => {
        setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
    }

    const addBalanceRequest = (request: BalanceRequest) => {
        setBalanceRequests(prev => [...prev, request]);
    };

    const approveBalanceRequest = (requestId: number) => {
        const request = balanceRequests.find(r => r.id === requestId);
        if (!request) return;

        setUserBalances(prev => prev.map(b => {
            if (b.userId === request.userId) {
                const newBalance = request.type === "Add" ? b.balance + request.amount : b.balance - request.amount;
                return { ...b, balance: newBalance };
            }
            return b;
        }));

        setBalanceHistory(prev => [...prev, {
            id: Date.now(),
            userId: request.userId,
            date: new Date().toISOString(),
            description: request.type === 'Add' ? 'Added to wallet' : 'Withdrawn from wallet',
            amount: request.amount,
            type: request.type === 'Add' ? 'Credit' : 'Debit'
        }]);

        setBalanceRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const rejectBalanceRequest = (requestId: number) => {
        setBalanceRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const payInterestToAll = (annualRate: number) => {
        const monthlyRate = annualRate / 12 / 100;
        const newHistory: BalanceHistory[] = [];
        setUserBalances(prev => prev.map(userBalance => {
            if (userBalance.balance > 0) {
                const interest = userBalance.balance * monthlyRate;
                newHistory.push({
                    id: Date.now() + userBalance.id,
                    userId: userBalance.userId,
                    date: new Date().toISOString(),
                    description: "Monthly Interest",
                    amount: parseFloat(interest.toFixed(2)),
                    type: 'Credit'
                });
                return { ...userBalance, balance: userBalance.balance + interest };
            }
            return userBalance;
        }));
        setBalanceHistory(prev => [...prev, ...newHistory]);
    };

    return (
        <DataContext.Provider value={{
            users,
            investments,
            fdRequests,
            balanceRequests,
            userBalances,
            balanceHistory,
            addFdRequest,
            approveFdRequest,
            rejectFdRequest,
            removeInvestment,
            addBalanceRequest,
            approveBalanceRequest,
            rejectBalanceRequest,
            payInterestToAll,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
