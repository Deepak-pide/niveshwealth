
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark, Briefcase, Percent, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

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
                        <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col justify-center">
                            <CardHeader>
                                <CardTitle className="text-center">Our business model</CardTitle>
                                <CardDescription className="text-center">
                                    How we maintain FD to generate best safest return
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center p-6">
                                <div className="text-center">
                                     <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                                    <p className="text-muted-foreground max-w-md">
                                        Nivesh earns a 1% commission on the returns generated from your fixed deposit investments. This aligns our success with yours and ensures we are motivated to secure the best and safest returns for your portfolio.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </section>
    );
}
