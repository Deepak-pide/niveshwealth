
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Wallet, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { Button } from "./ui/button";
import Link from "next/link";
import { isSameMonth, isSameYear } from "date-fns";

export default function AdminPage() {
    const { investments, userBalances, interestPayouts } = useData();

    const totalFD = investments.reduce((acc, inv) => acc + inv.amount, 0);
    const totalBalance = userBalances.reduce((acc, user) => acc + user.balance, 0);
    const totalActiveFDs = investments.filter(inv => inv.status === 'Active').length;

    const today = new Date();
    const isPaymentDay = today.getDate() >= 7;
    
    const interestPaidThisMonth = interestPayouts.some(payout => 
        isSameMonth(payout.date.toDate(), today) && isSameYear(payout.date.toDate(), today)
    );

    const showInterestReminder = isPaymentDay && !interestPaidThisMonth;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to the admin dashboard.</p>
                </header>
                {showInterestReminder && (
                    <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            <CardTitle className="text-yellow-800 dark:text-yellow-200">Pending Action: Pay Monthly Interest</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-yellow-700 dark:text-yellow-300">
                                It's the 7th of the month or later, and interest has not been paid. Please go to the balance management page to process the monthly interest payouts.
                            </p>
                            <Button asChild className="mt-4" variant="secondary">
                                <Link href="/admin/manage/balance">Go to Manage Balances</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total FD Amount
                            </CardTitle>
                             <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalFD.toLocaleString('en-IN')}</div>
                        </CardContent>
                    </Card>
                     <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Balance
                            </CardTitle>
                             <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalBalance.toLocaleString('en-IN')}</div>
                        </CardContent>
                    </Card>
                     <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Active FD
                            </CardTitle>
                             <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalActiveFDs}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
