
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark, Briefcase, Percent, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import { cn } from "@/lib/utils";

const dummyHistory = [
    {
        date: "07/08/2025",
        description: "Monthly Interest",
        amount: 503,
        type: "Credit"
    },
    {
        date: "07/07/2025",
        description: "Monthly Interest",
        amount: 600,
        type: "Credit"
    },
    {
        date: "01/06/2025",
        description: "Added to wallet",
        amount: 100000,
        type: "Credit"
    }
];

export default function BusinessModelSection() {
    return (
        <section className="animate-fade-in">
            <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center">Our Business Model</CardTitle>
                    <CardDescription className="text-center">
                        How we make your money work for you.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div className="flex justify-around items-center text-center p-4 rounded-lg bg-muted/50">
                            <div className="flex flex-col items-center gap-2">
                                <Landmark className="h-8 w-8 text-muted-foreground" />
                                <p className="font-semibold">Saving Account</p>
                                <p className="text-lg font-bold text-muted-foreground">2-3%</p>
                            </div>
                             <p className="text-2xl font-bold text-primary">vs</p>
                            <div className="flex flex-col items-center gap-2">
                                <Wallet className="h-8 w-8 text-primary" />
                                <p className="font-semibold">Nivesh</p>
                                <p className="text-lg font-bold text-primary">6%</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground">
                           Your Nivesh wallet balance is securely invested in highly-rated fixed deposits with trusted banks like SBI, HDFC, and ICICI, earning about 7% annually. We pay you 6% interest instantly from our company account, while the invested amount is later withdrawn to ensure you get fast withdrawals.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                            <div className="flex items-center gap-2 text-center">
                                <Wallet className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-bold">Your Balance</p>
                                    <p className="text-sm text-muted-foreground">Invested Securely</p>
                                </div>
                            </div>
                            <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
                            <div className="flex items-center gap-2 text-center">
                                <Landmark className="h-6 w-6 text-green-600" />
                                <div>
                                    <p className="font-bold">7% Bank Return</p>
                                    <p className="text-sm text-muted-foreground">From FDs</p>
                                </div>
                            </div>
                             <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
                            <div className="flex items-center gap-2 text-center">
                                <Percent className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-bold">6% User Return</p>
                                    <p className="text-sm text-muted-foreground">Paid to you</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Example: ₹1,00,000 Balance</CardTitle>
                                <CardDescription>See how your balance grows over time.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell className="text-right">Amount</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dummyHistory.map((item, index) => {
                                            const isInterest = item.description === 'Monthly Interest';
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{item.date}</TableCell>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell className={cn(
                                                        "text-right font-semibold",
                                                        isInterest ? 'text-primary' : 'text-green-600'
                                                    )}>
                                                        +₹{item.amount.toLocaleString('en-IN')}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
