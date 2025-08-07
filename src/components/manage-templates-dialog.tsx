
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useData, Template } from "@/hooks/use-data";
import { useToast } from "./use-toast";
import { Pencil, PlusCircle, Settings, Trash2 } from "lucide-react";

type RequestType = 'FD Investment' | 'FD Withdrawal' | 'Balance Top-up' | 'Balance Withdrawal' | 'FD Approved' | 'FD Withdrawal Approved' | 'Balance Top-up Approved' | 'Balance Withdrawal Approved' | 'FD Matured';
const requestTypes: RequestType[] = ['FD Investment', 'FD Withdrawal', 'Balance Top-up', 'Balance Withdrawal', 'FD Approved', 'FD Withdrawal Approved', 'Balance Top-up Approved', 'Balance Withdrawal Approved', 'FD Matured'];

export function ManageTemplatesDialog() {
    const { templates, addTemplate, updateTemplate, deleteTemplate } = useData();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<RequestType | 'General'>('General');

    const openNewForm = () => {
        setEditingTemplate(null);
        setTitle('');
        setMessage('');
        setType('General');
        setIsFormOpen(true);
    };

    const openEditForm = (template: Template) => {
        setEditingTemplate(template);
        setTitle(template.title);
        setMessage(template.message);
        setType(template.type || 'General');
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        if (!title || !message) {
            toast({ title: "Error", description: "Title and message are required.", variant: "destructive" });
            return;
        }

        const templateData = { title, message, type: type === 'General' ? undefined : type };

        if (editingTemplate) {
            await updateTemplate(editingTemplate.id, templateData);
        } else {
            await addTemplate(templateData);
        }
        setIsFormOpen(false);
    };

    const handleDelete = async (templateId: string) => {
        await deleteTemplate(templateId);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><Settings className="mr-2 h-4 w-4" />Manage Templates</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Manage Message Templates</DialogTitle>
                    <DialogDescription>
                        Create, edit, or delete templates for sending alerts. Use placeholders like {"{userName}"}, {"{requestType}"}, {"{amount}"}, and {"{date}"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-96 overflow-y-auto">
                    {templates.map(template => (
                        <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="space-y-1">
                                <p className="font-semibold">{template.title} <span className="text-xs font-normal text-muted-foreground">({template.type || 'General'})</span></p>
                                <p className="text-sm text-muted-foreground truncate max-w-md">{template.message}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditForm(template)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        </div>
                    ))}
                </div>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Title</Label>
                                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Select onValueChange={(value: any) => setType(value)} defaultValue={type}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        {requestTypes.map(rt => <SelectItem key={rt} value={rt}>{rt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="message" className="text-right">Message</Label>
                                <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Template</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <DialogFooter>
                    <Button onClick={openNewForm}><PlusCircle className="mr-2 h-4 w-4" />Create New Template</Button>
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
