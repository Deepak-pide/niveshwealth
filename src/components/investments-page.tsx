
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
    {
        id: 4,
        name: "ICICI Bank FD",
        amount: "75,000",
        interestRate: "7.10%",
        maturityDate: "10 Feb 2027",
        status: "Active"
    },
    {
        id: 5,
        name: "Axis Bank FD",
        amount: "1,25,000",
        interestRate: "7.05%",
        maturityDate: "05 Mar 2025",
        status: "Matured"
    },
    {
        id: 6,
        name: "Kotak Mahindra Bank FD",
        amount: "30,000",
        interestRate: "6.90%",
        maturityDate: "12 Apr 2028",
        status: "Active"
    },
    {
        id: 7,
        name: "IndusInd Bank FD",
        amount: "2,00,000",
        interestRate: "7.50%",
        maturityDate: "20 May 2030",
        status: "Active"
    },
    {
        id: 8,
        name: "Yes Bank FD",
        amount: "40,000",
        interestRate: "7.30%",
        maturityDate: "18 Jun 2024",
        status: "Matured"
    },
    {
        id: 9,
        name: "Punjab National Bank FD",
        amount: "60,000",
        interestRate: "6.80%",
        maturityDate: "25 Jul 2026",
        status: "Active"
    },
    {
        id: 10,
        name: "Bank of Baroda FD",
        amount: "80,000",
        interestRate: "6.85%",
        maturityDate: "30 Aug 2027",
        status: "Active"
    },
    {
        id: 11,
        name: "Canara Bank FD",
        amount: "90,000",
        interestRate: "6.75%",
        maturityDate: "14 Sep 2025",
        status: "Matured"
    },
    {
        id: 12,
        name: "Union Bank of India FD",
        amount: "1,10,000",
        interestRate: "6.70%",
        maturityDate: "22 Oct 2028",
        status: "Active"
    },
    {
        id: 13,
        name: "IDFC First Bank FD",
        amount: "1,50,000",
        interestRate: "7.40%",
        maturityDate: "11 Nov 2029",
        status: "Active"
    },
    {
        id: 14,
        name: "RBL Bank FD",
        amount: "35,000",
        interestRate: "7.60%",
        maturityDate: "08 Dec 2024",
        status: "Matured"
    },
    {
        id: 15,
        name: "Federal Bank FD",
        amount: "45,000",
        interestRate: "7.15%",
        maturityDate: "19 Jan 2026",
        status: "Active"
    },
    {
        id: 16,
        name: "South Indian Bank FD",
        amount: "55,000",
        interestRate: "7.00%",
        maturityDate: "23 Feb 2027",
        status: "Active"
    },
    {
        id: 17,
        name: "Bandhan Bank FD",
        amount: "65,000",
        interestRate: "7.20%",
        maturityDate: "16 Mar 2025",
        status: "Matured"
    },
    {
        id: 18,
        name: "DCB Bank FD",
        amount: "85,000",
        interestRate: "7.55%",
        maturityDate: "14 Apr 2030",
        status: "Active"
    },
    {
        id: 19,
        name: "City Union Bank FD",
        amount: "95,000",
        interestRate: "6.95%",
        maturityDate: "29 May 2028",
        status: "Active"
    },
    {
        id: 20,
        name: "Karur Vysya Bank FD",
        amount: "1,05,000",
        interestRate: "7.00%",
        maturityDate: "07 Jul 2026",
        status: "Active"
    }
];


export default function InvestmentsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Investment History</h1>
                    <p className="text-muted-foreground">Here is a list of your past and current investments.</p>
                </header>
                <div className="space-y-4">
                    {investments.map((investment) => (
                        <Card key={investment.id} className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
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
