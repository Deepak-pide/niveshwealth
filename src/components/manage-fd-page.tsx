
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download } from "lucide-react";
import { differenceInYears, parseISO, format } from 'date-fns';
import { useData } from "@/hooks/use-data";


export default function ManageFdPage() {
    const { fdRequests, investments, users, approveFdRequest, rejectFdRequest } = useData();

    const userInvestments = users.map(user => {
        const userFDs = investments.filter(inv => inv.userId === user.id);
        const totalInvestment = userFDs.reduce((acc, fd) => acc + fd.amount, 0);
        return {
            id: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            totalInvestment: totalInvestment,
            activeFDs: userFDs.filter(fd => fd.status === 'Active')
        }
    });

    const handleDownload = () => {
        const title = "USER INVESTMENTS";
        const flattenedData = investments.map(fd => {
            const user = users.find(u => u.id === fd.userId);
            const startDate = parseISO(fd.startDate);
            const maturityDate = parseISO(fd.maturityDate);
            const years = differenceInYears(maturityDate, startDate);
            const totalValue = fd.amount * (1 + fd.interestRate * years);

            return {
                'User': user ? user.name : 'Unknown',
                'Amount': `₹${fd.amount.toLocaleString('en-IN')}`,
                'Year': years,
                'Maturity Date': format(maturityDate, 'yyyy-MM-dd'),
                'Total Value': `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            };
        });

        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });
        XLSX.utils.sheet_add_json(worksheet, flattenedData, { origin: "A2", skipHeader: false });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Investments");
        XLSX.writeFile(workbook, "user_investments.xlsx");
    };


    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage FDs</h1>
                <p className="text-muted-foreground">Approve, reject, and view all fixed deposits.</p>
            </header>

            <Tabs defaultValue="requests">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="requests">FD Requests</TabsTrigger>
                    <TabsTrigger value="users">User Investments</TabsTrigger>
                </TabsList>
                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>FD Requests</CardTitle>
                            <CardDescription>Review and process pending FD investment and withdrawal requests.</CardDescription>
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
                                    {fdRequests.length > 0 ? fdRequests.map((req) => (
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
                                                <Badge variant={req.type === 'Investment' ? 'default' : 'destructive'}>{req.type}</Badge>
                                            </TableCell>
                                            <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{req.date}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Reject</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the investment request.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => rejectFdRequest(req.id)}>Confirm</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <Button size="sm" onClick={() => approveFdRequest(req.id)}>Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={5} className="text-center">No pending requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>User Investments</CardTitle>
                                <CardDescription>View total FD investments by user and their active FDs.</CardDescription>
                            </div>
                             <Button onClick={handleDownload} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download Excel
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Total Investment</TableHead>
                                        <TableHead className="text-right">View FDs</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userInvestments.map((user) => (
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
                                            <TableCell>₹{user.totalInvestment.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" disabled={user.activeFDs.length === 0}>View</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{user.userName}'s Active FDs</AlertDialogTitle>
                                                        </AlertDialogHeader>
                                                        <div className="py-4">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>FD Name</TableHead>
                                                                        <TableHead>Amount</TableHead>
                                                                        <TableHead>Maturity</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {user.activeFDs.map(fd => (
                                                                        <TableRow key={fd.id}>
                                                                            <TableCell>{fd.name}</TableCell>
                                                                            <TableCell>₹{fd.amount.toLocaleString('en-IN')}</TableCell>
                                                                            <TableCell>{format(parseISO(fd.maturityDate), 'dd MMM yyyy')}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                        <AlertDialogFooter>
                                                            <AlertDialogAction>Close</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
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
