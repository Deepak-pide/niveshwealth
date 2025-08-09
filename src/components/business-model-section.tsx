
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark, Briefcase, Percent, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from "./ui/badge";

const dummyHistory = [
    {
        date: "07/08/2025",
        description: "Monthly Interest",
        amount: 603,
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

const fdAllocationData = [
    { name: 'Bank Funds', value: 50, color: 'hsl(var(--primary))' },
    { name: 'Govt. Bonds', value: 30, color: 'hsl(var(--chart-2))' },
    { name: 'MNCs', value: 20, color: 'hsl(var(--chart-3))' },
];

export default function BusinessModelSection() {
    return (
        <section className="animate-fade-in">
             <Carousel className="w-full">
                <CarouselContent>
                    <CarouselItem>
                         <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl h-full">
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
                                    <div className="flex justify-around items-center space-x-2 pt-4 overflow-x-auto pb-2">
                                        <div className="flex flex-col sm:flex-row items-center gap-1 text-center flex-shrink-0">
                                            <Wallet className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-bold text-sm">Your Balance</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <div className="flex flex-col sm:flex-row items-center gap-1 text-center flex-shrink-0">
                                            <Landmark className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-bold text-sm">7% Return</p>
                                                <p className="text-xs text-muted-foreground">From FDs</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <div className="flex flex-col sm:flex-row items-center gap-1 text-center flex-shrink-0">
                                            <Percent className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-bold text-sm">6% Return</p>
                                                <p className="text-xs text-muted-foreground">Paid to you</p>
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
                    </CarouselItem>
                    <CarouselItem>
                        <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl h-full">
                             <CardHeader>
                                <CardTitle className="text-center">Our business model for FD</CardTitle>
                                <CardDescription className="text-center">
                                    When you plan for longer terms
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">Where we invest:</h4>
                                        <ul className="space-y-2 text-muted-foreground text-sm list-disc pl-5">
                                            <li><span className="font-medium text-foreground">High-Reputed Bank Funds:</span> SBI, HDFC, ICICI (9-10% return)</li>
                                            <li><span className="font-medium text-foreground">Government Bonds:</span> When govt needs loans (11% return)</li>
                                            <li><span className="font-medium text-foreground">MNC Companies:</span> (11% return)</li>
                                        </ul>
                                        <p className="text-sm mt-4 text-muted-foreground">
                                            We maintain almost no risk with safer and higher returns.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm font-semibold">Nivesh Earns</p>
                                            <p className="text-2xl font-bold text-primary">11%</p>
                                        </div>
                                         <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm font-semibold">Return to Investor</p>
                                            <p className="text-2xl font-bold text-green-600">9%</p>
                                        </div>
                                    </div>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={fdAllocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                    {fdAllocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-lg font-medium">Example FD</CardTitle>
                                            <Badge variant="secondary">Example</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Invested Amount</p>
                                                    <p className="font-semibold">₹30,000</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Interest Rate</p>
                                                    <p className="font-semibold">9.00%</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Tenure</p>
                                                    <p className="font-semibold">5 Years</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Amount at Maturity</p>
                                                    <p className="font-semibold text-green-600">₹43,500</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="mt-4 bg-accent/20 border-accent">
                                        <CardContent className="p-4">
                                            <p className="text-sm text-foreground text-center">We provide a <span className="font-bold">No-Lockin</span> feature. Get your money whenever it's urgent for you.</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
            <p className="text-center text-sm text-muted-foreground mt-2 sm:hidden">slide >> to know more</p>
        </section>
    );
}
