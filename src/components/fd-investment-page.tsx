
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addYears, format } from 'date-fns';
import { useData } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";

export default function FdInvestmentPage() {
    const [amount, setAmount] = useState(50000);
    const [years, setYears] = useState(5);
    const [paymentMethod, setPaymentMethod] = useState<'balance' | 'upi'>('upi');
    const { addInvestmentRequest, userBalances, investmentRequests, fdTenureRates } = useData();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const isMobile = useIsMobile();
    
    const hasPendingFDRequest = investmentRequests.some(req => req.userId === user?.uid);
    
    const currentUserBalance = user ? userBalances.find(b => b.userId === user.uid)?.balance || 0 : 0;
    const hasSufficientBalance = currentUserBalance >= amount;

    const fdRate = fdTenureRates[years] || 0.09;
    const calculatedReturn = amount * fdRate * years;
    const totalAmount = amount + calculatedReturn;
    const maturityDate = addYears(new Date(), years);

    const handlePayment = () => {
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to make an investment.",
                variant: "destructive",
            });
            return;
        }

        if (paymentMethod === 'balance' && !hasSufficientBalance) {
             toast({
                title: "Insufficient Balance",
                description: "You do not have enough balance to make this investment.",
                variant: "destructive",
            });
            return;
        }

        if (paymentMethod === 'upi' && isMobile) {
            const transactionNote = `FD for ${years} years, maturing on ${format(maturityDate, 'PPP')}`;
            const upiUrl = `upi://pay?pa=9179349919-2@axl&pn=Nivesh&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
            window.open(upiUrl, '_blank');
        }

        addInvestmentRequest({
            userId: user.uid,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            years: years,
            paymentMethod: paymentMethod,
        });

        toast({
            title: "Investment Request Submitted",
            description: "Your FD investment request has been sent for admin approval.",
        });

        router.push('/investments');
    };

    const isPayNowDisabled = paymentMethod === 'balance' && !hasSufficientBalance;

    return (
        <div className="container mx-auto p-4 md:p-8 flex justify-center animate-fade-in">
            <div className="w-full max-w-lg space-y-8">
                <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <CardHeader>
                        <CardTitle>Invest in Fixed Deposit (FD)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="e.g., 50000"
                            />
                        </div>
                        <div className="grid gap-4">
                            <Label htmlFor="years">Years</Label>
                            <Input
                                id="years"
                                type="number"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                placeholder="e.g., 5"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" disabled={!user || hasPendingFDRequest}>{hasPendingFDRequest ? "Request Pending" : "Invest Now"}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Investment</AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div className="space-y-4 pt-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Investment Amount:</span>
                                                <span className="font-semibold text-foreground">₹{amount.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Estimated Return (at {(fdRate * 100).toFixed(2)}%):</span>
                                                <span className="font-semibold text-green-600">₹{calculatedReturn.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Value:</span>
                                                <span className="font-semibold text-foreground">₹{totalAmount.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Maturity Date:</span>
                                                <span className="font-semibold text-foreground">{format(maturityDate, 'PPP')}</span>
                                            </div>

                                             <RadioGroup defaultValue="upi" className="grid gap-4 pt-4" onValueChange={(value: 'balance' | 'upi') => setPaymentMethod(value)}>
                                                <Label className="font-semibold">Select Payment Method</Label>
                                                <div className="flex items-center space-x-2 rounded-md border p-4">
                                                    <RadioGroupItem value="balance" id="balance" />
                                                    <Label htmlFor="balance" className="flex flex-col w-full cursor-pointer">
                                                        <span>Pay from My Balance</span>
                                                        <span className={`text-xs ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
                                                            Available: ₹{currentUserBalance.toLocaleString('en-IN')}
                                                        </span>
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md border p-4">
                                                     <RadioGroupItem value="upi" id="upi" />
                                                    <Label htmlFor="upi" className="w-full cursor-pointer">Pay using UPI</Label>
                                                </div>
                                            </RadioGroup>

                                            {paymentMethod === 'upi' && !isMobile && (
                                                 <div className="space-y-4 pt-4 text-center">
                                                    <p className="font-semibold text-muted-foreground">Pay using UPI</p>
                                                    <div className="flex justify-center">
                                                        <Image
                                                            src="/QR Code.jpeg"
                                                            alt="UPI QR Code"
                                                            width={150}
                                                            height={150}
                                                        />
                                                    </div>
                                                    <p className="text-muted-foreground">Scan the QR code with your UPI app</p>
                                                    <p className="font-semibold">UPI ID: 9179349919-2@axl</p>
                                                    <p className="font-semibold">Mobile: 9179349919</p>
                                                </div>
                                            )}
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="grid grid-cols-2 gap-2 pt-4">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handlePayment} disabled={isPayNowDisabled}>
                                        {paymentMethod === 'upi' && !isMobile ? 'I Have Paid' : 'Submit Request'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         {hasPendingFDRequest && (
                            <p className="text-xs text-center text-muted-foreground">
                                You have a pending FD investment request. Please wait for admin approval.
                            </p>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
