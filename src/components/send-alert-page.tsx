
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
        balanceHistory
    } = useData();

    const [selectedRequest, setSelectedRequest] = useState<CombinedRequest | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleSendAlert = (request: CombinedRequest) => {
        setSelectedRequest(request);
        setIsAlertOpen(true);
    };

    const allRequests: CombinedRequest[] = useMemo(() => {
        const pendingFD = investmentRequests.map(r => ({ ...r, type: 'FD Investment', date: r.date.toDate() })) as unknown as CombinedRequest[];
        const pendingFDWithdraw = fdWithdrawalRequests.map(r => ({ ...r, type: 'FD Withdrawal', date: r.date.toDate() })) as unknown as CombinedRequest[];
        const pendingTopup = topupRequests.map(r => ({ ...r, type: 'Balance Top-up', date: r.date.toDate() })) as unknown as CombinedRequest[];
        const pendingBalanceWithdraw = balanceWithdrawalRequests.map(r => ({ ...r, type: 'Balance Withdrawal', date: r.date.toDate() })) as unknown as CombinedRequest[];

        const approvedFD = investments
            .filter(inv => inv.status === 'Active')
            .map(inv => ({...inv, type: 'FD Approved' as const, date: inv.startDate.toDate() }));
            
        const approvedFDWithdrawal = investments
            .filter(inv => inv.status === 'Withdrawn')
            .map(inv => ({...inv, type: 'FD Withdrawal Approved' as const, date: inv.maturityDate.toDate() }));

        const approvedBalanceTopup = balanceHistory
            .filter(h => h.description === 'Added to wallet')
            .map(h => ({ ...h, type: 'Balance Top-up Approved' as const, date: h.date.toDate() }));

        const approvedBalanceWithdrawal = balanceHistory
            .filter(h => h.description === 'Withdrawn from wallet')
            .map(h => ({ ...h, type: 'Balance Withdrawal Approved' as const, date: h.date.toDate() }));
        
        const maturedFDs = investments
            .filter(inv => inv.status === 'Matured')
            .map(inv => ({ ...inv, type: 'FD Matured' as const, date: inv.maturityDate.toDate() }));

        const combined = [
            ...pendingFD,
            ...pendingFDWithdraw,
            ...pendingTopup,
            ...pendingBalanceWithdraw,
            ...approvedFD,
            ...approvedFDWithdrawal,
            ...approvedBalanceTopup,
            ...approvedBalanceWithdrawal,
            ...maturedFDs
        ].sort((a, b) => b.date.getTime() - a.date.getTime());
        
        return combined as CombinedRequest[];

    }, [investmentRequests, fdWithdrawalRequests, topupRequests, balanceWithdrawalRequests, investments, balanceHistory]);

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
                                        <TableCell>{req.type.replace(' Approved', '').replace('Matured', 'FD Matured')}</TableCell>
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
