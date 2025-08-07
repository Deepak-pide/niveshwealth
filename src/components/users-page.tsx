
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useData, UserDetails, AppUser } from "@/hooks/use-data";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

const UserDetailsView = ({ isOpen, onOpenChange, user, details }: { isOpen: boolean, onOpenChange: (open: boolean) => void, user: AppUser, details: UserDetails | null }) => {
    const { updateUserProfile, updateUserName } = useData();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(details?.phoneNumber || '');
    const [occupation, setOccupation] = useState(details?.occupation || '');

    useEffect(() => {
        if(isOpen) {
            setName(user.name);
            setPhone(details?.phoneNumber || '');
            setOccupation(details?.occupation || '');
            setIsEditing(false); // Reset editing state when dialog opens
        }
    }, [isOpen, user, details]);

    const handleSaveChanges = async () => {
        try {
            if (name !== user.name) {
                await updateUserName(user.id, name);
            }
            if (phone !== (details?.phoneNumber || '') || occupation !== (details?.occupation || '')) {
                await updateUserProfile(user.id, { phoneNumber: phone, occupation: occupation });
            }
            toast({ title: "Success", description: "User profile updated successfully." });
            setIsEditing(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user.name}'s Profile</DialogTitle>
                    <DialogDescription>{user.email}</DialogDescription>
                </DialogHeader>
                 <div className="grid gap-4 py-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-semibold select-all">{user.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="name" className="text-muted-foreground">Name:</Label>
                        {isEditing ? (
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-3/4" />
                        ) : (
                            <span className="font-semibold">{name}</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="phone" className="text-muted-foreground">Phone:</Label>
                         {isEditing ? (
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-3/4" />
                        ) : (
                            <span className="font-semibold">{phone || 'N/A'}</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="occupation" className="text-muted-foreground">Occupation:</Label>
                         {isEditing ? (
                            <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-3/4" />
                        ) : (
                            <span className="font-semibold">{occupation || 'N/A'}</span>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </>
                    ) : (
                         <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    )}
                     {!isEditing && <Button onClick={() => setIsEditing(true)}>Update Profile</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function UsersPage() {
    const { users, userDetails } = useData();
    const [visibleUsers, setVisibleUsers] = useState(ITEMS_PER_PAGE);
    const [selectedUser, setSelectedUser] = useState<{ user: AppUser, details: UserDetails | null } | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openDialog = (user: AppUser, details: UserDetails | null) => {
        setSelectedUser({ user, details });
        setIsDialogOpen(true);
    }
    
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
                            {visibleUsersList.map((user) => {
                                const details = userDetails.find(ud => ud.userId === user.id) || null;
                                return (
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
                                            <Button variant="outline" size="sm" onClick={() => openDialog(user, details)}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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

            {selectedUser && (
                <UserDetailsView
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    user={selectedUser.user}
                    details={selectedUser.details}
                />
            )}
        </div>
    );
}

    