
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { differenceInYears, parse } from 'date-fns';

const investments = [
    {
        id: 1,
        name: "SBI Fixed Deposit",
        amount: "50,000",
        interestRate: "7.00%",
        startDate: "24 Jul 2024",
        maturityDate: "24 Jul 2029",
        status: "Active"
    },
    {
        id: 2,
        name: "HDFC Fixed Deposit",
        amount: "1,00,000",
        interestRate: "7.25%",
        startDate: "15 Aug 2023",
        maturityDate: "15 Aug 2028",
        status: "Active"
    },
    {
        id: 3,
        name: "Post Office TD",
        amount: "25,000",
        interestRate: "7.14%",
        startDate: "01 Jan 2021",
        maturityDate: "01 Jan 2026",
        status: "Matured"
    },
    {
        id: 4,
        name: "ICICI Bank FD",
        amount: "75,000",
        interestRate: "7.10%",
        startDate: "10 Feb 2022",
        maturityDate: "10 Feb 2027",
        status: "Active"
    },
    {
        id: 5,
        name: "Axis Bank FD",
        amount: "1,25,000",
        interestRate: "7.05%",
        startDate: "05 Mar 2020",
        maturityDate: "05 Mar 2025",
        status: "Matured"
    },
    {
        id: 6,
        name: "Kotak Mahindra Bank FD",
        amount: "30,000",
        interestRate: "6.90%",
        startDate: "12 Apr 2023",
        maturityDate: "12 Apr 2028",
        status: "Active"
    },
    {
        id: 7,
        name: "IndusInd Bank FD",
        amount: "2,00,000",
        interestRate: "7.50%",
        startDate: "20 May 2020",
        maturityDate: "20 May 2030",
        status: "Active"
    },
    {
        id: 8,
        name: "Yes Bank FD",
        amount: "40,000",
        interestRate: "7.30%",
        startDate: "18 Jun 2019",
        maturityDate: "18 Jun 2024",
        status: "Matured"
    },
    {
        id: 9,
        name: "Punjab National Bank FD",
        amount: "60,000",
        interestRate: "6.80%",
        startDate: "25 Jul 2021",
        maturityDate: "25 Jul 2026",
        status: "Active"
    },
    {
        id: 10,
        name: "Bank of Baroda FD",
        amount: "80,000",
        interestRate: "6.85%",
        startDate: "30 Aug 2022",
        maturityDate: "30 Aug 2027",
        status: "Active"
    },
    {
        id: 11,
        name: "Canara Bank FD",
        amount: "90,000",
        interestRate: "6.75%",
        startDate: "14 Sep 2020",
        maturityDate: "14 Sep 2025",
        status: "Matured"
    },
    {
        id: 12,
        name: "Union Bank of India FD",
        amount: "1,10,000",
        interestRate: "6.70%",
        startDate: "22 Oct 2023",
        maturityDate: "22 Oct 2028",
        status: "Active"
    },
    {
        id: 13,
        name: "IDFC First Bank FD",
        amount: "1,50,000",
        interestRate: "7.40%",
        startDate: "11 Nov 2024",
        maturityDate: "11 Nov 2029",
        status: "Active"
    },
    {
        id: 14,
        name: "RBL Bank FD",
        amount: "35,000",
        interestRate: "7.60%",
        startDate: "08 Dec 2019",
        maturityDate: "08 Dec 2024",
        status: "Matured"
    },
    {
        id: 15,
        name: "Federal Bank FD",
        amount: "45,000",
        interestRate: "7.15%",
        startDate: "19 Jan 2021",
        maturityDate: "19 Jan 2026",
        status: "Active"
    },
    {
        id: 16,
        name: "South Indian Bank FD",
        amount: "55,000",
        interestRate: "7.00%",
        startDate: "23 Feb 2022",
        maturityDate: "23 Feb 2027",
        status: "Active"
    },
    {
        id: 17,
        name: "Bandhan Bank FD",
        amount: "65,000",
        interestRate: "7.20%",
        startDate: "16 Mar 2020",
        maturityDate: "16 Mar 2025",
        status: "Matured"
    },
    {
        id: 18,
        name: "DCB Bank FD",
        amount: "85,000",
        interestRate: "7.55%",
        startDate: "14 Apr 2020",
        maturityDate: "14 Apr 2030",
        status: "Active"
    },
    {
        id: 19,
        name: "City Union Bank FD",
        amount: "95,000",
        interestRate: "6.95%",
        startDate: "29 May 2023",
        maturityDate: "29 May 2028",
        status: "Active"
    },
    {
        id: 20,
        name: "Karur Vysya Bank FD",
        amount: "1,05,000",
        interestRate: "7.00%",
        startDate: "07 Jul 2021",
        maturityDate: "07 Jul 2026",
        status: "Active"
    }
];

const activeInvestments = investments.filter(inv => inv.status === 'Active');
const maturedInvestments = investments.filter(inv => inv.status === 'Matured');

const parseDate = (dateStr: string) => parse(dateStr, 'dd MMM yyyy', new Date());

const calculateInvestmentDetails = (investment: typeof investments[0], customRate?: number) => {
    const principal = parseFloat(investment.amount.replace(/,/g, ''));
    const rate = customRate || parseFloat(investment.interestRate) / 100;
    const years = differenceInYears(parseDate(investment.maturityDate), parseDate(investment.startDate));
    const totalInterest = principal * rate * years;
    const totalValue = principal + totalInterest;

    return {
        principal,
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2))
    };
};

const COLORS = ['#3b82f6', 'hsl(var(--primary))'];

export default function InvestmentsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Active Investments</h1>
                        <p className="text-muted-foreground">Here is a list of your current investments.</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">View History</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Investment History</DialogTitle>
                                <DialogDescription>
                                    Here is a list of your matured investments.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-96">
                                <div className="space-y-4 pr-4">
                                     {maturedInvestments.map((investment) => (
                                        <Card key={investment.id}>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-base font-medium">{investment.name}</CardTitle>
                                                <Badge variant='secondary'>{investment.status}</Badge>
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
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </header>
                <div className="space-y-4">
                    {activeInvestments.map((investment) => {
                        const { principal, totalInterest, totalValue } = calculateInvestmentDetails(investment);
                        const penalizedDetails = calculateInvestmentDetails(investment, 0.065);
                        const chartData = [
                            { name: 'Principal Amount', value: principal },
                            { name: 'Total Interest', value: totalInterest },
                        ];
                        return (
                            <Dialog key={investment.id}>
                                <DialogTrigger asChild>
                                     <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-lg font-medium">{investment.name}</CardTitle>
                                            <Badge>{investment.status}</Badge>
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
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{investment.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                        <div className="h-48 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                             <div className="flex justify-between">
                                                <span className="text-muted-foreground">Principal Amount:</span>
                                                <span className="font-semibold text-foreground">₹{principal.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Estimated Interest:</span>
                                                <span className="font-semibold text-green-600">₹{totalInterest.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Value at Maturity:</span>
                                                <span className="font-semibold text-foreground">₹{totalValue.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Maturity Date:</span>
                                                <span className="font-semibold text-foreground">{investment.maturityDate}</span>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="w-full">Withdraw</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Early Withdrawal Confirmation</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Withdrawing early will reduce your interest rate to 6.5%. Please review the updated calculations below before confirming.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="space-y-4 text-sm pt-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Principal Amount:</span>
                                                        <span className="font-semibold text-foreground">₹{penalizedDetails.principal.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Penalized Interest (6.5%):</span>
                                                        <span className="font-semibold text-red-600">₹{penalizedDetails.totalInterest.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">New Total Value:</span>
                                                        <span className="font-semibold text-foreground">₹{penalizedDetails.totalValue.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction>Confirm Withdrawal</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
