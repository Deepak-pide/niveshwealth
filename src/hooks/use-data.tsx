
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { addYears, parseISO, differenceInYears } from 'date-fns';
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
    addInvestmentRequest: (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => void;
    addFdWithdrawalRequest: (requestData: Omit<FdWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => void;
    approveInvestmentRequest: (requestId: number) => void;
    rejectInvestmentRequest: (requestId: number) => void;
    approveFdWithdrawalRequest: (requestId: number) => void;
    rejectFdWithdrawalRequest: (requestId: number) => void;
    addTopupRequest: (requestData: Omit<TopupRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => void;
    addBalanceWithdrawalRequest: (requestData: Omit<BalanceWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => void;
    approveTopupRequest: (requestId: number) => void;
    rejectTopupRequest: (requestId: number) => void;
    approveBalanceWithdrawalRequest: (requestId: number) => void;
    rejectBalanceWithdrawalRequest: (requestId: number) => void;
    payInterestToAll: (annualRate: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>([]);
    const [fdWithdrawalRequests, setFdWithdrawalRequests] = useState<FdWithdrawalRequest[]>([]);
    const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
    const [balanceWithdrawalRequests, setBalanceWithdrawalRequests] = useState<BalanceWithdrawalRequest[]>([]);
    const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);

    useEffect(() => {
        if (authUser && !users.find(u => u.id === authUser.uid)) {
            const newUser: AppUser = {
                id: authUser.uid,
                name: authUser.displayName || "New User",
                email: authUser.email || "",
                avatar: authUser.photoURL || `https://placehold.co/100x100.png`,
                joinDate: new Date().toISOString().split('T')[0],
            };
            const newUserBalance: UserBalance = {
                id: Date.now(),
                userId: authUser.uid,
                userName: authUser.displayName || "New User",
                userAvatar: authUser.photoURL || `https://placehold.co/100x100.png`,
                balance: 0,
            };
            setUsers(prev => [...prev, newUser]);
            setUserBalances(prev => [...prev, newUserBalance]);
        }
    }, [authUser, users]);

    const getUserInfo = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return {
            userName: user?.name || 'Unknown User',
            userAvatar: user?.avatar || `https://placehold.co/100x100.png`
        };
    };

    const addInvestmentRequest = (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => {
        const { userName, userAvatar } = getUserInfo(requestData.userId);
        const newRequest: InvestmentRequest = { ...requestData, id: Date.now(), status: 'Pending', userName, userAvatar };
        setInvestmentRequests(prev => [...prev, newRequest]);
    };

    const addFdWithdrawalRequest = (requestData: Omit<FdWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => {
        const { userName, userAvatar } = getUserInfo(requestData.userId);
        const newRequest: FdWithdrawalRequest = { ...requestData, id: Date.now(), status: 'Pending', userName, userAvatar };
        setFdWithdrawalRequests(prev => [...prev, newRequest]);
    };

    const approveInvestmentRequest = (requestId: number) => {
        const request = investmentRequests.find(r => r.id === requestId);
        if (!request) return;

        const newInvestment: Investment = {
            id: Date.now() + 1,
            userId: request.userId,
            name: `FD for ${request.years} years`,
            amount: request.amount,
            interestRate: 0.09,
            startDate: new Date().toISOString(),
            maturityDate: addYears(new Date(), request.years).toISOString(),
            status: 'Active',
        };
        setInvestments(prev => [...prev, newInvestment]);
        setInvestmentRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const rejectInvestmentRequest = (requestId: number) => {
        setInvestmentRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const approveFdWithdrawalRequest = (requestId: number) => {
        const request = fdWithdrawalRequests.find(r => r.id === requestId);
        if (!request) return;

        const investment = investments.find(inv => inv.id === request.investmentIdToWithdraw);
        if (!investment) return;

        const penalizedRate = 0.065;
        const years = Math.max(differenceInYears(new Date(), parseISO(investment.startDate)), 1);
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

    const addTopupRequest = (requestData: Omit<TopupRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => {
        const { userName, userAvatar } = getUserInfo(requestData.userId);
        const newRequest: TopupRequest = { ...requestData, id: Date.now(), status: 'Pending', userName, userAvatar };
        setTopupRequests(prev => [...prev, newRequest]);
    };

    const addBalanceWithdrawalRequest = (requestData: Omit<BalanceWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar'>) => {
        const { userName, userAvatar } = getUserInfo(requestData.userId);
        const newRequest: BalanceWithdrawalRequest = { ...requestData, id: Date.now(), status: 'Pending', userName, userAvatar };
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
        const updatedBalances = userBalances.map(userBalance => {
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
        });
        setUserBalances(updatedBalances);
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
