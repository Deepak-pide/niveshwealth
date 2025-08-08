
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/hooks/use-data";
import { format } from "date-fns";

export type RequestType = 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal' | 'FD Approved' | 'FD Withdrawal Approved' | 'Balance Top-up Approved' | 'Balance Withdrawal Approved' | 'FD Matured';

export type CombinedRequest = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    phoneNumber?: string;
    type: RequestType;
    amount: number;
    date: Date;
};

const HighlightedMessage = ({ text, request }: { text: string; request?: CombinedRequest | null }) => {
    if (!text) return null;
    
    const parts = text.split(/({[a-zA-Z]+})/).map((part, index) => {
        if (part.match(/({[a-zA-Z]+})/)) {
            const key = part.replace(/[{}]/g, '');
            let value = part; 
            if (request) {
                switch (key) {
                    case 'userName':
                        value = request.userName;
                        break;
                    case 'requestType':
                        value = request.type.replace(' Approved', '');
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

interface SendAlertDialogProps {
    request: CombinedRequest | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SendAlertDialog({ request, isOpen, onClose }: SendAlertDialogProps) {
    const { templates } = useData();
    const [alertMessage, setAlertMessage] = useState('');
    
    const isApproved = request?.type.includes('Approved') || request?.type.includes('Matured');
    const templateTypeToFind = isApproved ? request?.type : (request?.type as RequestType | undefined);


    useEffect(() => {
        if (request) {
            const relevantTemplates = templates.filter(t => t.type === templateTypeToFind || !t.type);
            const template = relevantTemplates.find(t => t.type === templateTypeToFind) || relevantTemplates.find(t => !t.type) || null;

            let message = '';
            if (template) {
                message = template.message;
            }
            setAlertMessage(message);
        }
    }, [request, templates, templateTypeToFind]);


    const handleSendFinalAlert = () => {
        if (!request) return;

        let finalMessage = alertMessage
            .replace(/{userName}/g, request.userName)
            .replace(/{requestType}/g, request.type.replace(' Approved', ''))
            .replace(/{amount}/g, `₹${request.amount.toLocaleString('en-IN')}`)
            .replace(/{date}/g, format(request.date, 'PPP'));

        const encodedMessage = encodeURIComponent(finalMessage);
        
        const cleanPhoneNumber = request.phoneNumber ? request.phoneNumber.replace(/\D/g, '') : '';

        const whatsappUrl = cleanPhoneNumber
            ? `https://wa.me/91${cleanPhoneNumber}?text=${encodedMessage}`
            : `https://wa.me/?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        onClose();
        setAlertMessage('');
    };

    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compose and Send Message</DialogTitle>
                    <DialogDescription>
                        To: {request.userName} ({request.phoneNumber || 'No number'})
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
                        <HighlightedMessage text={alertMessage} request={request} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSendFinalAlert}>Send Message</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
