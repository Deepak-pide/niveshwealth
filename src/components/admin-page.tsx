
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Wallet } from "lucide-react";
import { useData } from "@/hooks/use-data";

export default function AdminPage() {
    const { investments, userBalances } = useData();

    const totalFD = investments.reduce((acc, inv) => acc + inv.amount, 0);
    const totalBalance = userBalances.reduce((acc, user) => acc + user.balance, 0);

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to the admin dashboard.</p>
                </header>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total FD
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
                </div>
            </div>
        </div>
    );
}
