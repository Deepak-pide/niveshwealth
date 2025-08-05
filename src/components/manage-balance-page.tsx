
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

export default function ManageBalancePage() {
    const [interestRate, setInterestRate] = useState(6);
    const { 
        topupRequests, 
        balanceWithdrawalRequests, 
        userBalances, 
        approveTopupRequest, 
        rejectTopupRequest, 
        approveBalanceWithdrawalRequest,
        rejectBalanceWithdrawalRequest,
        payInterestToAll 
    } = useData();
    const { toast } = useToast();
    const [visibleTopups, setVisibleTopups] = useState(ITEMS_PER_PAGE);
    const [visibleWithdrawals, setVisibleWithdrawals] = useState(ITEMS_PER_PAGE);
    const [visibleUsers, setVisibleUsers] = useState(ITEMS_PER_PAGE);

    const calculateMonthlyInterest = (balance: number, annualRate: number) => {
        const monthlyRate = annualRate / 12 / 100;
        return (balance * monthlyRate).toFixed(2);
    };

    const handleDownload = () => {
        const title = "USER BALANCES";
        const flattenedData = userBalances.map((user, index) => ({
            'Sno': index + 1,
            'User': user.userName,
            'Amount': `₹${user.balance.toLocaleString('en-IN')}`,
        }));

        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });
        XLSX.utils.sheet_add_json(worksheet, flattenedData, { origin: "A2", skipHeader: false });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Balances");
        XLSX.writeFile(workbook, "user_balances.xlsx");
    };

    const handlePayInterest = () => {
        payInterestToAll(interestRate);
        toast({
            title: "Interest Paid",
            description: `Monthly interest at ${interestRate}% p.a. has been paid to all users.`,
        });
    }
    
    const visibleTopupRequests = topupRequests.slice(0, visibleTopups);
    const hasMoreTopups = topupRequests.length > visibleTopups;
    
    const visibleBalanceWithdrawalRequests = balanceWithdrawalRequests.slice(0, visibleWithdrawals);
    const hasMoreWithdrawals = balanceWithdrawalRequests.length > visibleWithdrawals;

    const visibleUserBalances = userBalances.slice(0, visibleUsers);
    const hasMoreUsers = userBalances.length > visibleUsers;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage Balances</h1>
                <p className="text-muted-foreground">Approve balance requests and manage user interest payments.</p>
            </header>

            <Tabs defaultValue="topups">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="topups">Top-Up Requests</TabsTrigger>
                    <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
                    <TabsTrigger value="users">User Balances</TabsTrigger>
                </TabsList>
                <TabsContent value="topups">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Top-Up Requests</CardTitle>
                            <CardDescription>Review and process pending balance addition requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleTopupRequests.length > 0 ? visibleTopupRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={req.userAvatar} />
                                                        <AvatarFallback>{req.userName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{req.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{req.date}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => rejectTopupRequest(req.id)}>Reject</Button>
                                                <Button size="sm" onClick={() => approveTopupRequest(req.id)}>Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center">No pending top-up requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                             {hasMoreTopups && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleTopups(prev => prev + ITEMS_PER_PAGE)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="withdrawals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Withdrawal Requests</CardTitle>
                            <CardDescription>Review and process pending balance withdrawal requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleBalanceWithdrawalRequests.length > 0 ? visibleBalanceWithdrawalRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={req.userAvatar} />
                                                        <AvatarFallback>{req.userName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{req.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{req.date}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => rejectBalanceWithdrawalRequest(req.id)}>Reject</Button>
                                                <Button size="sm" onClick={() => approveBalanceWithdrawalRequest(req.id)}>Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center">No pending withdrawal requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                             {hasMoreWithdrawals && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleWithdrawals(prev => prev + ITEMS_PER_PAGE)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>User Balances</CardTitle>
                                <CardDescription>View all user balances and pay monthly interest.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>Pay Interest</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Pay Monthly Interest</DialogTitle>
                                            <DialogDescription>Set the annual interest rate and confirm to pay all eligible users for the month.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="flex items-center gap-4">
                                                <Label htmlFor="interest-rate" className="w-40">Annual Interest Rate (% p.a.)</Label>
                                                <Input
                                                    id="interest-rate"
                                                    type="number"
                                                    value={interestRate}
                                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>User</TableHead>
                                                            <TableHead>Current Balance</TableHead>
                                                            <TableHead className="text-right">Interest to Pay</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {userBalances.map((user) => (
                                                            <TableRow key={user.id}>
                                                                <TableCell className="font-medium">{user.userName}</TableCell>
                                                                <TableCell>₹{user.balance.toLocaleString('en-IN')}</TableCell>
                                                                <TableCell className="text-right font-semibold text-green-600">
                                                                    +₹{calculateMonthlyInterest(user.balance, interestRate)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={handlePayInterest}>Confirm Payment</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button onClick={handleDownload} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Excel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleUserBalances.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.userAvatar} />
                                                        <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{user.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">₹{user.balance.toLocaleString('en-IN')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {hasMoreUsers && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleUsers(prev => prev + ITEMS_PER_PAGE)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    
