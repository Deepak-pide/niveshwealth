
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

export default function MyBalancePage() {
    const [addAmount, setAddAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [visibleHistoryCount, setVisibleHistoryCount] = useState(ITEMS_PER_PAGE);
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);


    const { userBalances, balanceHistory, addTopupRequest, addBalanceWithdrawalRequest, topupRequests, balanceWithdrawalRequests } = useData();
    const { toast } = useToast();
    const { user } = useAuth();

    if (!user) {
        return (
             <div className="container mx-auto p-4 md:p-8 animate-fade-in text-center">
                <p>Please log in to view your balance.</p>
                 <Button asChild className="mt-4">
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        )
    }

    const currentUserBalance = userBalances.find(b => b.userId === user.uid)?.balance || 0;
    const allUserHistory = balanceHistory.filter(h => h.userId === user.uid);

    const visibleHistory = allUserHistory.slice(0, visibleHistoryCount);
    const hasMoreHistory = allUserHistory.length > visibleHistoryCount;

    const pendingTopupRequests = topupRequests.filter(req => req.userId === user.uid);
    const pendingWithdrawalRequests = balanceWithdrawalRequests.filter(req => req.userId === user.uid);
    const hasPendingRequests = pendingTopupRequests.length > 0 || pendingWithdrawalRequests.length > 0;

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    const handleAddBalance = () => {
        const amount = parseFloat(addAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Invalid amount", description: "Please enter a valid amount to add.", variant: "destructive" });
            return;
        }

        addTopupRequest({
            userId: user.uid,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
        });
        playSound();
        toast({ title: "Request Submitted", description: "Your request to add balance has been sent for admin approval. It will be approved within 1 hour." });
        setAddAmount("");
    }
    
    const handleWithdrawBalance = () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Invalid amount", description: "Please enter a valid amount to withdraw.", variant: "destructive" });
            return;
        }
        if (amount > currentUserBalance) {
            toast({ title: "Insufficient Balance", description: "You cannot withdraw more than your current balance.", variant: "destructive" });
            return;
        }
        addBalanceWithdrawalRequest({
            userId: user.uid,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
        });
        playSound();
        toast({ title: "Request Submitted", description: "Your request to withdraw balance has been sent for admin approval." });
        setWithdrawAmount("");
        setIsWithdrawDialogOpen(false);
    }
    
    const loadMoreHistory = () => {
        setVisibleHistoryCount(prev => prev + ITEMS_PER_PAGE);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <audio ref={audioRef} src="/approved_notify.wav" preload="auto"></audio>
            <div className="space-y-8">
                <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <CardHeader>
                        <CardTitle>Your Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold tracking-tight text-foreground">₹{currentUserBalance.toLocaleString('en-IN')}</p>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Add Balance</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Balance via UPI</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="add-amount" className="text-right">
                                            Amount
                                        </Label>
                                        <Input
                                            id="add-amount"
                                            type="number"
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                            className="col-span-3"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div className="space-y-4 pt-4 text-center">
                                        <p className="text-sm text-muted-foreground">Scan the QR code with your UPI app</p>
                                        <div className="flex justify-center">
                                            <Image
                                                src="/QR Code.jpeg"
                                                alt="UPI QR Code"
                                                width={150}
                                                height={150}
                                            />
                                        </div>
                                        <p className="font-semibold">Mobile No. : 9179349919</p>
                                        <p className="text-xs text-primary">Payment will be approved within 1 hour.</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="submit" onClick={handleAddBalance} className="w-full">
                                            I Have Paid
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Withdraw</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Withdraw Balance</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="withdraw-amount" className="text-right">
                                            Amount
                                        </Label>
                                        <Input
                                            id="withdraw-amount"
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">Withdraw</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to withdraw ₹{parseFloat(withdrawAmount || "0").toLocaleString('en-IN')}?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleWithdrawBalance}>Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                {hasPendingRequests && (
                     <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                        <CardHeader>
                            <CardTitle>Pending Requests</CardTitle>
                            <CardDescription>The following requests are awaiting approval.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingTopupRequests.map(req => (
                                        <TableRow key={`topup-${req.id}`}>
                                            <TableCell>Add Balance</TableCell>
                                            <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary">{req.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingWithdrawalRequests.map(req => (
                                         <TableRow key={`withdraw-${req.id}`}>
                                            <TableCell>Withdrawal</TableCell>
                                            <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary">{req.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <CardHeader>
                        <CardTitle>Balance History</CardTitle>
                        <CardDescription>A record of your recent transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72 w-full">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleHistory.length > 0 ? visibleHistory.map((item, index) => {
                                        const isInterest = item.description === 'Monthly Interest';
                                        return (
                                            <TableRow key={index} className="transition-colors hover:bg-muted/50">
                                                <TableCell className="font-medium text-xs md:text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-col text-center">
                                                            <span>{format(item.date.toDate(), 'dd/MM')}</span>
                                                            <span className="text-muted-foreground">{format(item.date.toDate(), 'yyyy')}</span>
                                                        </div>
                                                        <div className="h-8 border-l border-border"></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="break-words">{item.description}</TableCell>
                                                <TableCell className={cn(
                                                    "text-right font-semibold whitespace-nowrap",
                                                    isInterest ? 'text-primary' : (item.type === 'Credit' ? 'text-green-600' : 'text-red-600')
                                                )}>
                                                    {item.type === 'Credit' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : <TableRow><TableCell colSpan={3} className="text-center">No transaction history.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                          {hasMoreHistory && (
                            <div className="pt-4 text-center">
                                <Button variant="outline" onClick={loadMoreHistory}>
                                    Load More
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
