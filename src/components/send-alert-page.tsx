
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/hooks/use-data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

type CombinedRequest = {
    id: string;
    userName: string;
    userAvatar: string;
    phoneNumber?: string;
    type: 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal';
    amount: number;
    date: Date;
};

const ITEMS_PER_PAGE = 15;

export default function SendAlertPage() {
    const {
        investmentRequests,
        fdWithdrawalRequests,
        topupRequests,
        balanceWithdrawalRequests,
        getUserPhoneNumber,
    } = useData();
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);


    const combinedRequests: CombinedRequest[] = [
        ...investmentRequests.map(req => ({
            id: req.id,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'FD Investment' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
        ...fdWithdrawalRequests.map(req => ({
            id: req.id,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'FD Withdrawal' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
        ...topupRequests.map(req => ({
            id: req.id,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'Balance Top-up' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
        ...balanceWithdrawalRequests.map(req => ({
            id: req.id,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'Balance Withdrawal' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const handleSendAlert = (phoneNumber: string | undefined, userName: string, requestType: string, amount: number) => {
        if (!phoneNumber) {
            alert("Phone number is not available for this user.");
            return;
        }

        const message = encodeURIComponent(`Hello ${userName}, this is a reminder regarding your ${requestType} request for ₹${amount}.`);
        // Assumes phone number is in a format compatible with WhatsApp, may need country code.
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const visibleRequests = combinedRequests.slice(0, visibleItems);
    const hasMore = combinedRequests.length > visibleItems;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Requests</CardTitle>
                        <CardDescription>
                            A list of all pending user requests. Click "Send Alert" to notify the user on WhatsApp.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Request Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleRequests.length > 0 ? visibleRequests.map((req) => (
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
                                        <TableCell>{req.phoneNumber || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{req.type}</Badge>
                                        </TableCell>
                                        <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSendAlert(req.phoneNumber, req.userName, req.type, req.amount)}
                                                disabled={!req.phoneNumber}
                                            >
                                                Send Alert
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No pending requests.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                         {hasMore && (
                            <div className="pt-4 text-center">
                                <Button variant="outline" onClick={() => setVisibleItems(prev => prev + ITEMS_PER_PAGE)}>
                                    Load More
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
