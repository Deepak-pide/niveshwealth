
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/hooks/use-data";
import Link from "next/link";
import { Check, X } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
    const { users, profileCompletionRequests, approveProfileCompletionRequest, rejectProfileCompletionRequest } = useData();
    const [visibleUsers, setVisibleUsers] = useState(ITEMS_PER_PAGE);
    const [visibleRequests, setVisibleRequests] = useState(ITEMS_PER_PAGE);

    const visibleUsersList = users.slice(0, visibleUsers);
    const hasMoreUsers = users.length > visibleUsers;

    const visibleRequestsList = profileCompletionRequests.slice(0, visibleRequests);
    const hasMoreRequests = profileCompletionRequests.length > visibleRequests;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground">Manage all users and profile verification requests.</p>
            </header>
            <Tabs defaultValue="all-users">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all-users">All Users</TabsTrigger>
                    <TabsTrigger value="profile-requests">Profile Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="all-users">
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
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Document:</span>
                                                                {user.documentUrl ? <Link href={user.documentUrl} target="_blank"><Button variant="link" size="sm">View Document</Button></Link> : <span className="font-semibold">N/A</span>}
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
                </TabsContent>
                <TabsContent value="profile-requests">
                     <Card>
                        <CardHeader>
                            <CardTitle>Profile Verification Requests</CardTitle>
                            <CardDescription>Review and approve user-submitted profile information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleRequestsList.length > 0 ? visibleRequestsList.map((req) => (
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
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">View Request</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Verification for {req.userName}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4 text-sm">
                                                             <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Phone:</span>
                                                                <span className="font-semibold">{req.phoneNumber}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Address:</span>
                                                                <span className="font-semibold">{req.address}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Occupation:</span>
                                                                <span className="font-semibold">{req.occupation}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">PAN:</span>
                                                                <span className="font-semibold">{req.panCard}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Aadhar:</span>
                                                                <span className="font-semibold">{req.aadharCard}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Document:</span>
                                                                {req.documentUrl ? <Link href={req.documentUrl} target="_blank"><Button variant="link" size="sm">View Document</Button></Link> : <span className="font-semibold">N/A</span>}
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="destructive" size="icon" onClick={() => rejectProfileCompletionRequest(req.id)}><X className="h-4 w-4" /></Button>
                                                <Button variant="default" size="icon" onClick={() => approveProfileCompletionRequest(req.id)}><Check className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center">No pending profile requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                             {hasMoreRequests && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleRequests(prev => prev + ITEMS_PER_PAGE)}>
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
