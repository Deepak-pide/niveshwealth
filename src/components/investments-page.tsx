
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const investments = [
    {
        id: 1,
        name: "SBI Fixed Deposit",
        amount: "50,000",
        interestRate: "7.00%",
        maturityDate: "24 Jul 2029",
        status: "Active"
    },
    {
        id: 2,
        name: "HDFC Fixed Deposit",
        amount: "1,00,000",
        interestRate: "7.25%",
        maturityDate: "15 Aug 2028",
        status: "Active"
    },
    {
        id: 3,
        name: "Post Office TD",
        amount: "25,000",
        interestRate: "7.14%",
        maturityDate: "01 Jan 2026",
        status: "Matured"
    },
];


export default function InvestmentsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">My Investments</h1>
                    <p className="text-muted-foreground">Here is a list of your current investments.</p>
                </header>
                <div className="space-y-4">
                    {investments.map((investment) => (
                        <Card key={investment.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">{investment.name}</CardTitle>
                                <Badge variant={investment.status === 'Active' ? 'default' : 'secondary'}>{investment.status}</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Amount</p>
                                        <p className="font-semibold">₹{investment.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Interest Rate</p>
                                        <p className="font-semibold">{investment.interestRate}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Maturity Date</p>
                                        <p className="font-semibold">{investment.maturityDate}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

