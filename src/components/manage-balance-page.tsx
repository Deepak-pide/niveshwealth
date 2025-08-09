
"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Settings, Save, UserX, UserCheck } from "lucide-react";
import { useData, UserBalance } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format, subMonths } from "date-fns";
import { SendAlertDialog, CombinedRequest } from './send-alert-dialog';
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

const ITEMS_PER_PAGE = 10;

const UserBalanceHistoryDialog = ({ isOpen, onOpenChange, user }: { isOpen: boolean, onOpenChange: (open: boolean) => void, user: UserBalance | null }) => {
    const { balanceHistory } = useData();

    if (!user) return null;

    const userHistory = balanceHistory.filter(h => h.userId === user.userId);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{user.userName}'s Balance History</DialogTitle>
                    <DialogDescription>Current Balance: <span className="font-bold text-foreground">₹{user.balance.toLocaleString('en-IN')}</span></DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userHistory.length > 0 ? userHistory.map((item) => {
                                const isInterest = item.description === 'Monthly Interest';
                                return (
                                    <TableRow key={item.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="font-medium">{format(item.date.toDate(), 'dd MMM yyyy')}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className={cn(
                                            "text-right font-semibold whitespace-nowrap",
                                            isInterest ? 'text-primary' : (item.type === 'Credit' ? 'text-green-600' : 'text-red-600')
                                        )}>
                                            {item.type === 'Credit' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No transaction history found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function ManageBalancePage() {
    const { 
        topupRequests, 
        balanceWithdrawalRequests, 
        userBalances, 
        balanceHistory,
        approveTopupRequest, 
        rejectTopupRequest, 
        approveBalanceWithdrawalRequest,
        rejectBalanceWithdrawalRequest,
        payInterestToAll,
        getUserPhoneNumber,
        users,
        interestOnAmount,
        calculateAndSetPreviousMonthBalance,
        calculateAndSetCurrentMonthBalance,
        excludedUserIds,
        toggleInterestExclusion,
    } = useData();
    const { toast } = useToast();
    const { user: adminUser } = useAuth();
    
    const [interestRate, setInterestRate] = useState(6);
    
    const [visibleTopups, setVisibleTopups] = useState(ITEMS_PER_PAGE);
    const [visibleWithdrawals, setVisibleWithdrawals] = useState(ITEMS_PER_PAGE);
    const [visibleUsers, setVisibleUsers] = useState(ITEMS_PER_PAGE);

    const [selectedRequest, setSelectedRequest] = useState<CombinedRequest | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedUserForHistory, setSelectedUserForHistory] = useState<UserBalance | null>(null);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playSound = () => {
        audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    };

    const handleApproval = async (action: () => Promise<any>, requestData: any, type: CombinedRequest['type']) => {
        const approvedRequest = await action();
        if (approvedRequest) {
            playSound();
            const phoneNumber = getUserPhoneNumber(approvedRequest.userId);
            setSelectedRequest({ ...approvedRequest, type, date: approvedRequest.date.toDate(), phoneNumber });
            setIsAlertOpen(true);
        }
    };
    
    const calculateMonthlyInterest = (balance: number, annualRate: number) => {
        if (balance <= 0) return '0.00';
        const monthlyRate = annualRate / 12 / 100;
        return (balance * monthlyRate).toFixed(2);
    };

    const getBalanceForInterest = (userId: string) => {
        const record = interestOnAmount.find(item => item.userId === userId);
        return record ? record.balance : 0;
    };


    const filteredUserBalances = userBalances
        .filter(user => user.balance > 0 && user.userId !== adminUser?.uid)
        .sort((a, b) => b.balance - a.balance);

    const handleDownload = () => {
        const title = "USER BALANCES";
        const flattenedData = filteredUserBalances.map((user, index) => ({
            'Sno': index + 1,
            'User': user.userName,
            'Amount': `₹${user.balance.toLocaleString('en-IN')}`,
        }));

        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });
        XLSX.utils.sheet_add_json(worksheet, flattenedData, { origin: "A2", skipHeader: false });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Balances");
        const currentDate = format(new Date(), "dd_MM_yyyy");
        const fileName = `UserBalance_${currentDate}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleConfirmSettings = () => {
        payInterestToAll(interestRate);
    }
    
    const visibleTopupRequests = topupRequests.slice(0, visibleTopups);
    const hasMoreTopups = topupRequests.length > visibleTopups;
    
    const visibleBalanceWithdrawalRequests = balanceWithdrawalRequests.slice(0, visibleWithdrawals);
    const hasMoreWithdrawals = balanceWithdrawalRequests.length > visibleWithdrawals;

    const visibleUserBalances = filteredUserBalances.slice(0, visibleUsers);
    const hasMoreUsers = filteredUserBalances.length > visibleUsers;

    const handleUserRowClick = (user: UserBalance) => {
        setSelectedUserForHistory(user);
        setIsHistoryDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
             <audio ref={audioRef} src="/admin_approval.mp3" preload="auto"></audio>
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage Balances</h1>
                <p className="text-muted-foreground">Approve balance requests and manage user interest payments.</p>
            </header>

            <Tabs defaultValue="topups">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="topups">Top-Up Requests</TabsTrigger>
                    <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
                    <TabsTrigger value="users">User Balances</TabsTrigger>
                </TabsList>
                <TabsContent value="topups">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Top-Up Requests</CardTitle>
                            <CardDescription>Review and process pending balance addition requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleTopupRequests.length > 0 ? visibleTopupRequests.map((req) => (
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
                                            <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{req.date.toDate().toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => rejectTopupRequest(req.id)}>Reject</Button>
                                                <Button size="sm" onClick={() => handleApproval(() => approveTopupRequest(req.id), req, 'Balance Top-up Approved')}>Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center">No pending top-up requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                             {hasMoreTopups && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleTopups(prev => prev + ITEMS_PER_PAGE)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="withdrawals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Withdrawal Requests</CardTitle>
                            <CardDescription>Review and process pending balance withdrawal requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleBalanceWithdrawalRequests.length > 0 ? visibleBalanceWithdrawalRequests.map((req) => (
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
                                            <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{req.date.toDate().toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => rejectBalanceWithdrawalRequest(req.id)}>Reject</Button>
                                                <Button size="sm" onClick={() => handleApproval(() => approveBalanceWithdrawalRequest(req.id), req, 'Balance Withdrawal Approved')}>Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center">No pending withdrawal requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                             {hasMoreWithdrawals && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleWithdrawals(prev => prev + ITEMS_PER_PAGE)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>User Balances</CardTitle>
                                <CardDescription>View all user balances and manage interest settings.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Manage Rates
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Manage Interest Rates</DialogTitle>
                                            <DialogDescription>Set interest rates and confirm to pay monthly interest to all eligible users.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-4">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium">Balance Interest</h4>
                                                     <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => calculateAndSetPreviousMonthBalance()}>
                                                            Use Previous Month's Balance
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => calculateAndSetCurrentMonthBalance()}>
                                                            Use Current Balance
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Label htmlFor="interest-rate" className="w-48">Monthly Payout Rate (% p.a.)</Label>
                                                    <Input
                                                        id="interest-rate"
                                                        type="number"
                                                        value={interestRate}
                                                        onChange={(e) => setInterestRate(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                                 <div className="max-h-48 overflow-y-auto rounded-md border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>User</TableHead>
                                                                <TableHead>Balance</TableHead>
                                                                <TableHead>Interest</TableHead>
                                                                <TableHead className="w-12"></TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {users.filter(u => getBalanceForInterest(u.id) > 0).map((user) => {
                                                                const balanceForInterest = getBalanceForInterest(user.id);
                                                                const isExcluded = excludedUserIds.includes(user.id);
                                                                return (
                                                                    <TableRow key={user.id} className={cn("group transition-opacity", isExcluded && "opacity-50")}>
                                                                        <TableCell className="font-medium">{user.name}</TableCell>
                                                                        <TableCell>₹{balanceForInterest.toLocaleString('en-IN')}</TableCell>
                                                                        <TableCell className="font-semibold text-green-600">
                                                                            +₹{calculateMonthlyInterest(balanceForInterest, interestRate)}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                onClick={() => toggleInterestExclusion(user.id)}
                                                                                title={isExcluded ? 'Include in interest payment' : 'Exclude from interest payment'}
                                                                            >
                                                                                {isExcluded ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="submit" onClick={handleConfirmSettings}>Confirm & Pay</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button onClick={handleDownload} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Excel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleUserBalances.map((user) => (
                                        <TableRow key={user.id} onClick={() => handleUserRowClick(user)} className="cursor-pointer">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.userAvatar} />
                                                        <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{user.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">₹{user.balance.toLocaleString('en-IN')}</TableCell>
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
            </Tabs>
            <SendAlertDialog
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                request={selectedRequest}
            />
            <UserBalanceHistoryDialog
                isOpen={isHistoryDialogOpen}
                onOpenChange={setIsHistoryDialogOpen}
                user={selectedUserForHistory}
            />
        </div>
    );
}
