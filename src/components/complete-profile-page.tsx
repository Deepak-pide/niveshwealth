
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useData } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
    address: z.string().min(5, "Address is too short"),
    occupation: z.string().min(2, "Occupation is too short"),
    panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format"),
    aadharCard: z.string().regex(/^[0-9]{12}$/, "Invalid Aadhar card format (12 digits)"),
    document: z.instanceof(File).optional(),
});

export default function CompleteProfilePage() {
    const { user } = useAuth();
    const { addProfileCompletionRequest } = useData();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            phoneNumber: "",
            address: "",
            occupation: "",
            panCard: "",
            aadharCard: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        if (!user) {
            toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            await addProfileCompletionRequest(values);
            toast({ title: "Profile Submitted", description: "Your profile details have been submitted for verification." });
            router.push("/");
        } catch (error) {
            toast({ title: "Submission Failed", description: "An error occurred while submitting your profile.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 flex justify-center animate-fade-in">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>Please fill in your details for verification.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="panCard"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PAN Card Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your PAN number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="aadharCard"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aadhar Card Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your 12-digit Aadhar number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="document"
                                render={({ field: { onChange, value, ...rest } }) => (
                                    <FormItem>
                                        <FormLabel>Upload Document (Optional)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="file" 
                                                onChange={(e) => onChange(e.target.files ? e.target.files[0] : undefined)} 
                                                {...rest}
                                             />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit for Verification
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
