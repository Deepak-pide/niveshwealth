
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/hooks/use-data";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
    const { users, investments, userBalances } = useData();
    const [visibleUsers, setVisibleUsers] = useState(ITEMS_PER_PAGE);

    const visibleUsersList = users.slice(0, visibleUsers);
    const hasMoreUsers = users.length > visibleUsers;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground">Manage all users in the system.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleUsersList.map((user) => {
                                const userInvestments = investments.filter(inv => inv.userId === user.id);
                                const totalInvestment = userInvestments.reduce((acc, inv) => acc + inv.amount, 0);
                                const userBalance = userBalances.find(bal => bal.userId === user.id)?.balance || 0;
                                const totalFDs = userInvestments.length;

                                return(
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.joinDate}</TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">View</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{user.name}'s Details</DialogTitle>
                                                    <DialogDescription>{user.email}</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Join Date:</span>
                                                        <span className="font-semibold">{user.joinDate}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Total Balance:</span>
                                                        <span className="font-semibold">₹{userBalance.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Total Investment:</span>
                                                        <span className="font-semibold">₹{totalInvestment.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Total FDs:</span>
                                                        <span className="font-semibold">{totalFDs}</span>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            )})}
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
        </div>
    );
}
