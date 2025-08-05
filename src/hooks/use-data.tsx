
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { addYears, format, parseISO, differenceInYears } from 'date-fns';
import { useAuth } from './use-auth';

// Types
interface Investment {
    id: number;
    userId: string;
    name: string;
    amount: number;
    interestRate: number;
    startDate: string; // ISO string
    maturityDate: string; // ISO string
    status: 'Active' | 'Matured' | 'Withdrawn' | 'Pending';
}

interface InvestmentRequest {
    id: number;
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
    years: number;
    date: string; // ISO string
    status: 'Pending';
    investmentId: number;
}

interface FdWithdrawalRequest {
    id: number;
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
    date: string; // ISO string
    status: 'Pending';
    investmentIdToWithdraw: number;
}

interface TopupRequest {
    id: number;
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
    date: string; // ISO string
    status: 'Pending';
}

interface BalanceWithdrawalRequest {
    id: number;
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
    date: string; // ISO string
    status: 'Pending';
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
    investmentRequests: InvestmentRequest[];
    fdWithdrawalRequests: FdWithdrawalRequest[];
    topupRequests: TopupRequest[];
    balanceWithdrawalRequests: BalanceWithdrawalRequest[];
    userBalances: UserBalance[];
    balanceHistory: BalanceHistory[];
    addInvestmentRequest: (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'investmentId' | 'investmentId'>) => void;
    addFdWithdrawalRequest: (requestData: Omit<FdWithdrawalRequest, 'id' | 'status'>) => void;
    approveInvestmentRequest: (requestId: number) => void;
    rejectInvestmentRequest: (requestId: number) => void;
    approveFdWithdrawalRequest: (requestId: number) => void;
    rejectFdWithdrawalRequest: (requestId: number) => void;
    addTopupRequest: (requestData: Omit<TopupRequest, 'id' | 'status'>) => void;
    addBalanceWithdrawalRequest: (requestData: Omit<BalanceWithdrawalRequest, 'id' | 'status'>) => void;
    approveTopupRequest: (requestId: number) => void;
    rejectTopupRequest: (requestId: number) => void;
    approveBalanceWithdrawalRequest: (requestId: number) => void;
    rejectBalanceWithdrawalRequest: (requestId: number) => void;
    payInterestToAll: (annualRate: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock Data
const MOCK_USERS: AppUser[] = [
    { id: "user1", name: "Ramesh Patel", email: "ramesh.patel@example.com", avatar: "https://placehold.co/100x100.png", joinDate: "2023-01-15" },
    { id: "user2", name: "Sunita Reddy", email: "sunita.reddy@example.com", avatar: "https://placehold.co/100x100.png", joinDate: "2023-02-20" },
    { id: "user3", name: "Vijay Verma", email: "vijay.verma@example.com", avatar: "https://placehold.co/100x100.png", joinDate: "2023-03-10" },
];

const MOCK_INVESTMENTS: Investment[] = [
    { id: 1, userId: "user1", name: "SBI Fixed Deposit", amount: 50000, interestRate: 0.09, startDate: "2024-07-24", maturityDate: "2029-07-24", status: "Active" },
    { id: 2, userId: "user2", name: "HDFC Fixed Deposit", amount: 100000, interestRate: 0.09, startDate: "2023-08-15", maturityDate: "2028-08-15", status: "Active" },
    { id: 3, userId: "user1", name: "Post Office TD", amount: 25000, interestRate: 0.09, startDate: "2021-01-01", maturityDate: "2024-01-01", status: "Matured" },
];

const MOCK_USER_BALANCES: UserBalance[] = [
    { id: 1, userId: "user1", userName: "Ramesh Patel", userAvatar: "https://placehold.co/100x100.png", balance: 55000 },
    { id: 2, userId: "user2", userName: "Sunita Reddy", userAvatar: "https://placehold.co/100x100.png", balance: 75000 },
    { id: 3, userId: "user3", userName: "Vijay Verma", userAvatar: "https://placehold.co/100x100.png", balance: 120000 },
];

const MOCK_BALANCE_HISTORY: BalanceHistory[] = [
    { id: 1, userId: 'user1', date: "2024-07-28", description: "Added to wallet", amount: 5000, type: "Credit" },
    { id: 2, userId: 'user1', date: "2024-07-27", description: "FD Investment", amount: 50000, type: "Debit" },
    { id: 3, userId: 'user2', date: "2024-07-25", description: "Added to wallet", amount: 60000, type: "Credit" },
];


export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
    const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
    const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>([]);
    const [fdWithdrawalRequests, setFdWithdrawalRequests] = useState<FdWithdrawalRequest[]>([]);
    const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
    const [balanceWithdrawalRequests, setBalanceWithdrawalRequests] = useState<BalanceWithdrawalRequest[]>([]);
    const [userBalances, setUserBalances] = useState<UserBalance[]>(MOCK_USER_BALANCES);
    const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>(MOCK_BALANCE_HISTORY);

    useEffect(() => {
        if (user && !users.find(u => u.id === user.uid)) {
            const newUser: AppUser = {
                id: user.uid,
                name: user.displayName || "New User",
                email: user.email || "",
                avatar: user.photoURL || `https://placehold.co/100x100.png`,
                joinDate: new Date().toISOString().split('T')[0],
            };
            const newUserBalance: UserBalance = {
                id: Date.now(),
                userId: user.uid,
                userName: user.displayName || "New User",
                userAvatar: user.photoURL || `https://placehold.co/100x100.png`,
                balance: 0,
            };
            setUsers(prev => [...prev, newUser]);
            setUserBalances(prev => [...prev, newUserBalance]);
        }
    }, [user, users]);

    const addInvestmentRequest = (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'investmentId'>) => {
        const newInvestmentId = Date.now();
        const newInvestment: Investment = {
            id: newInvestmentId,
            userId: requestData.userId,
            name: "New Fixed Deposit",
            amount: requestData.amount,
            interestRate: 0.09, // Standard rate for new FDs
            startDate: new Date().toISOString(),
            maturityDate: addYears(new Date(), requestData.years).toISOString(),
            status: 'Pending',
        };
        setInvestments(prev => [...prev, newInvestment]);

        const newRequest: InvestmentRequest = {
            ...requestData,
            id: Date.now() + 1,
            status: 'Pending',
            investmentId: newInvestmentId,
        };
        setInvestmentRequests(prev => [...prev, newRequest]);
    };

    const addFdWithdrawalRequest = (requestData: Omit<FdWithdrawalRequest, 'id' | 'status'>) => {
        const newRequest: FdWithdrawalRequest = { ...requestData, id: Date.now(), status: 'Pending' };
        setFdWithdrawalRequests(prev => [...prev, newRequest]);
    };

    const approveInvestmentRequest = (requestId: number) => {
        const request = investmentRequests.find(r => r.id === requestId);
        if (!request) return;

        setInvestments(prev => prev.map(inv =>
            inv.id === request.investmentId ? { ...inv, status: 'Active' } : inv
        ));
        setInvestmentRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const rejectInvestmentRequest = (requestId: number) => {
        const request = investmentRequests.find(r => r.id === requestId);
        if (request) {
            setInvestments(prev => prev.filter(inv => inv.id !== request.investmentId));
        }
        setInvestmentRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const approveFdWithdrawalRequest = (requestId: number) => {
        const request = fdWithdrawalRequests.find(r => r.id === requestId);
        if (!request) return;

        const investment = investments.find(inv => inv.id === request.investmentIdToWithdraw);
        if (!investment) return;

        const penalizedRate = 0.065;
        const years = differenceInYears(new Date(), parseISO(investment.startDate)) || 1;
        const penalizedInterest = investment.amount * penalizedRate * years;
        const totalValue = investment.amount + penalizedInterest;

        setInvestments(prev => prev.map(inv => inv.id === request.investmentIdToWithdraw ? { ...inv, status: 'Withdrawn' } : inv));
        setUserBalances(prev => prev.map(b => b.userId === request.userId ? { ...b, balance: b.balance + totalValue } : b));
        setBalanceHistory(prev => [...prev, { id: Date.now(), userId: request.userId, date: new Date().toISOString(), description: `FD Withdrawal #${investment.id}`, amount: totalValue, type: "Credit" }]);
        setFdWithdrawalRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const rejectFdWithdrawalRequest = (requestId: number) => {
        setFdWithdrawalRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const addTopupRequest = (requestData: Omit<TopupRequest, 'id' | 'status'>) => {
        const newRequest: TopupRequest = { ...requestData, id: Date.now(), status: 'Pending' };
        setTopupRequests(prev => [...prev, newRequest]);
    };

    const addBalanceWithdrawalRequest = (requestData: Omit<BalanceWithdrawalRequest, 'id' | 'status'>) => {
        const newRequest: BalanceWithdrawalRequest = { ...requestData, id: Date.now(), status: 'Pending' };
        setBalanceWithdrawalRequests(prev => [...prev, newRequest]);
    };
    
    const approveTopupRequest = (requestId: number) => {
        const request = topupRequests.find(r => r.id === requestId);
        if (!request) return;

        setUserBalances(prev => prev.map(b => 
            b.userId === request.userId ? { ...b, balance: b.balance + request.amount } : b
        ));
        setBalanceHistory(prev => [...prev, { id: Date.now(), userId: request.userId, date: new Date().toISOString(), description: 'Added to wallet', amount: request.amount, type: 'Credit' }]);
        setTopupRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const rejectTopupRequest = (requestId: number) => {
        setTopupRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const approveBalanceWithdrawalRequest = (requestId: number) => {
        const request = balanceWithdrawalRequests.find(r => r.id === requestId);
        if (!request) return;

        setUserBalances(prev => prev.map(b => 
            b.userId === request.userId ? { ...b, balance: b.balance - request.amount } : b
        ));
        setBalanceHistory(prev => [...prev, { id: Date.now(), userId: request.userId, date: new Date().toISOString(), description: 'Withdrawn from wallet', amount: request.amount, type: 'Debit' }]);
        setBalanceWithdrawalRequests(prev => prev.filter(r => r.id !== requestId));
    };
    
    const rejectBalanceWithdrawalRequest = (requestId: number) => {
        setBalanceWithdrawalRequests(prev => prev.filter(r => r.id !== requestId));
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
            investmentRequests,
            fdWithdrawalRequests,
            topupRequests,
            balanceWithdrawalRequests,
            userBalances,
            balanceHistory,
            addInvestmentRequest,
            addFdWithdrawalRequest,
            approveInvestmentRequest,
            rejectInvestmentRequest,
            approveFdWithdrawalRequest,
            rejectFdWithdrawalRequest,
            addTopupRequest,
            addBalanceWithdrawalRequest,
            approveTopupRequest,
            rejectTopupRequest,
            approveBalanceWithdrawalRequest,
            rejectBalanceWithdrawalRequest,
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
