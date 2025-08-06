
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
    const { users } = useData();
    const [visibleUsers, setVisibleUsers] = useState(ITEMS_PER_PAGE);

    const visibleUsersList = users.slice(0, visibleUsers);
    const hasMoreUsers = users.length > visibleUsers;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground">Manage all registered users.</p>
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
                                <TableHead className="text-right">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleUsersList.map((user) => (
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
                                    <TableCell>{user.joinDate.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">View</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{user.name}'s Profile</DialogTitle>
                                                    <DialogDescription>{user.email}</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Phone:</span>
                                                        <span className="font-semibold">{user.phoneNumber || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Address:</span>
                                                        <span className="font-semibold">{user.address || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Occupation:</span>
                                                        <span className="font-semibold">{user.occupation || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">PAN:</span>
                                                        <span className="font-semibold">{user.panCard || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Aadhar:</span>
                                                        <span className="font-semibold">{user.aadharCard || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
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
        </div>
    );
}
