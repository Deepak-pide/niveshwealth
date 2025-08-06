
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "@/hooks/use-data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Plus, MessageSquare } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import React from "react";


type CombinedRequest = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    phoneNumber?: string;
    type: 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal';
    amount: number;
    date: Date;
};

type Template = {
    id: string;
    title: string;
    message: string;
};

const ITEMS_PER_PAGE = 15;

const initialTemplates: Template[] = [
    {
        id: '1',
        title: 'Pending Request Reminder',
        message: 'Hello {userName}, this is a reminder regarding your {requestType} request for ₹{amount}. Please respond if you have any questions.'
    },
    {
        id: '2',
        title: 'Payment Confirmation',
        message: 'Hello {userName}, we have received your payment for the {requestType} of ₹{amount}. Your request is now being processed.'
    }
];

const HighlightedMessage = ({ text, request }: { text: string, request?: CombinedRequest | null }) => {
    const parts = text.split(/({[a-zA-Z]+})/).map((part, index) => {
        if (part.match(/({[a-zA-Z]+})/)) {
            const key = part.replace(/[{}]/g, '');
            let value = part; // Default to showing the placeholder
            if (request) {
                switch (key) {
                    case 'userName':
                        value = request.userName;
                        break;
                    case 'requestType':
                        value = request.type;
                        break;
                    case 'amount':
                        value = `₹${request.amount.toLocaleString('en-IN')}`;
                        break;
                }
            }
            return (
                <span key={index} className="bg-primary/20 text-primary font-medium rounded-sm px-1">
                    {value}
                </span>
            );
        }
        return part;
    });

    return <p className="text-sm text-muted-foreground p-2 bg-accent/50 rounded-md leading-relaxed">{parts}</p>;
};


export default function SendAlertPage() {
    const {
        investmentRequests,
        fdWithdrawalRequests,
        topupRequests,
        balanceWithdrawalRequests,
        getUserPhoneNumber,
    } = useData();
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [newTemplateTitle, setNewTemplateTitle] = useState('');
    const [newTemplateMessage, setNewTemplateMessage] = useState('');
    const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);

    const [isEditAlertOpen, setIsEditAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentTarget, setCurrentTarget] = useState<CombinedRequest | null>(null);


    const combinedRequests: CombinedRequest[] = [
        ...investmentRequests.map(req => ({
            id: req.id,
            userId: req.userId,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'FD Investment' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
        ...fdWithdrawalRequests.map(req => ({
            id: req.id,
            userId: req.userId,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'FD Withdrawal' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
        ...topupRequests.map(req => ({
            id: req.id,
            userId: req.userId,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'Balance Top-up' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
        ...balanceWithdrawalRequests.map(req => ({
            id: req.id,
            userId: req.userId,
            userName: req.userName,
            userAvatar: req.userAvatar,
            phoneNumber: getUserPhoneNumber(req.userId),
            type: 'Balance Withdrawal' as const,
            amount: req.amount,
            date: req.date.toDate(),
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const handleSendAlert = (phoneNumber: string | undefined, message: string) => {
        if (!phoneNumber) {
            alert("Phone number is not available for this user.");
            return;
        }
        let finalMessage = message;
        if (currentTarget) {
             finalMessage = message
                .replace('{userName}', currentTarget.userName)
                .replace('{requestType}', currentTarget.type)
                .replace('{amount}', currentTarget.amount.toLocaleString('en-IN'));
        }

        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(finalMessage)}`;
        window.open(whatsappUrl, '_blank');
        setIsEditAlertOpen(false);
        setAlertMessage('');
        setCurrentTarget(null);
    };

    const handleAddTemplate = () => {
        if (!newTemplateTitle || !newTemplateMessage) return;
        const newTemplate: Template = {
            id: Date.now().toString(),
            title: newTemplateTitle,
            message: newTemplateMessage
        };
        setTemplates(prev => [...prev, newTemplate]);
        setNewTemplateTitle('');
        setNewTemplateMessage('');
        setIsAddTemplateOpen(false);
    };

    const handleTemplateClick = (req: CombinedRequest, template: Template) => {
        setAlertMessage(template.message);
        setCurrentTarget(req);
        setIsEditAlertOpen(true);
    };

    const visibleRequests = combinedRequests.slice(0, visibleItems);
    const hasMore = combinedRequests.length > visibleItems;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Send Alert</CardTitle>
                            <CardDescription>
                                View pending requests and send alerts to users via WhatsApp.
                            </CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Templates
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center justify-between">
                                        <span>Message Templates</span>
                                         <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Add New Template</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="template-title">Template Title</Label>
                                                        <Input id="template-title" value={newTemplateTitle} onChange={(e) => setNewTemplateTitle(e.target.value)} placeholder="e.g., Request Reminder" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="template-message">Message</Label>
                                                        <Textarea id="template-message" value={newTemplateMessage} onChange={(e) => setNewTemplateMessage(e.target.value)} placeholder="Compose your message here..." />
                                                        <p className="text-xs text-muted-foreground">
                                                            Use placeholders: {"{userName}"}, {"{requestType}"}, {"{amount}"}
                                                        </p>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Preview</Label>
                                                        <HighlightedMessage text={newTemplateMessage} />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsAddTemplateOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleAddTemplate}>Save Template</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Manage your message templates.
                                    </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-96 pr-4">
                                    <div className="space-y-4">
                                        {templates.map(template => (
                                            <Card key={template.id}>
                                                <CardHeader>
                                                    <CardTitle className="text-base">{template.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <HighlightedMessage text={template.message} />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
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
                                    <TableRow key={`${req.type}-${req.id}`}>
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={!req.phoneNumber}
                                                    >
                                                        Send Alert
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {templates.map(template => (
                                                        <DropdownMenuItem 
                                                            key={template.id}
                                                            onClick={() => handleTemplateClick(req, template)}
                                                        >
                                                            {template.title}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

                <Dialog open={isEditAlertOpen} onOpenChange={setIsEditAlertOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit and Send Message</DialogTitle>
                            <DialogDescription>
                                To: {currentTarget?.userName} ({currentTarget?.phoneNumber})
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                             <div className="grid gap-2">
                                <Label htmlFor="edit-message">Message</Label>
                                <Textarea 
                                    id="edit-message"
                                    value={alertMessage} 
                                    onChange={(e) => setAlertMessage(e.target.value)} 
                                    className="min-h-[120px]"
                                />
                            </div>
                             <div className="grid gap-2">
                                <Label>Preview</Label>
                                <HighlightedMessage text={alertMessage} request={currentTarget} />
                            </div>
                        </div>
                        <DialogFooter>
                             <Button variant="outline" onClick={() => setIsEditAlertOpen(false)}>Cancel</Button>
                             <Button onClick={() => handleSendAlert(currentTarget?.phoneNumber, alertMessage)}>Send Message</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}

    
