
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useData, UserDetails } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LineChart, Banknote, Bell } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useEffect, useState } from "react";
import AppHeader from "./app-header";
import AppFooter from "./app-footer";
import { Switch } from "./ui/switch";
import { checkNotificationPermission, requestNotificationPermission } from "@/lib/notifications";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be at most 15 digits"),
  occupation: z.string().min(2, "Occupation is required"),
  upiId: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
});

export default function UpdateProfilePage() {
  const { updateUserProfile, userDetails, updateNotificationPreference } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [currentUserDetails, setCurrentUserDetails] = useState<UserDetails | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    const getStatus = async () => {
        const status = await checkNotificationPermission();
        setNotificationStatus(status);
    };
    getStatus();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      occupation: "",
      upiId: "",
      accountNumber: "",
      accountHolderName: "",
    },
  });

  useEffect(() => {
    if (user && userDetails.length > 0) {
      const details = userDetails.find(d => d.userId === user.uid) || null;
      setCurrentUserDetails(details);
      if (details) {
        form.reset({
          phoneNumber: details.phoneNumber || "",
          occupation: details.occupation || "",
          upiId: details.upiId || "",
          accountNumber: details.accountNumber || "",
          accountHolderName: details.accountHolderName || "",
        });
      }
    }
  }, [user, userDetails, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      await updateUserProfile(user.uid, values);
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      router.push('/');
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  }

  const handleNotificationToggle = async (checked: boolean) => {
    if (!user) return;
    await updateNotificationPreference(user.uid, checked);
    const newStatus = await checkNotificationPermission();
    setNotificationStatus(newStatus);

    if(checked && newStatus === 'default') {
        await requestNotificationPermission(user.uid);
        const finalStatus = await checkNotificationPermission();
        setNotificationStatus(finalStatus);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
            <div className='flex justify-center items-center gap-2 mb-4'>
                <LineChart className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Update Your Profile</CardTitle>
            </div>
            <CardDescription>
                Keep your personal and bank details up to date.
            </CardDescription>
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
                        <Input placeholder="Your phone number" {...field} />
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
                        <Input placeholder="Your occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="bank-details">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Bank Details (Optional)</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="upiId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>UPI ID</FormLabel>
                                <FormControl>
                                <Input placeholder="your-upi@id" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                <Input placeholder="Your bank account number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Holder Name</FormLabel>
                                <FormControl>
                                <Input placeholder="Name as per bank records" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="notifications">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                <span className="font-semibold">Notifications</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                           <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Push Notifications</FormLabel>
                                    <FormDescription>
                                        Receive alerts about your account activity.
                                    </FormDescription>
                                </div>
                                <Switch
                                    checked={notificationStatus === 'granted'}
                                    onCheckedChange={handleNotificationToggle}
                                    disabled={notificationStatus === 'denied'}
                                />
                           </div>
                            {notificationStatus === 'denied' && (
                                <p className="text-xs text-destructive text-center">
                                    You have blocked notifications. To enable them, please update your browser settings for this site.
                                </p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
