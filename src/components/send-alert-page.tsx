
"use client";

import React, { useMemo, useState } from 'react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { SendAlertDialog, CombinedRequest } from './send-alert-dialog';
import { Badge } from './ui/badge';
import { Send } from 'lucide-react';
import { ManageTemplatesDialog } from './manage-templates-dialog';

type RequestStatus = 'Pending' | 'Approved';

export default function SendAlertPage() {
    const { 
        investmentRequests, 
        fdWithdrawalRequests, 
        topupRequests, 
        balanceWithdrawalRequests, 
        investments,
        balanceHistory,
        maturedFdRequests,
        userDetails,
        users
    } = useData();

    const [selectedRequest, setSelectedRequest] = useState<CombinedRequest | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleSendAlert = (request: CombinedRequest) => {
        setSelectedRequest(request);
        setIsAlertOpen(true);
    };

    const allRequests: CombinedRequest[] = useMemo(() => {
        const getUserDetails = (userId: string) => {
            const user = users.find(u => u.id === userId);
            const detail = userDetails.find(ud => ud.userId === userId);
            return {
                name: user?.name || 'Unknown',
                avatar: user?.avatar || '',
                phoneNumber: detail?.phoneNumber
            };
        };

        const mapRequest = (req: any, type: CombinedRequest['type']): CombinedRequest => {
            const user = getUserDetails(req.userId);
            return {
                ...req,
                id: req.id,
                type,
                date: req.date?.toDate(),
                userName: user.name,
                userAvatar: user.avatar,
                phoneNumber: user.phoneNumber,
            };
        };
        
        const mapInvestment = (inv: any, type: CombinedRequest['type'], dateField: 'startDate' | 'maturityDate'): CombinedRequest => {
            const user = getUserDetails(inv.userId);
            return {
                ...inv,
                id: inv.id,
                type,
                date: inv[dateField]?.toDate(),
                userName: user.name,
                userAvatar: user.avatar,
                phoneNumber: user.phoneNumber,
            };
        };

        const mapHistory = (hist: any, type: CombinedRequest['type']): CombinedRequest => {
            const user = getUserDetails(hist.userId);
            return {
                ...hist,
                id: hist.id,
                type,
                date: hist.date?.toDate(),
                userName: user.name,
                userAvatar: user.avatar,
                phoneNumber: user.phoneNumber,
            };
        }

        const pendingFD = investmentRequests.map(r => mapRequest(r, 'FD Investment'));
        const pendingFDWithdraw = fdWithdrawalRequests.map(r => mapRequest(r, 'FD Withdrawal'));
        const pendingTopup = topupRequests.map(r => mapRequest(r, 'Balance Top-up'));
        const pendingBalanceWithdraw = balanceWithdrawalRequests.map(r => mapRequest(r, 'Balance Withdrawal'));

        const combined = [
            ...pendingFD,
            ...pendingFDWithdraw,
            ...pendingTopup,
            ...pendingBalanceWithdraw,
        ].filter(r => r.date)
         .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        return combined as CombinedRequest[];

    }, [investmentRequests, fdWithdrawalRequests, topupRequests, balanceWithdrawalRequests, userDetails, users]);

    return (
        <div className="container mx-auto p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Send Alerts</h1>
                    <p className="text-muted-foreground">Notify users about their request status.</p>
                </div>
                <ManageTemplatesDialog />
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>All User Requests &amp; Approvals</CardTitle>
                    <CardDescription>A unified list of all user activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allRequests.map((req) => {
                                const isApproved = req.type.includes('Approved') || req.type.includes('Matured');
                                const requestTypeDisplay = req.type.replace(' Approved', '').replace('Matured', 'FD Matured');

                                return (
                                    <TableRow key={`${req.id}-${req.type}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={req.userAvatar} />
                                                    <AvatarFallback>{req.userName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{req.userName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{req.phoneNumber || 'N/A'}</TableCell>
                                        <TableCell>{requestTypeDisplay}</TableCell>
                                        <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>{req.date.toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={isApproved ? "secondary" : "default"}>
                                                {isApproved ? "Approved" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleSendAlert(req)}>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Alert
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <SendAlertDialog
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                request={selectedRequest}
            />
        </div>
    );
}
