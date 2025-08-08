
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
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
import { addYears, parseISO, differenceInYears, differenceInDays, format, startOfYear, endOfYear, isAfter, isBefore, subMonths } from 'date-fns';
import { useToast } from './use-toast';
import type { User } from 'firebase/auth';

type RequestType = 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal' | 'FD Approved' | 'FD Withdrawal Approved' | 'Balance Top-up Approved' | 'Balance Withdrawal Approved' | 'FD Matured';

export interface CombinedRequest {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    phoneNumber?: string;
    type: RequestType;
    amount: number;
    date: Date;
};

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

export interface Template {
    id: string;
    title: string;
    message: string;
    type?: Omit<RequestType, 'General'>;
}

// Specific Types
export interface Investment {
    id: string;
    userId: string;
    userName: string;
    name: string;
    amount: number;
    interestRate: number;
    startDate: Timestamp;
    maturityDate: Timestamp;
    status: 'Active' | 'Matured' | 'Withdrawn' | 'Pending';
    description?: string;
}

export interface InvestmentRequest extends Omit<BaseRequest, 'date'> {
    date: Timestamp;
    years: number;
    paymentMethod: 'upi' | 'balance';
    description?: string;
}

export interface FdWithdrawalRequest extends BaseRequest {
    investmentIdToWithdraw: string;
}

export interface MaturedFdRequest extends BaseRequest {
    investmentIdToMature: string;
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
    userName: string;
    date: Timestamp;
    description: string;
    amount: number;
    type: "Credit" | "Debit";
}

export interface InterestPayout {
    id: string;
    userId: string;
    userName: string;
    date: Timestamp;
    description: string;
    amount: number;
    type: "Credit";
}


export interface AppUser {
    id: string;
    userId: string;
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
    upiId?: string;
    accountNumber?: string;
    accountHolderName?: string;
}

export interface UserProfileData {
    phoneNumber: string;
    occupation: string;
    upiId?: string;
    accountNumber?: string;
    accountHolderName?: string;
}


// Context
interface DataContextType {
    users: AppUser[];
    userDetails: UserDetails[];
    investments: Investment[];
    investmentRequests: InvestmentRequest[];
    fdWithdrawalRequests: FdWithdrawalRequest[];
    maturedFdRequests: MaturedFdRequest[];
    topupRequests: TopupRequest[];
    balanceWithdrawalRequests: BalanceWithdrawalRequest[];
    userBalances: UserBalance[];
    balanceHistory: BalanceHistory[];
    interestPayouts: InterestPayout[];
    templates: Template[];
    fdTenureRates: {[key: number]: number};
    updateUserProfile: (userId: string, data: UserProfileData) => Promise<void>;
    updateUserName: (userId: string, newName: string) => Promise<void>;
    addInvestmentRequest: (requestData: Omit<InvestmentRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    addFdWithdrawalRequest: (requestData: Omit<FdWithdrawalRequest, 'id' | 'status' | 'userName' | 'userAvatar' | 'date'> & { date: string }) => Promise<void>;
    approveInvestmentRequest: (requestId: string) => Promise<InvestmentRequest | null>;
    rejectInvestmentRequest: (requestId: string) => Promise<void>;
    approveFdWithdrawalRequest: (requestId: string) => Promise<FdWithdrawalRequest | null>;
    rejectFdWithdrawalRequest: (requestId: string) => Promise<void>;
    approveMaturedFdRequest: (requestId: string) => Promise<MaturedFdRequest | null>;
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
    const [maturedFdRequests, setMaturedFdRequests] = useState<MaturedFdRequest[]>([]);
    const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
    const [balanceWithdrawalRequests, setBalanceWithdrawalRequests] = useState<BalanceWithdrawalRequest[]>([]);
    const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);
    const [interestPayouts, setInterestPayouts] = useState<InterestPayout[]>([]);
    const [combinedHistory, setCombinedHistory] = useState<BalanceHistory[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [fdTenureRates, setFdTenureRates] = useState<{[key: number]: number}>({});

    const initializeNewUser = useCallback(async (user: User) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userBalanceDocRef = doc(db, 'userBalances', user.uid);
        
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            const batch = writeBatch(db);
            
            const newUser: Omit<AppUser, 'id'> = {
                userId: user.uid,
                name: user.displayName || "New User",
                email: user.email || "",
                avatar: user.photoURL || `https://placehold.co/100x100.png`,
                joinDate: Timestamp.now(),
                isProfileComplete: false,
            };
            batch.set(userDocRef, newUser);

            const newUserBalance: Omit<UserBalance, 'id' > = {
                userId: user.uid,
                userName: user.displayName || "New User",
                userAvatar: user.photoURL || `https://placehold.co/100x100.png`,
                balance: 0,
            };
            batch.set(userBalanceDocRef, newUserBalance);

            await batch.commit();
        }
    }, []);

    useEffect(() => {
        if (authUser) {
            initializeNewUser(authUser);
        }
    }, [authUser, initializeNewUser]);

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
        // This effect checks for matured FDs and creates requests if they don't already exist.
        // It should only be run by an admin to avoid multiple writes.
        const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
        const isAdmin = authUser?.email ? adminEmails.includes(authUser.email) : false;

        if (isAdmin && investments.length > 0 && users.length > 0 && maturedFdRequests.length >= 0) {
            const checkMaturedInvestments = async () => {
                const batch = writeBatch(db);
                const today = new Date();
                
                const activeInvestments = investments.filter(inv => inv.status === 'Active');
    
                for (const investment of activeInvestments) {
                    if (isAfter(today, investment.maturityDate.toDate())) {
                        const requestExists = maturedFdRequests.some(req => req.investmentIdToMature === investment.id);
                        
                        if (!requestExists) {
                            const user = users.find(u => u.id === investment.userId);
                            if (user) {
                                const newMaturedRequest: Omit<MaturedFdRequest, 'id'> = {
                                    userId: user.id,
                                    userName: user.name,
                                    userAvatar: user.avatar,
                                    amount: investment.amount,
                                    date: investment.maturityDate,
                                    status: 'Pending',
                                    investmentIdToMature: investment.id,
                                };
                                const newReqRef = doc(collection(db, 'maturedFdRequests'));
                                batch.set(newReqRef, newMaturedRequest);
                            }
                        }
                    }
                }
                await batch.commit();
            };
            checkMaturedInvestments();
        }
    }, [investments, users, maturedFdRequests, authUser]);
    
    useEffect(() => {
        const allHistory = [...balanceHistory, ...interestPayouts];
        allHistory.sort((a, b) => b.date.toMillis() - a.date.toMillis());
        setCombinedHistory(allHistory);
    }, [balanceHistory, interestPayouts]);


    useDataFetching('users', setUsers);
    useDataFetching('userDetails', setUserDetails);
    useDataFetching('investments', setInvestments);
    useDataFetching('investmentRequests', setInvestmentRequests);
    useDataFetching('fdWithdrawalRequests', setFdWithdrawalRequests);
    useDataFetching('maturedFdRequests', setMaturedFdRequests);
    useDataFetching('topupRequests', setTopupRequests);
    useDataFetching('balanceWithdrawalRequests', setBalanceWithdrawalRequests);
    useDataFetching('userBalances', setUserBalances);
    useDataFetching('balanceHistory', setBalanceHistory);
    useDataFetching('interestPayouts', setInterestPayouts);
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

        batch.set(userDetailsDocRef, { ...data, userId: userId }, { merge: true });
        batch.update(userDocRef, { isProfileComplete: true });

        await batch.commit();
    };

    const updateUserName = async (userId: string, newName: string) => {
        const batch = writeBatch(db);
        
        // 1. Update user document
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { name: newName });
        
        // 2. Update userBalance document
        const userBalanceRef = doc(db, 'userBalances', userId);
        batch.update(userBalanceRef, { userName: newName });

        const collectionsToUpdate: (keyof Omit<DataContextType, 'users' | 'userDetails' | 'fdTenureRates' | 'updateUserProfile' | 'updateUserName' | 'addInvestmentRequest' | 'addFdWithdrawalRequest' | 'approveInvestmentRequest' | 'rejectInvestmentRequest' | 'approveFdWithdrawalRequest' | 'rejectFdWithdrawalRequest' | 'approveMaturedFdRequest' | 'addTopupRequest' | 'addBalanceWithdrawalRequest' | 'approveTopupRequest' | 'rejectTopupRequest' | 'approveBalanceWithdrawalRequest' | 'rejectBalanceWithdrawalRequest' | 'payInterestToAll' | 'setFdInterestRatesForTenures' | 'getUserPhoneNumber' | 'addTemplate' | 'updateTemplate' | 'deleteTemplate'>)[] = [
            'investments', 'investmentRequests', 'fdWithdrawalRequests', 
            'maturedFdRequests', 'topupRequests', 'balanceWithdrawalRequests', 
            'balanceHistory', 'interestPayouts'
        ];

        for (const collectionName of collectionsToUpdate) {
            const q = query(collection(db, collectionName as string), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, { userName: newName });
            });
        }
    
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
        let reqData: InvestmentRequest | null = null;
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Investment request not found or already processed.");
                }
                reqData = { ...requestSnap.data(), id: requestSnap.id } as InvestmentRequest;

                const { userId, userName, amount, years, paymentMethod, description } = reqData;

                if (paymentMethod === 'balance') {
                    const userBalanceDocRef = doc(db, 'userBalances', userId);
                    const userBalanceSnap = await transaction.get(userBalanceDocRef);

                    if (!userBalanceSnap.exists()) {
                        throw new Error("User balance document does not exist!");
                    }

                    const currentBalance = userBalanceSnap.data().balance;
                    if (currentBalance < amount) {
                        transaction.delete(requestDocRef);
                        throw new Error("User has insufficient balance. Request rejected.");
                    }
                    
                    transaction.update(userBalanceDocRef, { balance: currentBalance - amount });
                    
                    const historyRef = doc(collection(db, 'balanceHistory'));
                    transaction.set(historyRef, {
                        userId: userId,
                        userName: userName,
                        date: Timestamp.now(),
                        description: `FD Investment (${years} years)`,
                        amount: amount,
                        type: "Debit"
                    });
                }
                
                const interestRate = fdTenureRates[years] || 0.09;
                const newInvestment = {
                    userId: userId,
                    userName: userName,
                    name: `FD for ${years} years`,
                    amount: amount,
                    interestRate: interestRate,
                    startDate: Timestamp.now(),
                    maturityDate: Timestamp.fromDate(addYears(new Date(), years)),
                    status: 'Active' as const,
                    description: description || '',
                };
                const investmentRef = doc(collection(db, 'investments'));
                transaction.set(investmentRef, newInvestment);
                transaction.delete(requestDocRef);
            });
            toast({ title: "Success", description: "Investment request approved.", variant: "success" });
            return reqData;
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
        let request: FdWithdrawalRequest | null = null;
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Withdrawal request not found or already processed.");
                }
                request = { ...requestSnap.data(), id: requestSnap.id } as FdWithdrawalRequest;
                
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

                const daysToMaturity = differenceInDays(investment.maturityDate.toDate(), new Date());
                const isPenaltyFree = daysToMaturity <= 7;
                const penaltyRate = isPenaltyFree ? investment.interestRate : Math.max(0, investment.interestRate - 0.01);
                
                const daysSinceStart = differenceInDays(new Date(), investment.startDate.toDate());
                const dailyPenalizedInterest = investment.amount * (penaltyRate / 365);
                const interestAccrued = daysSinceStart * dailyPenalizedInterest;
                const totalWithdrawalAmount = investment.amount + interestAccrued;
                
                const currentBalance = userBalanceSnap.data()?.balance || 0;
                
                transaction.update(userBalanceDocRef, { balance: currentBalance + totalWithdrawalAmount });
                transaction.update(investmentDocRef, { status: 'Withdrawn' });
                
                const historyRef = doc(collection(db, 'balanceHistory'));
                transaction.set(historyRef, { 
                    userId: request.userId,
                    userName: request.userName,
                    date: Timestamp.now(), 
                    description: `Early withdrawal from ${investment.name}`, 
                    amount: totalWithdrawalAmount, 
                    type: "Credit" 
                });

                transaction.delete(requestDocRef);
            });
            
            toast({ title: "Success", description: "Withdrawal approved and amount credited to balance.", variant: "success" });
            return request;
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

     const approveMaturedFdRequest = async (requestId: string): Promise<MaturedFdRequest | null> => {
        const requestDocRef = doc(db, 'maturedFdRequests', requestId);
        let request: MaturedFdRequest | null = null;
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Maturity request not found or already processed.");
                }
                request = { ...requestSnap.data(), id: requestSnap.id } as MaturedFdRequest;
                
                const investmentDocRef = doc(db, 'investments', request.investmentIdToMature);
                const investmentSnap = await transaction.get(investmentDocRef);
                if (!investmentSnap.exists()) throw new Error("Investment not found.");
                
                const investment = investmentSnap.data() as Investment;
                const tenureInDays = differenceInDays(investment.maturityDate.toDate(), investment.startDate.toDate());
                const totalInterest = investment.amount * investment.interestRate * (tenureInDays / 365);
                const totalValue = investment.amount + totalInterest;

                const userBalanceDocRef = doc(db, 'userBalances', request.userId);
                const userBalanceSnap = await transaction.get(userBalanceDocRef);
                if (!userBalanceSnap.exists()) throw new Error("User balance not found.");

                const currentBalance = userBalanceSnap.data()?.balance || 0;
                
                transaction.update(userBalanceDocRef, { balance: currentBalance + totalValue });
                transaction.update(investmentDocRef, { status: 'Matured' });
                
                const historyRef = doc(collection(db, 'balanceHistory'));
                transaction.set(historyRef, { 
                    userId: request.userId,
                    userName: request.userName,
                    date: Timestamp.now(), 
                    description: `FD Matured: ${investment.name}`, 
                    amount: totalValue, 
                    type: "Credit" 
                });

                transaction.delete(requestDocRef);
            });
            toast({ title: "Success", description: "FD matured and amount credited to balance.", variant: "success" });
            return request;
        } catch (error) {
            console.error("FD Maturity approval failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast({ title: "FD Maturity Failed", description: errorMessage, variant: "destructive" });
            return null;
        }
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
        let request: TopupRequest | null = null;
        try {
            await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Top-up request not found or already processed.");
                }
                request = { ...requestSnap.data(), id: requestSnap.id } as TopupRequest;
    
                const userBalanceDocRef = doc(db, 'userBalances', request.userId);
                const userBalanceSnap = await transaction.get(userBalanceDocRef);
                
                if (userBalanceSnap.exists()) {
                    const currentBalance = userBalanceSnap.data()?.balance || 0;
                    transaction.update(userBalanceDocRef, { balance: currentBalance + request.amount });
                } else {
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
                    userName: request.userName,
                    date: Timestamp.now(),
                    description: 'Added to wallet',
                    amount: request.amount,
                    type: 'Credit'
                });
    
                transaction.delete(requestDocRef);
            });
            toast({ title: "Success", description: "Top-up request approved.", variant: "success" });
            return request;
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
        let request: BalanceWithdrawalRequest | null = null;
        try {
             await runTransaction(db, async (transaction) => {
                const requestSnap = await transaction.get(requestDocRef);
                if (!requestSnap.exists()) {
                    throw new Error("Withdrawal request not found.");
                }
                request = { ...requestSnap.data(), id: requestSnap.id } as BalanceWithdrawalRequest;

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
                    userName: request.userName,
                    date: Timestamp.now(),
                    description: 'Withdrawn from wallet',
                    amount: request.amount,
                    type: 'Debit'
                });

                transaction.delete(requestDocRef);
            });

            toast({ title: "Success", description: "Withdrawal approved.", variant: "success" });
            return request;
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
        const oneMonthAgo = subMonths(new Date(), 1);

        for (const userBalance of userBalances) {
            if (userBalance.balance > 0) {
                // Find the user's transaction history
                const userHistory = combinedHistory.filter(h => h.userId === userBalance.userId);
                
                // Calculate balance from one month ago
                let balanceOneMonthAgo = userBalance.balance;
                const recentTransactions = userHistory.filter(h => h.date.toDate() > oneMonthAgo);

                for (const tx of recentTransactions) {
                    if (tx.type === 'Credit') {
                        balanceOneMonthAgo -= tx.amount;
                    } else { // Debit
                        balanceOneMonthAgo += tx.amount;
                    }
                }
                
                if (balanceOneMonthAgo > 0) {
                    const interest = parseFloat((balanceOneMonthAgo * monthlyRate).toFixed(2));
                    
                    if (interest > 0) {
                        const userBalanceRef = doc(db, 'userBalances', userBalance.id);
                        batch.update(userBalanceRef, { balance: userBalance.balance + interest });

                        const payoutRef = doc(collection(db, 'interestPayouts'));
                        batch.set(payoutRef, {
                            userId: userBalance.userId,
                            userName: userBalance.userName,
                            date: Timestamp.now(),
                            description: "Monthly Interest",
                            amount: interest,
                            type: 'Credit'
                        });
                    }
                }
            }
        }
        await batch.commit();
        toast({ title: "Interest Paid", description: "Monthly interest has been successfully paid to all eligible users."});
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
        maturedFdRequests,
        topupRequests,
        balanceWithdrawalRequests,
        userBalances,
        balanceHistory: combinedHistory,
        interestPayouts,
        templates,
        fdTenureRates,
        updateUserProfile,
        updateUserName,
        addInvestmentRequest,
        addFdWithdrawalRequest,
        approveInvestmentRequest,
        rejectInvestmentRequest,
        approveFdWithdrawalRequest,
        rejectFdWithdrawalRequest,
        approveMaturedFdRequest,
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
