



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

type RequestType = 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal' | 'FD Approved' | 'FD Withdrawal Approved' | 'Balance Top-up Approved' | 'Balance Withdrawal Approved';

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
    paymentMethod: 'upi' | 'balance';
}

export interface FdWithdrawalRequest extends BaseRequest {
    investmentIdToWithdraw: string;
}

export type TopupRequest = BaseRequest;
export type BalanceWithdrawalRequest = BaseRequest;


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
    isProfileComplete: boolean;
}

export interface UserDetails {
    id: string;
    userId: string;
    phoneNumber: string;
    occupation: string;
}

export interface UserProfileData {
    phoneNumber: string;
    occupation: string;
}


// Context
interface DataContextType {
    users: AppUser[];
    userDetails: UserDetails[];
    investments: Investment[];
    investmentRequests: InvestmentRequest[];
    fdWithdrawalRequests: FdWithdrawalRequest[];
    topupRequests: TopupRequest[];
    balanceWithdrawalRequests: BalanceWithdrawalRequest[];
    userBalances: UserBalance[];
    balanceHistory: BalanceHistory[];
    templates: Template[];
    fdTenureRates: {[key: number]: number};
    updateUserProfile: (userId: string, data: UserProfileData) => Promise<void>;
    addInvestmentRequest: (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    addFdWithdrawalRequest: (requestData: Omit<FdWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    approveInvestmentRequest: (requestId: string) => Promise<InvestmentRequest | null>;
    rejectInvestmentRequest: (requestId: string) => Promise<void>;
    approveFdWithdrawalRequest: (requestId: string) => Promise<FdWithdrawalRequest | null>;
    rejectFdWithdrawalRequest: (requestId: string) => Promise<void>;
    addTopupRequest: (requestData: Omit<TopupRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    addBalanceWithdrawalRequest: (requestData: Omit<BalanceWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar'| 'date'> & { date: string }) => Promise<void>;
    approveTopupRequest: (requestId: string) => Promise<TopupRequest | null>;
    rejectTopupRequest: (requestId: string) => Promise<void>;
    approveBalanceWithdrawalRequest: (requestId: string) => Promise<BalanceWithdrawalRequest | null>;
    rejectBalanceWithdrawalRequest: (requestId: string) => Promise<void>;
    payInterestToAll: (annualRate: number) => Promise<void>;
    setFdInterestRatesForTenures: (rates: { [key: number]: number }) => Promise<void>;
    getUserPhoneNumber: (userId: string) => string | undefined;
    addTemplate: (templateData: Omit<Template, 'id'>) => Promise<void>;
    updateTemplate: (templateId: string, templateData: Omit<Template, 'id'>) => Promise<void>;
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
    const [userDetails, setUserDetails] = useState<UserDetails[]>([]);
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
                        isProfileComplete: false,
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
    useDataFetching('userDetails', setUserDetails);
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
        const details = userDetails.find(d => d.userId === userId);
        return details?.phoneNumber;
    };
    
    const updateUserProfile = async (userId: string, data: UserProfileData) => {
        const batch = writeBatch(db);
        const userDetailsDocRef = doc(db, 'userDetails', userId);
        const userDocRef = doc(db, 'users', userId);

        batch.set(userDetailsDocRef, { ...data, userId }, { merge: true });
        batch.update(userDocRef, { isProfileComplete: true });

        await batch.commit();
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

    const approveInvestmentRequest = async (requestId: string): Promise<InvestmentRequest | null> => {
        const requestDocRef = doc(db, 'investmentRequests', requestId);
        
        try {
            let requestData: InvestmentRequest | null = null;
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Investment request not found or already processed.");
                }
                const reqData = { ...requestSnap.data(), id: requestSnap.id } as InvestmentRequest;
                requestData = reqData;
                const { userId, amount, years, paymentMethod } = reqData;

                if (paymentMethod === 'balance') {
                    const userBalanceDocRef = doc(db, 'userBalances', userId);
                    const userBalanceSnap = await transaction.get(userBalanceDocRef);

                    if (!userBalanceSnap.exists()) {
                        throw new Error("User balance document does not exist!");
                    }

                    const currentBalance = userBalanceSnap.data().balance;
                    if (currentBalance < amount) {
                        // Reject request if insufficient balance
                        transaction.delete(requestDocRef);
                        throw new Error("User has insufficient balance. Request rejected.");
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
                }
                
                // 3. Create investment
                const interestRate = fdTenureRates[years] || 0.09; // Fallback to 9% if not set
                const newInvestment = {
                    userId: userId,
                    name: `FD for ${years} years`,
                    amount: amount,
                    interestRate: interestRate,
                    startDate: Timestamp.now(),
                    maturityDate: Timestamp.fromDate(addYears(new Date(), years)),
                    status: 'Active' as const,
                };
                const investmentRef = doc(collection(db, 'investments'));
                transaction.set(investmentRef, newInvestment);

                // 4. Delete the original request
                transaction.delete(requestDocRef);
            });
            toast({ title: "Success", description: "Investment request approved.", variant: "success" });
            return requestData;
        } catch (error) {
            console.error("Investment approval failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast({ title: "Approval Failed", description: errorMessage, variant: "destructive" });
            return null;
        }
    };

    const rejectInvestmentRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'investmentRequests', requestId));
    };

     const approveFdWithdrawalRequest = async (requestId: string): Promise<FdWithdrawalRequest | null> => {
        const requestDocRef = doc(db, 'fdWithdrawalRequests', requestId);
        let requestData: FdWithdrawalRequest | null = null;
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Withdrawal request not found or already processed.");
                }
                const request = { ...requestSnap.data(), id: requestSnap.id } as FdWithdrawalRequest;
                requestData = request;

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
            
            toast({ title: "Success", description: "Withdrawal approved and amount credited to balance.", variant: "success" });
            return requestData;
        } catch (error) {
             console.error("FD Withdrawal approval failed:", error);
             const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
             toast({ title: "FD Withdrawal Failed", description: errorMessage, variant: "destructive" });
             return null;
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

    const approveTopupRequest = async (requestId: string): Promise<TopupRequest | null> => {
        const requestDocRef = doc(db, 'topupRequests', requestId);
        let requestData: TopupRequest | null = null;
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Top-up request not found or already processed.");
                }
                const request = { ...requestSnap.data(), id: requestSnap.id } as TopupRequest;
                requestData = request;
    
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
            toast({ title: "Success", description: "Top-up request approved.", variant: "success" });
            return requestData;
        } catch (error) {
            console.error("Top-up approval failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast({ title: "Top-up Failed", description: errorMessage, variant: "destructive" });
            return null;
        }
    };

    const rejectTopupRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'topupRequests', requestId));
    };

    const approveBalanceWithdrawalRequest = async (requestId: string): Promise<BalanceWithdrawalRequest | null> => {
        const requestDocRef = doc(db, 'balanceWithdrawalRequests', requestId);
        let requestData: BalanceWithdrawalRequest | null = null;
        try {
             await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Withdrawal request not found.");
                }
                const request = { ...requestSnap.data(), id: requestSnap.id } as BalanceWithdrawalRequest;
                requestData = request;

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

            toast({ title: "Success", description: "Withdrawal approved.", variant: "success" });
            return requestData;
        } catch (error) {
            console.error("Balance Withdrawal approval failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast({ title: "Balance Withdrawal Failed", description: errorMessage, variant: "destructive" });
            return null;
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

    const setFdInterestRatesForTenures = async (rates: { [key: number]: number }) => {
        const docRef = doc(db, 'settings', 'fdTenureRates');
        await setDoc(docRef, rates, { merge: true });
    };

    const addTemplate = async (templateData: Omit<Template, 'id'>) => {
        await addDoc(collection(db, 'templates'), templateData);
        toast({ title: "Template Saved", description: "Your new message template has been saved." });
    };
    
    const updateTemplate = async (templateId: string, templateData: Omit<Template, 'id'>) => {
        const templateDocRef = doc(db, 'templates', templateId);
        await updateDoc(templateDocRef, templateData);
        toast({ title: "Template Updated", description: "Your message template has been updated." });
    };
    
    const deleteTemplate = async (templateId: string) => {
        await deleteDoc(doc(db, 'templates', templateId));
        toast({ title: "Template Deleted", description: "The message template has been deleted." });
    };

    const value = {
        users,
        userDetails,
        investments,
        investmentRequests,
        fdWithdrawalRequests,
        topupRequests,
        balanceWithdrawalRequests,
        userBalances,
        balanceHistory,
        templates,
        fdTenureRates,
        updateUserProfile,
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
        setFdInterestRatesForTenures,
        getUserPhoneNumber,
        addTemplate,
        updateTemplate,
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
