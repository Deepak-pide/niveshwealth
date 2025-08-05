
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

const balanceRequests = [
    { id: 1, userName: "Ramesh Patel", userAvatar: "/placeholder-user.jpg", type: "Add", amount: "10,000", date: "2024-07-31" },
    { id: 2, userName: "Sunita Reddy", userAvatar: "/placeholder-user.jpg", type: "Withdraw", amount: "5,000", date: "2024-07-30" },
    { id: 3, userName: "Vijay Verma", userAvatar: "/placeholder-user.jpg", type: "Add", amount: "20,000", date: "2024-07-29" },
];

const userBalances = [
    { id: 1, userName: "Ramesh Patel", userAvatar: "/placeholder-user.jpg", balance: 55000 },
    { id: 2, userName: "Sunita Reddy", userAvatar: "/placeholder-user.jpg", balance: 75000 },
    { id: 3, userName: "Vijay Verma", userAvatar: "/placeholder-user.jpg", balance: 120000 },
    { id: 4, userName: "Priya Sharma", userAvatar: "/placeholder-user.jpg", balance: 30000 },
];

export default function ManageBalancePage() {
    const [interestRate, setInterestRate] = useState(6);

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


    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage Balances</h1>
                <p className="text-muted-foreground">Approve balance requests and manage user interest payments.</p>
            </header>

            <Tabs defaultValue="requests">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="requests">Balance Requests</TabsTrigger>
                    <TabsTrigger value="users">User Balances</TabsTrigger>
                </TabsList>
                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Requests</CardTitle>
                            <CardDescription>Review and process pending balance addition and withdrawal requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {balanceRequests.map((req) => (
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
                                            <TableCell>
                                                <Badge variant={req.type === 'Add' ? 'default' : 'destructive'}>{req.type}</Badge>
                                            </TableCell>
                                            <TableCell>₹{req.amount}</TableCell>
                                            <TableCell>{req.date}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm">Reject</Button>
                                                <Button size="sm">Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                                            <Button type="submit">Confirm Payment</Button>
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
                                    {userBalances.map((user) => (
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
