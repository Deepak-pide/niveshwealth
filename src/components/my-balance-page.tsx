
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";


export default function MyBalancePage() {
    const [addAmount, setAddAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const { userBalances, balanceHistory, addBalanceRequest } = useData();
    const { toast } = useToast();

    // Mock user ID as auth is removed
    const mockUserId = 'user1'; 
    const mockUser = {
        uid: mockUserId,
        displayName: "Ramesh Patel",
        email: "ramesh.patel@example.com",
        photoURL: "/placeholder-user.jpg"
    }

    const currentUserBalance = userBalances.find(b => b.userId === mockUserId)?.balance || 0;
    const currentUserHistory = balanceHistory.filter(h => h.userId === mockUserId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAddBalance = () => {
        const amount = parseFloat(addAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Invalid amount", description: "Please enter a valid amount to add.", variant: "destructive" });
            return;
        }
        addBalanceRequest({
            id: Date.now(),
            userId: mockUser.uid,
            userName: mockUser.displayName || mockUser.email || 'Unknown User',
            userAvatar: mockUser.photoURL || "/placeholder-user.jpg",
            type: "Add",
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            status: "Pending"
        });
        toast({ title: "Request Submitted", description: "Your request to add balance has been submitted." });
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
        addBalanceRequest({
            id: Date.now(),
            userId: mockUser.uid,
            userName: mockUser.displayName || mockUser.email || 'Unknown User',
            userAvatar: mockUser.photoURL || "/placeholder-user.jpg",
            type: "Withdraw",
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            status: "Pending"
        });
        toast({ title: "Request Submitted", description: "Your request to withdraw balance has been submitted." });
        setWithdrawAmount("");
    }

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
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
                                    <DialogTitle>Add Balance</DialogTitle>
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
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="submit" onClick={handleAddBalance}>Pay using UPI</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog>
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
                                    <DialogClose asChild>
                                         <Button type="submit" onClick={handleWithdrawBalance}>Withdraw</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <CardHeader>
                        <CardTitle>Balance History</CardTitle>
                        <CardDescription>A record of your recent transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentUserHistory.length > 0 ? currentUserHistory.map((item, index) => (
                                        <TableRow key={index} className="transition-colors hover:bg-muted/50">
                                            <TableCell className="font-medium">{new Date(item.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className={cn("text-right font-semibold", item.type === 'Credit' ? 'text-green-600' : 'text-red-600')}>
                                                {item.type === 'Credit' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center">No transaction history.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
