

"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { 
    collection, 
    onSnapshot, 
    addDoc, 
    deleteDoc, 
    doc, 
    updateDoc, 
    serverTimestamp,
    query,
    where,
    documentId,
    getDoc,
    writeBatch,
    Timestamp,
    getDocs,
    runTransaction,
    setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from './use-auth';
import { addYears, parseISO, differenceInYears, differenceInDays, format, startOfYear, endOfYear, isAfter } from 'date-fns';
import { useToast } from './use-toast';

// Base Types
interface BaseRequest {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
    date: Timestamp;
    status: 'Pending';
}

type RequestType = 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal';

export interface Template {
    id: string;
    title: string;
    message: string;
    type?: RequestType;
}

// Specific Types
export interface Investment {
    id: string;
    userId: string;
    name: string;
    amount: number;
    interestRate: number;
    startDate: Timestamp;
    maturityDate: Timestamp;
    status: 'Active' | 'Matured' | 'Withdrawn' | 'Pending';
}

export interface InvestmentRequest extends Omit<BaseRequest, 'date'> {
    date: Timestamp;
    years: number;
}

export interface FdWithdrawalRequest extends BaseRequest {
    investmentIdToWithdraw: string;
}

export type TopupRequest = BaseRequest;
export type BalanceWithdrawalRequest = BaseRequest;

interface UserProfileData {
    phoneNumber: string;
    address: string;
    occupation: string;
    panCard: string;
    aadharCard: string;
}


export interface UserBalance {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    balance: number;
}

export interface BalanceHistory {
    id: string;
    userId: string;
    date: Timestamp;
    description: string;
    amount: number;
    type: "Credit" | "Debit";
}

export interface AppUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    joinDate: Timestamp;
    phoneNumber?: string;
    address?: string;
    occupation?: string;
    panCard?: string;
    aadharCard?: string;
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
    templates: Template[];
    fdTenureRates: {[key: number]: number};
    addInvestmentRequest: (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    addInvestmentRequestFromBalance: (requestData: { userId: string, amount: number, years: number }) => Promise<void>;
    addFdWithdrawalRequest: (requestData: Omit<FdWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    approveInvestmentRequest: (requestId: string) => Promise<void>;
    rejectInvestmentRequest: (requestId: string) => Promise<void>;
    approveFdWithdrawalRequest: (requestId: string) => Promise<void>;
    rejectFdWithdrawalRequest: (requestId: string) => Promise<void>;
    addTopupRequest: (requestData: Omit<TopupRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    addBalanceWithdrawalRequest: (requestData: Omit<BalanceWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar'| 'date'> & { date: string }) => Promise<void>;
    approveTopupRequest: (requestId: string) => Promise<void>;
    rejectTopupRequest: (requestId: string) => Promise<void>;
    approveBalanceWithdrawalRequest: (requestId: string) => Promise<void>;
    rejectBalanceWithdrawalRequest: (requestId: string) => Promise<void>;
    payInterestToAll: (annualRate: number) => Promise<void>;
    updateUserProfile: (userId: string, data: UserProfileData) => Promise<void>;
    setFdInterestRatesForTenures: (rates: { [key: number]: number }) => Promise<void>;
    getUserPhoneNumber: (userId: string) => string | undefined;
    addTemplate: (templateData: Omit<Template, 'id'>) => Promise<void>;
    deleteTemplate: (templateId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const useDataFetching = (collectionName: string, setState: Function) => {
    useEffect(() => {
        const q = collection(db, collectionName);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setState(items);
        });
        return () => unsubscribe();
    }, [collectionName, setState]);
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>([]);
    const [fdWithdrawalRequests, setFdWithdrawalRequests] = useState<FdWithdrawalRequest[]>([]);
    const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
    const [balanceWithdrawalRequests, setBalanceWithdrawalRequests] = useState<BalanceWithdrawalRequest[]>([]);
    const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [fdTenureRates, setFdTenureRates] = useState<{[key: number]: number}>({});

    useEffect(() => {
        const docRef = doc(db, 'settings', 'fdTenureRates');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setFdTenureRates(docSnap.data());
            } else {
                // Initialize with default values if it doesn't exist
                const defaultRates = { '1': 0.08, '2': 0.08, '3': 0.085, '4': 0.085, '5': 0.09 };
                setDoc(docRef, defaultRates);
                setFdTenureRates(defaultRates);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authUser?.uid) {
            const userDocRef = doc(db, 'users', authUser.uid);
            const userBalanceDocRef = doc(db, 'userBalances', authUser.uid);
    
            getDoc(userDocRef).then(docSnap => {
                if (!docSnap.exists()) {
                    const batch = writeBatch(db);
                    
                    const newUser: Omit<AppUser, 'id'> = {
                        name: authUser.displayName || "New User",
                        email: authUser.email || "",
                        avatar: authUser.photoURL || `https://placehold.co/100x100.png`,
                        joinDate: Timestamp.now(),
                    };
                    batch.set(userDocRef, newUser);
    
                    const newUserBalance: Omit<UserBalance, 'id' > = {
                        userId: authUser.uid,
                        userName: authUser.displayName || "New User",
                        userAvatar: authUser.photoURL || `https://placehold.co/100x100.png`,
                        balance: 0,
                    };
                    batch.set(userBalanceDocRef, newUserBalance);
    
                    batch.commit();
                }
            });
        }
    }, [authUser]);

    useDataFetching('users', setUsers);
    useDataFetching('investments', setInvestments);
    useDataFetching('investmentRequests', setInvestmentRequests);
    useDataFetching('fdWithdrawalRequests', setFdWithdrawalRequests);
    useDataFetching('topupRequests', setTopupRequests);
    useDataFetching('balanceWithdrawalRequests', setBalanceWithdrawalRequests);
    useDataFetching('userBalances', setUserBalances);
    useDataFetching('balanceHistory', setBalanceHistory);
    useDataFetching('templates', setTemplates);

    const getUserInfo = () => {
        if (authUser) {
            return {
                userName: authUser.displayName || 'Unknown User',
                userAvatar: authUser.photoURL || `https://placehold.co/100x100.png`,
            }
        }
        return {
            userName: 'Unknown User',
            userAvatar: `https://placehold.co/100x100.png`,
        };
    };

    const getUserPhoneNumber = (userId: string): string | undefined => {
        const user = users.find(u => u.id === userId);
        return user?.phoneNumber;
    };

    const addInvestmentRequest = async (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => {
        if (!authUser) return;
        const { userName, userAvatar } = getUserInfo();
        const newRequest = { 
            ...requestData, 
            status: 'Pending' as const, 
            userName, 
            userAvatar,
            date: Timestamp.fromDate(new Date(requestData.date))
        };
        await addDoc(collection(db, 'investmentRequests'), newRequest);
    };

     const addInvestmentRequestFromBalance = async (requestData: { userId: string, amount: number, years: number }) => {
        if (!authUser) return;
        const { userId, amount, years } = requestData;
        const userBalanceDocRef = doc(db, 'userBalances', userId);
        
        const interestRate = fdTenureRates[years] || 0.09; // Fallback to 9% if not set

        try {
            await runTransaction(db, async (transaction) => {
                const userBalanceSnap = await transaction.get(userBalanceDocRef);
                if (!userBalanceSnap.exists()) {
                    throw "User balance document does not exist!";
                }

                const currentBalance = userBalanceSnap.data().balance;
                if (currentBalance < amount) {
                    throw "Insufficient balance.";
                }

                // 1. Deduct balance
                transaction.update(userBalanceDocRef, { balance: currentBalance - amount });
                
                // 2. Add to balance history
                const historyRef = doc(collection(db, 'balanceHistory'));
                transaction.set(historyRef, {
                    userId: userId,
                    date: Timestamp.now(),
                    description: `FD Investment (${years} years)`,
                    amount: amount,
                    type: "Debit"
                });

                // 3. Create investment directly (approved)
                const investmentRef = doc(collection(db, 'investments'));
                const newInvestment = {
                    userId: userId,
                    name: `FD for ${years} years`,
                    amount: amount,
                    interestRate: interestRate,
                    startDate: Timestamp.now(),
                    maturityDate: Timestamp.fromDate(addYears(new Date(), years)),
                    status: 'Active' as const,
                };
                transaction.set(investmentRef, newInvestment);
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
             toast({
                title: "Investment Failed",
                description: typeof e === 'string' ? e : "An unexpected error occurred during the transaction.",
                variant: "destructive",
            });
        }
    };

    const addFdWithdrawalRequest = async (requestData: Omit<FdWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => {
        if (!authUser) return;
        const { userName, userAvatar } = getUserInfo();
        const newRequest = { 
            ...requestData, 
            status: 'Pending' as const, 
            userName, 
            userAvatar,
            date: Timestamp.fromDate(new Date(requestData.date))
        };
        await addDoc(collection(db, 'fdWithdrawalRequests'), newRequest);
    };

    const approveInvestmentRequest = async (requestId: string) => {
        const requestDocRef = doc(db, 'investmentRequests', requestId);
        const requestSnap = await getDoc(requestDocRef);
        if (!requestSnap.exists()) return;
        const requestData = requestSnap.data() as InvestmentRequest;

        const interestRate = fdTenureRates[requestData.years] || 0.09; // Fallback to 9% if not set

        const newInvestment = {
            userId: requestData.userId,
            name: `FD for ${requestData.years} years`,
            amount: requestData.amount,
            interestRate: interestRate,
            startDate: Timestamp.now(),
            maturityDate: Timestamp.fromDate(addYears(new Date(), requestData.years)),
            status: 'Active' as const,
        };
        
        const batch = writeBatch(db);
        batch.set(doc(collection(db, 'investments')), newInvestment);
        batch.delete(requestDocRef);
        await batch.commit();
    };

    const rejectInvestmentRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'investmentRequests', requestId));
    };

     const approveFdWithdrawalRequest = async (requestId: string) => {
        const requestDocRef = doc(db, 'fdWithdrawalRequests', requestId);
        
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Withdrawal request not found or already processed.");
                }
                const request = requestSnap.data() as FdWithdrawalRequest;

                const investmentDocRef = doc(db, 'investments', request.investmentIdToWithdraw);
                const investmentSnap = await transaction.get(investmentDocRef);
                if (!investmentSnap.exists()) {
                    throw new Error("Investment record not found. It may have been deleted.");
                }
                const investment = investmentSnap.data() as Investment;

                const userBalanceDocRef = doc(db, 'userBalances', request.userId);
                const userBalanceSnap = await transaction.get(userBalanceDocRef);
                if (!userBalanceSnap.exists()) {
                    throw new Error("User balance record not found.");
                }

                // Calculate interest accrued to date with penalty
                const daysSinceStart = differenceInDays(new Date(), investment.startDate.toDate());
                const penaltyRate = Math.max(0, investment.interestRate - 0.01); // 1% penalty
                const dailyPenalizedInterest = investment.amount * (penaltyRate / 365);
                const interestAccrued = daysSinceStart * dailyPenalizedInterest;
                const totalWithdrawalAmount = investment.amount + interestAccrued;
                
                const currentBalance = userBalanceSnap.data()?.balance || 0;
                
                transaction.update(userBalanceDocRef, { balance: currentBalance + totalWithdrawalAmount });
                transaction.update(investmentDocRef, { status: 'Withdrawn' });
                
                const historyRef = doc(collection(db, 'balanceHistory'));
                transaction.set(historyRef, { 
                    userId: request.userId, 
                    date: Timestamp.now(), 
                    description: `Early withdrawal from ${investment.name}`, 
                    amount: totalWithdrawalAmount, 
                    type: "Credit" 
                });

                transaction.delete(requestDocRef);
            });
            
            toast({ title: "Success", description: "Withdrawal approved and amount credited to balance." });

        } catch (error) {
             console.error("FD Withdrawal approval failed:", error);
             const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
             toast({ title: "FD Withdrawal Failed", description: errorMessage, variant: "destructive" });
        }
    };

    const rejectFdWithdrawalRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'fdWithdrawalRequests', requestId));
    };

    const addTopupRequest = async (requestData: Omit<TopupRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => {
        if (!authUser) return;
        const { userName, userAvatar } = getUserInfo();
        const newRequest = { 
            ...requestData, 
            status: 'Pending' as const, 
            userName, 
            userAvatar,
            date: Timestamp.fromDate(new Date(requestData.date))
        };
        await addDoc(collection(db, 'topupRequests'), newRequest);
    };
    
    const addBalanceWithdrawalRequest = async (requestData: Omit<BalanceWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar'| 'date'> & { date: string }) => {
        if (!authUser) return;
        const { userName, userAvatar } = getUserInfo();
         const newRequest = { 
            ...requestData, 
            status: 'Pending' as const, 
            userName, 
            userAvatar,
            date: Timestamp.fromDate(new Date(requestData.date))
        };
        await addDoc(collection(db, 'balanceWithdrawalRequests'), newRequest);
    };

    const approveTopupRequest = async (requestId: string) => {
        const requestDocRef = doc(db, 'topupRequests', requestId);
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Top-up request not found or already processed.");
                }
                const request = requestSnap.data() as TopupRequest;
    
                const userBalanceDocRef = doc(db, 'userBalances', request.userId);
                const userBalanceSnap = await transaction.get(userBalanceDocRef);
                
                if (userBalanceSnap.exists()) {
                    const currentBalance = userBalanceSnap.data()?.balance || 0;
                    transaction.update(userBalanceDocRef, { balance: currentBalance + request.amount });
                } else {
                    // If balance doc doesn't exist, create it.
                    transaction.set(userBalanceDocRef, {
                        userId: request.userId,
                        userName: request.userName,
                        userAvatar: request.userAvatar,
                        balance: request.amount,
                    });
                }
                
                const historyRef = doc(collection(db, 'balanceHistory'));
                transaction.set(historyRef, {
                    userId: request.userId,
                    date: Timestamp.now(),
                    description: 'Added to wallet',
                    amount: request.amount,
                    type: 'Credit'
                });
    
                transaction.delete(requestDocRef);
            });
            toast({ title: "Success", description: "Top-up request approved." });
        } catch (error) {
            console.error("Top-up approval failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast({ title: "Top-up Failed", description: errorMessage, variant: "destructive" });
        }
    };

    const rejectTopupRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'topupRequests', requestId));
    };

    const approveBalanceWithdrawalRequest = async (requestId: string) => {
        const requestDocRef = doc(db, 'balanceWithdrawalRequests', requestId);
        try {
             await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Withdrawal request not found.");
                }
                const request = requestSnap.data() as BalanceWithdrawalRequest;

                const userBalanceDocRef = doc(db, 'userBalances', request.userId);
                const userBalanceSnap = await transaction.get(userBalanceDocRef);
                if (!userBalanceSnap.exists()) {
                    throw new Error("User balance not found.");
                }
                
                const currentBalance = userBalanceSnap.data()?.balance || 0;

                if (currentBalance < request.amount) {
                    throw new Error("User has insufficient balance.");
                }

                transaction.update(userBalanceDocRef, { balance: currentBalance - request.amount });
                
                const historyRef = doc(collection(db, 'balanceHistory'));
                transaction.set(historyRef, {
                    userId: request.userId,
                    date: Timestamp.now(),
                    description: 'Withdrawn from wallet',
                    amount: request.amount,
                    type: 'Debit'
                });

                transaction.delete(requestDocRef);
            });

            toast({ title: "Success", description: "Withdrawal approved." });

        } catch (error) {
            console.error("Balance Withdrawal approval failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast({ title: "Balance Withdrawal Failed", description: errorMessage, variant: "destructive" });
        }
    };

    const rejectBalanceWithdrawalRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'balanceWithdrawalRequests', requestId));
    };

    const payInterestToAll = async (annualRate: number) => {
        const monthlyRate = annualRate / 12 / 100;
        const batch = writeBatch(db);

        userBalances.forEach(userBalance => {
            if (userBalance.balance > 0) {
                const interest = parseFloat((userBalance.balance * monthlyRate).toFixed(2));
                const userBalanceRef = doc(db, 'userBalances', userBalance.id);
                batch.update(userBalanceRef, { balance: userBalance.balance + interest });

                const historyRef = doc(collection(db, 'balanceHistory'));
                batch.set(historyRef, {
                    userId: userBalance.userId,
                    date: Timestamp.now(),
                    description: "Monthly Interest",
                    amount: interest,
                    type: 'Credit'
                });
            }
        });
        await batch.commit();
    };

    const updateUserProfile = async (userId: string, data: UserProfileData) => {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, data);
    };

    const setFdInterestRatesForTenures = async (rates: { [key: number]: number }) => {
        const docRef = doc(db, 'settings', 'fdTenureRates');
        await setDoc(docRef, rates, { merge: true });
    };

    const addTemplate = async (templateData: Omit<Template, 'id'>) => {
        await addDoc(collection(db, 'templates'), templateData);
        toast({ title: "Template Saved", description: "Your new message template has been saved." });
    };
    
    const deleteTemplate = async (templateId: string) => {
        await deleteDoc(doc(db, 'templates', templateId));
        toast({ title: "Template Deleted", description: "The message template has been deleted." });
    };

    const value = {
        users,
        investments,
        investmentRequests,
        fdWithdrawalRequests,
        topupRequests,
        balanceWithdrawalRequests,
        userBalances,
        balanceHistory,
        templates,
        fdTenureRates,
        addInvestmentRequest,
        addInvestmentRequestFromBalance,
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
        updateUserProfile,
        setFdInterestRatesForTenures,
        getUserPhoneNumber,
        addTemplate,
        deleteTemplate,
    };

    return (
        <DataContext.Provider value={value}>
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

    