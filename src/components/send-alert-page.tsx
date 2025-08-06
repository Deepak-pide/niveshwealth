
"use client";

import { useState, useRef, useEffect }from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData, Template } from "@/hooks/use-data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Plus, MessageSquare, Info, Trash2, Code, Pencil } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { format } from "date-fns";


type RequestType = 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal';
type CombinedRequest = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    phoneNumber?: string;
    type: RequestType;
    amount: number;
    date: Date;
};

const ITEMS_PER_PAGE = 15;
const REQUEST_TYPES: (RequestType | 'General')[] = ['General', 'FD Investment', 'FD Withdrawal', 'Balance Top-up', 'Balance Withdrawal'];
const PLACEHOLDERS = ['{userName}', '{requestType}', '{amount}', '{date}'];


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
                    case 'date':
                        value = format(request.date, 'PPP');
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

    return <p className="text-sm text-muted-foreground p-2 bg-accent/50 rounded-md leading-relaxed whitespace-pre-wrap">{parts}</p>;
};


export default function SendAlertPage() {
    const {
        investmentRequests,
        fdWithdrawalRequests,
        topupRequests,
        balanceWithdrawalRequests,
        getUserPhoneNumber,
        templates,
        addTemplate,
        deleteTemplate,
        updateTemplate,
    } = useData();
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
    
    const [newTemplateTitle, setNewTemplateTitle] = useState('');
    const [newTemplateMessage, setNewTemplateMessage] = useState('');
    const [newTemplateType, setNewTemplateType] = useState<RequestType | 'General'>('General');
    const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);

    const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [editTemplateTitle, setEditTemplateTitle] = useState('');
    const [editTemplateMessage, setEditTemplateMessage] = useState('');
    const [editTemplateType, setEditTemplateType] = useState<RequestType | 'General'>('General');

    const [isEditAlertOpen, setIsEditAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentTarget, setCurrentTarget] = useState<CombinedRequest | null>(null);
    const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (editingTemplate) {
            setEditTemplateTitle(editingTemplate.title);
            setEditTemplateMessage(editingTemplate.message);
            setEditTemplateType(editingTemplate.type || 'General');
        }
    }, [editingTemplate]);


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

    const handleSendFinalAlert = (phoneNumber: string | undefined, message: string) => {
        let finalMessage = message;
        if (currentTarget) {
             finalMessage = message
                .replace(/{userName}/g, currentTarget.userName)
                .replace(/{requestType}/g, currentTarget.type)
                .replace(/{amount}/g, `₹${currentTarget.amount.toLocaleString('en-IN')}`)
                .replace(/{date}/g, format(currentTarget.date, 'PPP'));
        }

        const encodedMessage = encodeURIComponent(finalMessage);
        const whatsappUrl = phoneNumber
            ? `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`
            : `https://wa.me/?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        setIsEditAlertOpen(false);
        setAlertMessage('');
        setCurrentTarget(null);
    };

    const handleAddTemplate = () => {
        if (!newTemplateTitle || !newTemplateMessage) return;
        addTemplate({
            title: newTemplateTitle,
            message: newTemplateMessage,
            type: newTemplateType === 'General' ? undefined : newTemplateType
        });
        setNewTemplateTitle('');
        setNewTemplateMessage('');
        setNewTemplateType('General');
        setIsAddTemplateOpen(false);
    };

    const handleEditTemplate = () => {
        if (!editingTemplate || !editTemplateTitle || !editTemplateMessage) return;
        updateTemplate(editingTemplate.id, {
            title: editTemplateTitle,
            message: editTemplateMessage,
            type: editTemplateType === 'General' ? undefined : editTemplateType,
        });
        setIsEditTemplateOpen(false);
        setEditingTemplate(null);
    };

    const handleSendAlertClick = (req: CombinedRequest) => {
        const filteredTemplates = templates.filter(t => !t.type || t.type === req.type);
        const template = filteredTemplates.length > 0 ? filteredTemplates[0] : null;
        
        let message = '';
        if (template) {
            message = template.message
                .replace(/{userName}/g, req.userName)
                .replace(/{requestType}/g, req.type)
                .replace(/{amount}/g, `₹${req.amount.toLocaleString('en-IN')}`)
                .replace(/{date}/g, format(req.date, 'PPP'));
        }

        setAlertMessage(message);
        setCurrentTarget(req);
        setIsEditAlertOpen(true);
    };

    const handleInsertPlaceholder = (placeholder: string) => {
        const textarea = messageTextareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const newText = text.substring(0, start) + placeholder + text.substring(end);
            setAlertMessage(newText);
            
            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
            }, 0);
        }
    };
    
    const visibleRequests = combinedRequests.slice(0, visibleItems);
    const hasMore = combinedRequests.length > visibleItems;
    
    const placeholdersTooltip = (
        <p className="text-sm">
            Available placeholders:<br />
            {"{userName}"}, {"{requestType}"}, {"{amount}"}, {"{date}"}
        </p>
    );

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
                                                        <Label htmlFor="template-type">Template Type</Label>
                                                        <Select value={newTemplateType} onValueChange={(value: RequestType | 'General') => setNewTemplateType(value)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {REQUEST_TYPES.map(type => (
                                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Label htmlFor="template-message">Message</Label>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {placeholdersTooltip}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <Textarea id="template-message" value={newTemplateMessage} onChange={(e) => setNewTemplateMessage(e.target.value)} placeholder="Compose your message here..." />
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
                                        Manage your message templates. Click the '+' to add a new one.
                                    </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-96 pr-4">
                                    <div className="space-y-4">
                                        {templates.length > 0 ? templates.map(template => (
                                            <Card key={template.id} className="relative group">
                                                <CardHeader>
                                                    <CardTitle className="text-base flex justify-between items-center">
                                                        <span>{template.title}</span>
                                                        <Badge variant="outline">{template.type || 'General'}</Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <HighlightedMessage text={template.message} />
                                                </CardContent>
                                                <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7"
                                                        onClick={() => {
                                                            setEditingTemplate(template);
                                                            setIsEditTemplateOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7"
                                                        onClick={() => deleteTemplate(template.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        )) : (
                                            <p className="text-center text-muted-foreground py-8">No templates found. Click the '+' icon to create one.</p>
                                        )}
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSendAlertClick(req)}
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

                <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Template</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-template-title">Template Title</Label>
                                <Input id="edit-template-title" value={editTemplateTitle} onChange={(e) => setEditTemplateTitle(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-template-type">Template Type</Label>
                                <Select value={editTemplateType} onValueChange={(value: RequestType | 'General') => setEditTemplateType(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REQUEST_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-template-message">Message</Label>
                                <Textarea id="edit-template-message" value={editTemplateMessage} onChange={(e) => setEditTemplateMessage(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditTemplate}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditAlertOpen} onOpenChange={setIsEditAlertOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Compose and Send Message</DialogTitle>
                            <DialogDescription>
                                To: {currentTarget?.userName} ({currentTarget?.phoneNumber || 'No number'})
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                             <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <Label htmlFor="edit-message">Message</Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Code className="mr-2 h-4 w-4" />
                                                Dynamic Text
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {PLACEHOLDERS.map(placeholder => (
                                                <DropdownMenuItem key={placeholder} onSelect={() => handleInsertPlaceholder(placeholder)}>
                                                    {placeholder}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Textarea 
                                    id="edit-message"
                                    ref={messageTextareaRef}
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
                             <Button onClick={() => handleSendFinalAlert(currentTarget?.phoneNumber, alertMessage)}>Send Message</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}

