
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from './use-auth';
import { addYears, parseISO, differenceInYears, differenceInDays, format, startOfYear, endOfYear } from 'date-fns';
import { useToast } from './use-toast';
import { sendWithdrawalApprovedMessage } from '@/services/whatsapp';

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

export interface ProfileCompletionRequest {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    phoneNumber: string;
    address: string;
    occupation: string;
    panCard: string;
    aadharCard: string;
    documentUrl?: string;
    status: 'Pending';
}


export interface UserBalance {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    balance: number;
    liveGrowthInterestRate?: number;
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
    documentUrl?: string;
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
    profileCompletionRequests: ProfileCompletionRequest[];
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
    setLiveGrowthRate: (annualRate: number) => Promise<void>;
    addProfileCompletionRequest: (requestData: Omit<ProfileCompletionRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'documentUrl'> & { document?: File }) => Promise<void>;
    approveProfileCompletionRequest: (requestId: string) => Promise<void>;
    rejectProfileCompletionRequest: (requestId: string) => Promise<void>;
    setFdInterestRateForDateRange: (startYear: number, endYear: number, interestRate: number) => Promise<void>;
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
    const [profileCompletionRequests, setProfileCompletionRequests] = useState<ProfileCompletionRequest[]>([]);

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
                        liveGrowthInterestRate: 0.09,
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
    useDataFetching('profileCompletionRequests', setProfileCompletionRequests);

    const getUserInfo = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            return {
                userName: user.name,
                userAvatar: user.avatar,
                phoneNumber: user.phoneNumber,
            }
        }
        return {
            userName: authUser?.displayName || 'Unknown User',
            userAvatar: authUser?.photoURL || `https://placehold.co/100x100.png`,
            phoneNumber: undefined
        };
    };

    const addInvestmentRequest = async (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => {
        if (!authUser) return;
        const { userName, userAvatar } = getUserInfo(authUser.uid);
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
                    interestRate: 0.09,
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
        const { userName, userAvatar } = getUserInfo(authUser.uid);
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

        const newInvestment = {
            userId: requestData.userId,
            name: `FD for ${requestData.years} years`,
            amount: requestData.amount,
            interestRate: 0.09,
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
        const requestSnap = await getDoc(requestDocRef);
        if (!requestSnap.exists()) return;
        const request = requestSnap.data() as FdWithdrawalRequest;

        const investmentDocRef = doc(db, 'investments', request.investmentIdToWithdraw);
        const investmentSnap = await getDoc(investmentDocRef);
        if (!investmentSnap.exists()) return;
        const investment = investmentSnap.data() as Investment;

        const penalizedRate = 0.065;
        const years = Math.max(differenceInYears(new Date(), investment.startDate.toDate()), 1);
        const penalizedInterest = investment.amount * penalizedRate * years;
        const totalValue = investment.amount + penalizedInterest;
        
        const userBalanceDocRef = doc(db, 'userBalances', request.userId);

        const batch = writeBatch(db);
        
        const userBalanceSnap = await getDoc(userBalanceDocRef);
        const currentBalance = userBalanceSnap.exists() ? (userBalanceSnap.data()?.balance || 0) : 0;
        
        batch.update(userBalanceDocRef, { balance: currentBalance + totalValue });
        batch.update(investmentDocRef, { status: 'Withdrawn' });

        batch.set(doc(collection(db, 'balanceHistory')), { 
            userId: request.userId, 
            date: Timestamp.now(), 
            description: `Withdrawal from ${investment.name}`, 
            amount: totalValue, 
            type: "Credit" 
        });
        batch.delete(requestDocRef);
        await batch.commit();

        const userInfo = getUserInfo(request.userId);
        if (userInfo.phoneNumber) {
             try {
                await sendWithdrawalApprovedMessage({
                    customerName: userInfo.userName,
                    amount: totalValue.toFixed(2),
                    date: format(new Date(), 'dd MMM yyyy'),
                    phone: userInfo.phoneNumber,
                });
                toast({ title: "Success", description: "Withdrawal approved and notification sent." });
            } catch (error) {
                console.error("Failed to send WhatsApp message:", error);
                toast({ title: "Approval successful, but failed to send notification", variant: 'destructive' });
            }
        }
    };

    const rejectFdWithdrawalRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'fdWithdrawalRequests', requestId));
    };

    const addTopupRequest = async (requestData: Omit<TopupRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => {
        if (!authUser) return;
        const { userName, userAvatar } = getUserInfo(authUser.uid);
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
        const { userName, userAvatar } = getUserInfo(authUser.uid);
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
        const requestSnap = await getDoc(requestDocRef);
        if (!requestSnap.exists()) return;
        const request = requestSnap.data() as TopupRequest;

        const userBalanceDocRef = doc(db, 'userBalances', request.userId);
        const userBalanceSnap = await getDoc(userBalanceDocRef);
        const currentBalance = userBalanceSnap.exists() ? (userBalanceSnap.data()?.balance || 0) : 0;
        
        const batch = writeBatch(db);
        batch.update(userBalanceDocRef, { balance: currentBalance + request.amount });
        batch.set(doc(collection(db, 'balanceHistory')), {
            userId: request.userId,
            date: Timestamp.now(),
            description: 'Added to wallet',
            amount: request.amount,
            type: 'Credit'
        });
        batch.delete(requestDocRef);
        await batch.commit();
    };

    const rejectTopupRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'topupRequests', requestId));
    };

    const approveBalanceWithdrawalRequest = async (requestId: string) => {
        const requestDocRef = doc(db, 'balanceWithdrawalRequests', requestId);
        const requestSnap = await getDoc(requestDocRef);
        if (!requestSnap.exists()) return;
        const request = requestSnap.data() as BalanceWithdrawalRequest;

        const userBalanceDocRef = doc(db, 'userBalances', request.userId);
        const userBalanceSnap = await getDoc(userBalanceDocRef);
        const currentBalance = userBalanceSnap.exists() ? (userBalanceSnap.data()?.balance || 0) : 0;

        if (currentBalance < request.amount) {
            toast({ title: "Action Failed", description: "User has insufficient balance.", variant: "destructive" });
            return;
        }

        const batch = writeBatch(db);
        batch.update(userBalanceDocRef, { balance: currentBalance - request.amount });
        batch.set(doc(collection(db, 'balanceHistory')), {
            userId: request.userId,
            date: Timestamp.now(),
            description: 'Withdrawn from wallet',
            amount: request.amount,
            type: 'Debit'
        });
        batch.delete(requestDocRef);
        await batch.commit();
        
        const userInfo = getUserInfo(request.userId);
        if (userInfo.phoneNumber) {
            try {
                await sendWithdrawalApprovedMessage({
                    customerName: userInfo.userName,
                    amount: request.amount.toFixed(2),
                    date: format(new Date(), 'dd MMM yyyy'),
                    phone: userInfo.phoneNumber,
                });
                toast({ title: "Success", description: "Withdrawal approved and notification sent." });
            } catch (error) {
                console.error("Failed to send WhatsApp message:", error);
                toast({ title: "Approval successful, but failed to send notification", variant: 'destructive' });
            }
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

    const setLiveGrowthRate = async (annualRate: number) => {
        const batch = writeBatch(db);
        const querySnapshot = await getDocs(collection(db, "userBalances"));
        querySnapshot.forEach((doc) => {
            batch.update(doc.ref, { liveGrowthInterestRate: annualRate / 100 });
        });
        await batch.commit();
    };

    const addProfileCompletionRequest = async (requestData: Omit<ProfileCompletionRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'documentUrl'> & { document?: File }) => {
        if (!authUser) return;
        
        let documentUrl: string | undefined = undefined;
        if (requestData.document) {
            const file = requestData.document;
            const storageRef = ref(storage, `documents/${authUser.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            documentUrl = await getDownloadURL(storageRef);
        }

        const { userName, userAvatar } = getUserInfo(authUser.uid);
        const newRequest = { 
            ...requestData,
            documentUrl, 
            status: 'Pending' as const, 
            userName, 
            userAvatar,
        };
        delete (newRequest as any).document;

        await addDoc(collection(db, 'profileCompletionRequests'), newRequest);
    };

    const approveProfileCompletionRequest = async (requestId: string) => {
        const requestDocRef = doc(db, 'profileCompletionRequests', requestId);
        const requestSnap = await getDoc(requestDocRef);
        if (!requestSnap.exists()) return;
        const requestData = requestSnap.data() as ProfileCompletionRequest;

        const userDocRef = doc(db, 'users', requestData.userId);
        
        const batch = writeBatch(db);
        batch.update(userDocRef, {
            phoneNumber: requestData.phoneNumber,
            address: requestData.address,
            occupation: requestData.occupation,
            panCard: requestData.panCard,
            aadharCard: requestData.aadharCard,
            documentUrl: requestData.documentUrl || null,
        });
        batch.delete(requestDocRef);
        await batch.commit();
        toast({ title: "Profile Approved", description: `Details for ${requestData.userName} have been updated.` });
    };

    const rejectProfileCompletionRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'profileCompletionRequests', requestId));
        toast({ title: "Request Rejected", variant: "destructive" });
    };

    const setFdInterestRateForDateRange = async (startYear: number, endYear: number, interestRate: number) => {
        const startDate = startOfYear(new Date(startYear, 0, 1));
        const endDate = endOfYear(new Date(endYear, 11, 31));
        const rate = interestRate / 100;

        const investmentsRef = collection(db, 'investments');
        const q = query(investmentsRef, 
            where('startDate', '>=', Timestamp.fromDate(startDate)),
            where('startDate', '<=', Timestamp.fromDate(endDate))
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            throw new Error("No FDs found in the specified year range.");
        }

        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.update(doc.ref, { interestRate: rate });
        });

        await batch.commit();
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
        profileCompletionRequests,
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
        setLiveGrowthRate,
        addProfileCompletionRequest,
        approveProfileCompletionRequest,
        rejectProfileCompletionRequest,
        setFdInterestRateForDateRange,
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
