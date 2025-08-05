
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const users = [
    {
        id: 1,
        name: "Ramesh Patel",
        email: "ramesh.patel@example.com",
        avatar: "/placeholder-user.jpg",
        joinDate: "2023-01-15",
        totalInvestment: "1,50,000",
        balance: "55,000",
        totalFDs: 3,
    },
    {
        id: 2,
        name: "Sunita Reddy",
        email: "sunita.reddy@example.com",
        avatar: "/placeholder-user.jpg",
        joinDate: "2023-02-20",
        totalInvestment: "2,75,000",
        balance: "75,000",
        totalFDs: 5,
    },
    {
        id: 3,
        name: "Vijay Verma",
        email: "vijay.verma@example.com",
        avatar: "/placeholder-user.jpg",
        joinDate: "2023-03-10",
        totalInvestment: "95,000",
        balance: "1,20,000",
        totalFDs: 2,
    },
    {
        id: 4,
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        avatar: "/placeholder-user.jpg",
        joinDate: "2023-04-05",
        totalInvestment: "5,00,000",
        balance: "30,000",
        totalFDs: 8,
    },
];

export default function UsersPage() {
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
                            {users.map((user) => (
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
                                                        <span className="font-semibold">₹{user.balance}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Total Investment:</span>
                                                        <span className="font-semibold">₹{user.totalInvestment}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Total FDs:</span>
                                                        <span className="font-semibold">{user.totalFDs}</span>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
