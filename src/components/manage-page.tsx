
"use client";

import { Card } from "@/components/ui/card";
import { Briefcase, Wallet } from "lucide-react";
import Link from "next/link";
import { useData } from "@/hooks/use-data";

export default function ManagePage() {
    const { investmentRequests, fdWithdrawalRequests, topupRequests, balanceWithdrawalRequests } = useData();

    const hasFdRequests = investmentRequests.length > 0 || fdWithdrawalRequests.length > 0;
    const hasBalanceRequests = topupRequests.length > 0 || balanceWithdrawalRequests.length > 0;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage</h1>
                <p className="text-muted-foreground">Select a category to manage.</p>
            </header>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/manage/fd">
                    <Card className="relative flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:bg-accent/50 hover:shadow-lg hover:-translate-y-1 h-full">
                        {hasFdRequests && (
                            <span className="absolute top-2 right-2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        )}
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Manage FDs</h3>
                        <p className="text-sm text-muted-foreground">View and manage all fixed deposits</p>
                    </Card>
                </Link>
                <Link href="/admin/manage/balance">
                    <Card className="relative flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:bg-accent/50 hover:shadow-lg hover:-translate-y-1 h-full">
                        {hasBalanceRequests && (
                             <span className="absolute top-2 right-2 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        )}
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <Wallet className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Manage Balances</h3>
                        <p className="text-sm text-muted-foreground">View and manage user balances</p>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
