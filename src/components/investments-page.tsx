
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { differenceInYears, format, addYears, differenceInDays } from 'date-fns';
import Link from "next/link";
import { useData, Investment } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Timestamp } from "firebase/firestore";
import AppHeader from "./app-header";
import AppFooter from "./app-footer";


const calculateInvestmentDetails = (investment: { amount: number, interestRate: number, startDate: Timestamp, maturityDate: Timestamp }) => {
    const principal = investment.amount;
    const rate = investment.interestRate;
    const years = differenceInYears(investment.maturityDate.toDate(), investment.startDate.toDate());
    const totalInterest = principal * rate * years;
    const totalValue = principal + totalInterest;

    return {
        principal,
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2))
    };
};

const COLORS = ['hsl(var(--primary))', '#3b82f6'];
const ITEMS_PER_PAGE = 5;

export default function InvestmentsPage() {
    const { investments, investmentRequests, addFdWithdrawalRequest } = useData();
    const { toast } = useToast();
    const { user } = useAuth();
    const [visibleActive, setVisibleActive] = useState(ITEMS_PER_PAGE);
    const [visiblePast, setVisiblePast] = useState(ITEMS_PER_PAGE);
    const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    
    if (!user) {
        return (
             <div className="container mx-auto p-4 md:p-8 animate-fade-in text-center">
                <p>Please log in to view your investments.</p>
                 <Button asChild className="mt-4">
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        )
    }

    const userInvestments = investments.filter(inv => inv.userId === user.uid);
    
    const pendingUserInvestments = investmentRequests
        .filter(req => req.userId === user.uid)
        .map(req => ({
            id: req.id,
            userId: req.userId,
            name: `FD for ${req.years} years`,
            amount: req.amount,
            interestRate: 0.09, // Assumed rate for display
            startDate: req.date, // Request date as start date for now
            maturityDate: Timestamp.fromDate(addYears(new Date(req.date.toDate()), req.years)),
            status: 'Pending' as const,
        }));
    
    const combinedActiveInvestments = [
        ...pendingUserInvestments,
        ...userInvestments.filter(inv => inv.status === 'Active')
    ];

    const pastInvestments = userInvestments.filter(inv => inv.status === 'Matured' || inv.status === 'Withdrawn');
    
    const handleWithdraw = (investmentId: string) => {
        const investment = investments.find(inv => inv.id === investmentId);
        if (!investment || !user) return;

        addFdWithdrawalRequest({
            userId: user.uid,
            amount: investment.amount,
            date: new Date().toISOString().split('T')[0],
            investmentIdToWithdraw: investmentId,
        });

        toast({
            title: "Withdrawal Request Submitted",
            description: "Your withdrawal request has been submitted for approval.",
        });
        setIsWithdrawalDialogOpen(false);
        setIsDetailsDialogOpen(false);
    };
    
    const visibleActiveInvestments = combinedActiveInvestments.slice(0, visibleActive);
    const hasMoreActive = combinedActiveInvestments.length > visibleActive;

    const visiblePastInvestments = pastInvestments.slice(0, visiblePast);
    const hasMorePast = pastInvestments.length > visiblePast;


    return (
        <div className="flex flex-col h-screen bg-background">
          <AppHeader />
          <header className="shrink-0 border-b bg-card shadow-sm px-4 h-16 flex items-center justify-between">
              <div>
                  <h1 className="text-xl font-bold tracking-tight">Active Investments</h1>
                  <p className="text-sm text-muted-foreground">Here is a list of your current investments.</p>
              </div>
              <Dialog>
                  <DialogTrigger asChild>
                      <Button variant="outline">View History</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                          <DialogTitle>Investment History</DialogTitle>
                          <DialogDescription>
                              Here is a list of your matured and withdrawn investments.
                          </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-96">
                          <div className="space-y-4 pr-4">
                               {visiblePastInvestments.length > 0 ? visiblePastInvestments.map((investment) => (
                                  <Card key={investment.id}>
                                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                                          <CardTitle className="text-base font-medium">{investment.name}</CardTitle>
                                          <Badge variant={investment.status === 'Matured' ? 'secondary' : 'destructive'}>{investment.status}</Badge>
                                      </CardHeader>
                                      <CardContent>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                              <div>
                                                  <p className="text-muted-foreground">Amount</p>
                                                  <p className="font-semibold">₹{investment.amount.toLocaleString('en-IN')}</p>
                                              </div>
                                              <div>
                                                  <p className="text-muted-foreground">Interest Rate</p>
                                                  <p className="font-semibold">{(investment.interestRate * 100).toFixed(2)}%</p>
                                              </div>
                                              <div>
                                                  <p className="text-muted-foreground">Maturity Date</p>
                                                  <p className="font-semibold">{format(investment.maturityDate.toDate(), 'dd MMM yyyy')}</p>
                                              </div>
                                          </div>
                                      </CardContent>
                                  </Card>
                               )) : <p className="text-muted-foreground text-center">No past investments found.</p>}
                               {hasMorePast && (
                                  <div className="pt-4 text-center">
                                      <Button variant="outline" onClick={() => setVisiblePast(prev => prev + ITEMS_PER_PAGE)}>
                                          Load More
                                      </Button>
                                  </div>
                              )}
                          </div>
                      </ScrollArea>
                  </DialogContent>
              </Dialog>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="space-y-4">
                {visibleActiveInvestments.length > 0 ? visibleActiveInvestments.map((investment) => {
                    const { principal, totalInterest, totalValue } = calculateInvestmentDetails(investment);
                    const chartData = [
                        { name: 'Total Interest', value: totalInterest },
                        { name: 'Principal Amount', value: principal },
                    ];

                    const isPending = investment.status === 'Pending';
                    const isActive = investment.status === 'Active';

                    const daysSinceStart = isActive ? differenceInDays(new Date(), investment.startDate.toDate()) : 0;
                    const dailyInterest = principal * (investment.interestRate / 365);
                    const liveInterestAccrued = daysSinceStart * dailyInterest;
                    const liveTotalValue = principal + liveInterestAccrued;
                    
                    const daysToMaturity = differenceInDays(investment.maturityDate.toDate(), new Date());
                    const isPenaltyFree = daysToMaturity <= 7;
                    const penaltyRate = isPenaltyFree ? investment.interestRate : Math.max(0, investment.interestRate - 0.01);
                    const dailyPenalizedInterest = principal * (penaltyRate / 365);
                    const penalizedInterestAccrued = daysSinceStart * dailyPenalizedInterest;
                    const totalWithdrawalAmount = principal + penalizedInterestAccrued;


                    return (
                        <Dialog key={investment.id} open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                            <DialogTrigger asChild disabled={isPending}>
                                 <Card className={`transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl ${isPending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-lg font-medium">{investment.name}</CardTitle>
                                        <Badge variant={isPending ? "secondary" : "default"}>{investment.status}</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Amount</p>
                                                <p className="font-semibold">₹{investment.amount.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Interest Rate</p>
                                                <p className="font-semibold">{(investment.interestRate * 100).toFixed(2)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Maturity Date</p>
                                                <p className="font-semibold">{format(investment.maturityDate.toDate(), 'dd MMM yyyy')}</p>
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
                                            <span className="text-muted-foreground">Estimated Interest at Maturity:</span>
                                            <span className="font-semibold text-green-600">₹{totalInterest.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Value at Maturity:</span>
                                            <span className="font-semibold text-foreground">₹{totalValue.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Maturity Date:</span>
                                            <span className="font-semibold text-foreground">{format(investment.maturityDate.toDate(), 'dd MMM yyyy')}</span>
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="p-3 bg-accent/50 rounded-lg space-y-2 text-sm">
                                            <p className="font-medium">Live Growth ({ (investment.interestRate * 100).toFixed(2)}% p.a.)</p>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Live Interest Accrued:</span>
                                                <span className="font-semibold text-green-600">₹{liveInterestAccrued.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Live Total Value:</span>
                                                <span className="font-semibold text-foreground">₹{liveTotalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    )}

                                    <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
                                        <DialogTrigger asChild>
                                             <Button variant="destructive" className="w-full">Withdraw</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Early Withdrawal Confirmation</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                   {isPenaltyFree 
                                                        ? "You are within 7 days of maturity, so no penalty will be applied." 
                                                        : "Withdrawing early incurs a 1% penalty on the interest rate. Please review the details below."
                                                   }
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className="space-y-4 text-sm pt-4">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Principal Amount:</span>
                                                    <span className="font-semibold text-foreground">₹{principal.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Interest Earned (at { (penaltyRate * 100).toFixed(2)}%):</span>
                                                    <span className="font-semibold text-green-600">₹{penalizedInterestAccrued.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between font-bold">
                                                    <span className="text-foreground">Total Withdrawal Amount:</span>
                                                    <span className="text-foreground">₹{totalWithdrawalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleWithdraw(investment.id)}>Confirm Withdrawal</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </DialogContent>
                        </Dialog>
                    );
                }) : (
                    <Card className="text-center p-8">
                        <p className="text-muted-foreground">You have no active investments.</p>
                        <Button asChild className="mt-4">
                            <Link href="/fd-investment">Make an Investment</Link>
                        </Button>
                    </Card>
                )}
                {hasMoreActive && (
                    <div className="text-center">
                        <Button variant="outline" onClick={() => setVisibleActive(prev => prev + ITEMS_PER_PAGE)}>
                            Load More
                        </Button>
                    </div>
                )}
            </div>
          </main>
          <AppFooter />
        </div>
    );
}
