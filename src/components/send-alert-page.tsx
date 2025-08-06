
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SendAlertPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Placeholder for the actual alert sending logic
        console.log("Sending alert:", { title, message });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        toast({
            title: "Alert Sent",
            description: "The notification has been sent to all users.",
            variant: "success",
        });
        
        setTitle("");
        setMessage("");
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Send Alert</CardTitle>
                        <CardDescription>
                            Broadcast a notification to all users of the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="title">Title</Label>
                                <Input 
                                    type="text" 
                                    id="title" 
                                    placeholder="Enter alert title" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="message">Message</Label>
                                <Textarea 
                                    placeholder="Enter your message here." 
                                    id="message" 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required 
                                />
                            </div>
                             <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Alert to All Users"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
