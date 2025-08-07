
"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Download, Percent, Wallet, CheckCircle } from "lucide-react";
import { differenceInYears, format } from 'date-fns';
import { useData } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { SendAlertDialog, CombinedRequest } from './send-alert-dialog';


const ITEMS_PER_PAGE = 10;

const ActiveFdsDialog = ({ user, fds }: { user: any; fds: any[] }) => (
    <DialogContent className="max-w-2xl">
        <DialogHeader>
            <DialogTitle>{user.userName}'s Active FDs</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>FD Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Maturity</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fds.map(fd => (
                        <TableRow key={fd.id}>
                            <TableCell>{fd.name}</TableCell>
                            <TableCell>₹{fd.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>{format(fd.maturityDate.toDate(), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{fd.description || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button>Close</Button>
            </DialogClose>
        </DialogFooter>
    </DialogContent>
);


export default function ManageFdPage() {
    const { 
        investmentRequests,
        fdWithdrawalRequests,
        maturedFdRequests,
        investments, 
        users, 
        approveInvestmentRequest, 
        rejectInvestmentRequest,
        approveFdWithdrawalRequest,
        rejectFdWithdrawalRequest,
        approveMaturedFdRequest,
        setFdInterestRatesForTenures,
        fdTenureRates,
        getUserPhoneNumber,
    } = useData();
    const { user: adminUser } = useAuth();
    const { toast } = useToast();

    const [visibleInvestmentReqs, setVisibleInvestmentReqs] = useState(ITEMS_PER_PAGE);
    const [visibleWithdrawalReqs, setVisibleWithdrawalReqs] = useState(ITEMS_PER_PAGE);
    const [visibleMaturedReqs, setVisibleMaturedReqs] = useState(ITEMS_PER_PAGE);
    const [visibleUsers, setVisibleUsers] = useState(ITEMS_PER_PAGE);
    
    const [tenureRates, setTenureRates] = useState<{[key: number]: string}>({
        1: (fdTenureRates['1'] * 100).toString(),
        2: (fdTenureRates['2'] * 100).toString(),
        3: (fdTenureRates['3'] * 100).toString(),
        4: (fdTenureRates['4'] * 100).toString(),
        5: (fdTenureRates['5'] * 100).toString(),
    });

    const [selectedRequest, setSelectedRequest] = useState<CombinedRequest | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedUserForFds, setSelectedUserForFds] = useState<any>(null);
    const [isFdsDialogOpen, setIsFdsDialogOpen] = useState(false);

    const handleApproval = async (action: () => Promise<any>, requestData: any, type: CombinedRequest['type']) => {
        const approvedRequest = await action();
        if (approvedRequest) {
            const phoneNumber = getUserPhoneNumber(approvedRequest.userId);
            setSelectedRequest({ ...approvedRequest, type, date: new Date(approvedRequest.date.seconds * 1000), phoneNumber });
            setIsAlertOpen(true);
        }
    };


    React.useEffect(() => {
        setTenureRates({
            1: ((fdTenureRates['1'] || 0) * 100).toString(),
            2: ((fdTenureRates['2'] || 0) * 100).toString(),
            3: ((fdTenureRates['3'] || 0) * 100).toString(),
            4: ((fdTenureRates['4'] || 0) * 100).toString(),
            5: ((fdTenureRates['5'] || 0) * 100).toString(),
        });
    }, [fdTenureRates]);


    const userInvestments = users.map(user => {
        const userFDs = investments.filter(inv => inv.userId === user.id);
        const totalInvestment = userFDs.reduce((acc, fd) => acc + fd.amount, 0);
        return {
            id: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            totalInvestment: totalInvestment,
            activeFDs: userFDs.filter(fd => fd.status === 'Active')
        }
    }).filter(user => user.totalInvestment > 0 && user.id !== adminUser?.uid)
      .sort((a, b) => b.totalInvestment - a.totalInvestment);

    const handleDownload = () => {
        const title = "USER INVESTMENTS";
        const flattenedData = investments.map(fd => {
            const user = users.find(u => u.id === fd.userId);
            const startDate = fd.startDate.toDate();
            const maturityDate = fd.maturityDate.toDate();
            const years = differenceInYears(maturityDate, startDate);
            const totalValue = fd.amount * (1 + fd.interestRate * years);

            return {
                'User': user ? user.name : 'Unknown',
                'Amount': `₹${fd.amount.toLocaleString('en-IN')}`,
                'Year': years,
                'Maturity Date': format(maturityDate, 'yyyy-MM-dd'),
                'Total Value': `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            };
        });

        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });
        XLSX.utils.sheet_add_json(worksheet, flattenedData, { origin: "A2", skipHeader: false });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Investments");
        const currentDate = format(new Date(), "dd_MM_yyyy");
        const fileName = `UserFD_${currentDate}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleSetTenureRates = async () => {
        const ratesToSet: {[key: number]: number} = {};
        for (const year in tenureRates) {
            const rate = parseFloat(tenureRates[year]);
            if (isNaN(rate) || rate < 0) {
                toast({
                    title: "Invalid Input",
                    description: `Please provide a valid interest rate for ${year} year(s).`,
                    variant: "destructive"
                });
                return;
            }
            ratesToSet[year] = rate / 100;
        }

        try {
            await setFdInterestRatesForTenures(ratesToSet);
            toast({
                title: "Success",
                description: `Interest rates for FD tenures have been updated.`
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };


    const visibleInvestmentRequests = investmentRequests.slice(0, visibleInvestmentReqs);
    const hasMoreInvestmentReqs = investmentRequests.length > visibleInvestmentReqs;
    
    const visibleFdWithdrawalRequests = fdWithdrawalRequests.slice(0, visibleWithdrawalReqs);
    const hasMoreFdWithdrawalReqs = fdWithdrawalRequests.length > visibleWithdrawalReqs;

    const visibleMaturedFdRequests = maturedFdRequests.slice(0, visibleMaturedReqs);
    const hasMoreMaturedFdReqs = maturedFdRequests.length > visibleMaturedReqs;

    const visibleUserInvestments = userInvestments.slice(0, visibleUsers);
    const hasMoreUsers = userInvestments.length > visibleUsers;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage FDs</h1>
                <p className="text-muted-foreground">Approve, reject, and view all fixed deposits.</p>
            </header>

            <Tabs defaultValue="investment-requests">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="investment-requests">Investment Requests</TabsTrigger>
                    <TabsTrigger value="withdrawal-requests">Withdrawal Requests</TabsTrigger>
                    <TabsTrigger value="maturity-requests">Maturity Approvals</TabsTrigger>
                    <TabsTrigger value="users">User Investments</TabsTrigger>
                </TabsList>
                <TabsContent value="investment-requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>FD Investment Requests</CardTitle>
                            <CardDescription>Review and process pending FD investment requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Years</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleInvestmentRequests.length > 0 ? visibleInvestmentRequests.map((req) => (
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
                                            <TableCell>{req.years}</TableCell>
                                            <TableCell>{req.date.toDate().toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {req.paymentMethod === 'balance' ? (
                                                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                                        <Wallet className="h-3 w-3" />
                                                        Balance
                                                    </Badge>
                                                ) : (
                                                    <Badge className="w-fit">UPI</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Reject</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the investment request.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => rejectInvestmentRequest(req.id)}>Confirm</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <Button size="sm" onClick={() => handleApproval(() => approveInvestmentRequest(req.id), req, 'FD Approved')}>Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={6} className="text-center">No pending investment requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                            {hasMoreInvestmentReqs && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleInvestmentReqs(prev => prev + ITEMS_PER_PAGE)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="withdrawal-requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>FD Withdrawal Requests</CardTitle>
                            <CardDescription>Review and process pending FD withdrawal requests.</CardDescription>
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
                                    {visibleFdWithdrawalRequests.length > 0 ? visibleFdWithdrawalRequests.map((req) => (
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
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Reject</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently reject the withdrawal request.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => rejectFdWithdrawalRequest(req.id)}>Confirm</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <Button size="sm" onClick={() => handleApproval(() => approveFdWithdrawalRequest(req.id), req, 'FD Withdrawal Approved')}>Accept</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center">No pending withdrawal requests.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                            {hasMoreFdWithdrawalReqs && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleWithdrawalReqs(prev => prev + ITEMS_PER_PAGE)}>
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="maturity-requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Matured FD Approvals</CardTitle>
                            <CardDescription>Approve matured FDs to credit the amount to the user's balance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Maturity Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleMaturedFdRequests.length > 0 ? visibleMaturedFdRequests.map((req) => (
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
                                                <Button size="sm" onClick={() => handleApproval(() => approveMaturedFdRequest(req.id), req, 'FD Matured')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Confirm Maturity
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center">No FDs pending maturity approval.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                            {hasMoreMaturedFdReqs && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" onClick={() => setVisibleMaturedReqs(prev => prev + ITEMS_PER_PAGE)}>
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
                                <CardTitle>User Investments</CardTitle>
                                <CardDescription>View total FD investments by user and their active FDs.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Percent className="mr-2 h-4 w-4" />
                                            Set Tenure Rates
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Set FD Interest Rates by Tenure</DialogTitle>
                                            <DialogDescription>
                                                Set the interest rate for FDs based on their duration in years.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            {Object.keys(tenureRates).map(year => (
                                                <div key={year} className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor={`interest-rate-${year}`} className="text-right">{year} Year(s)</Label>
                                                    <Input
                                                        id={`interest-rate-${year}`}
                                                        type="number"
                                                        placeholder="e.g., 9.5"
                                                        value={tenureRates[year as any]}
                                                        onChange={(e) => setTenureRates(prev => ({...prev, [year]: e.target.value}))}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="secondary">Cancel</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button onClick={handleSetTenureRates}>Set Rates</Button>
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
                                        <TableHead>Total Investment</TableHead>
                                        <TableHead className="text-right">View FDs</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleUserInvestments.map((user) => (
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
                                            <TableCell>₹{user.totalInvestment.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={user.activeFDs.length === 0}
                                                            onClick={() => {
                                                                setSelectedUserForFds(user);
                                                                setIsFdsDialogOpen(true);
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </DialogTrigger>
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
            </Tabs>
            <Dialog open={isFdsDialogOpen} onOpenChange={setIsFdsDialogOpen}>
                {selectedUserForFds && (
                    <ActiveFdsDialog
                        user={selectedUserForFds}
                        fds={selectedUserForFds.activeFDs}
                    />
                )}
            </Dialog>

            <SendAlertDialog
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                request={selectedRequest}
            />
        </div>
    );
}
