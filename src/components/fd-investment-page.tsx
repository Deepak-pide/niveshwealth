
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { addYears, format } from 'date-fns';
import { useData } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function FdInvestmentPage() {
    const [amount, setAmount] = useState(50000);
    const [years, setYears] = useState(5);
    const { addFdRequest } = useData();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();


    const fdRate = 0.07;
    const calculatedReturn = amount * fdRate * years;
    const totalAmount = amount + calculatedReturn;
    const maturityDate = addYears(new Date(), years);

    const handleConfirmInvestment = () => {
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to make an investment.",
                variant: "destructive",
            });
            return;
        }

        const transactionNote = `FD Investment for ${years} years, maturing on ${format(maturityDate, 'PPP')}`;
        const upiUrl = `upi://pay?pa=payee@upi&pn=Nivesh&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        
        window.open(upiUrl, '_blank');

        addFdRequest({
            id: Date.now(),
            userId: user.uid,
            userName: user.displayName || user.email || 'Unknown User',
            userAvatar: user.photoURL || "/placeholder-user.jpg",
            type: "Investment",
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            years: years,
            status: "Pending"
        });

        toast({
            title: "Investment Request Submitted",
            description: "Your FD investment request has been submitted for approval.",
        });

        router.push('/investments');
    };

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
                    <CardFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full">Invest Now</Button>
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
                                                <span className="text-muted-foreground">Estimated Return:</span>
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
                                             <div className="pt-4 text-center text-muted-foreground">
                                                You will be redirected to your UPI app to complete the payment.
                                            </div>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                     <AlertDialogAction onClick={handleConfirmInvestment}>Pay using UPI</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
