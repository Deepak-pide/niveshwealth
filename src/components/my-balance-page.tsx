
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

const balanceHistory = [
    {
        date: "2024-07-28",
        description: "Added to wallet",
        amount: "5,000.00",
        type: "Credit"
    },
    {
        date: "2024-07-27",
        description: "FD Investment",
        amount: "50,000.00",
        type: "Debit"
    },
    {
        date: "2024-07-25",
        description: "Added to wallet",
        amount: "60,000.00",
        type: "Credit"
    },
    {
        date: "2024-07-24",
        description: "Added to wallet",
        amount: "10,000.00",
        type: "Credit"
    },
    {
        date: "2024-07-22",
        description: "FD Investment",
        amount: "25,000.00",
        type: "Debit"
    },
    {
        date: "2024-07-20",
        description: "Added to wallet",
        amount: "30,000.00",
        type: "Credit"
    },
];

export default function MyBalancePage() {
    const [addAmount, setAddAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold tracking-tight text-foreground">₹1,23,456.78</p>
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
                                            onChange={(e) => setAddAmount(Number(e.target.value))}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="submit">Pay using UPI</Button>
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
                                            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                         <Button type="submit">Withdraw</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                <Card>
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
                                    {balanceHistory.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.date}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className={cn("text-right font-semibold", item.type === 'Credit' ? 'text-green-600' : 'text-red-600')}>
                                                {item.type === 'Credit' ? '+' : '-'}₹{item.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
