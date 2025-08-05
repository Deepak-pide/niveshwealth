
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const fdRequests = [
    { id: 1, userName: "Ravi Kumar", userAvatar: "/placeholder-user.jpg", type: "Investment", amount: "50,000", date: "2024-07-30" },
    { id: 2, userName: "Priya Sharma", userAvatar: "/placeholder-user.jpg", type: "Withdrawal", amount: "25,000", date: "2024-07-29" },
    { id: 3, userName: "Amit Singh", userAvatar: "/placeholder-user.jpg", type: "Investment", amount: "1,00,000", date: "2024-07-28" },
];

const userInvestments = [
    {
        id: 1,
        userName: "Ravi Kumar",
        userAvatar: "/placeholder-user.jpg",
        totalInvestment: "2,50,000",
        activeFDs: [
            { id: 101, name: "HDFC FD", amount: "1,00,000", maturityDate: "2028-08-15" },
            { id: 102, name: "SBI FD", amount: "1,50,000", maturityDate: "2029-07-24" },
        ]
    },
    {
        id: 2,
        userName: "Priya Sharma",
        userAvatar: "/placeholder-user.jpg",
        totalInvestment: "1,75,000",
        activeFDs: [
            { id: 201, name: "ICICI FD", amount: "1,75,000", maturityDate: "2027-01-10" },
        ]
    },
     {
        id: 3,
        userName: "Amit Singh",
        userAvatar: "/placeholder-user.jpg",
        totalInvestment: "3,00,000",
        activeFDs: [
            { id: 301, name: "Axis Bank FD", amount: "3,00,000", maturityDate: "2026-11-20" },
        ]
    },
];


export default function ManageFdPage() {
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
                                    {fdRequests.map((req) => (
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
                        <CardHeader>
                            <CardTitle>User Investments</CardTitle>
                            <CardDescription>View total FD investments by user and their active FDs.</CardDescription>
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
                                            <TableCell>₹{user.totalInvestment}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm">View</Button>
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
                                                                            <TableCell>₹{fd.amount}</TableCell>
                                                                            <TableCell>{fd.maturityDate}</TableCell>
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
