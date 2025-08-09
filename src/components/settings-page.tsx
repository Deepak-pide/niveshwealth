
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useData } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Palette } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useEffect, useState } from "react";
import AppHeader from "./app-header";
import AppFooter from "./app-footer";
import { Switch } from "./ui/switch";
import { checkNotificationPermission, requestNotificationPermission } from "@/lib/notifications";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsPage() {
    const { updateNotificationPreference } = useData();
    const { user } = useAuth();
    const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
    const { theme, setTheme } = useTheme();

    const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    useEffect(() => {
        const getStatus = async () => {
            const status = await checkNotificationPermission();
            setNotificationStatus(status);
        };
        getStatus();
    }, []);

    const handleNotificationToggle = async (checked: boolean) => {
        if (!user) return;
        
        if (checked) {
            const permission = await checkNotificationPermission();
            if (permission === 'default') {
                const newPermission = await requestNotificationPermission(user.uid);
                setNotificationStatus(newPermission);
                if (newPermission !== 'granted') {
                    // User denied or dismissed, so don't update preference in db
                    return;
                }
            } else if (permission === 'denied') {
                // Cannot request again, user must change in browser settings
                return;
            }
             await updateNotificationPreference(user.uid, true);
        } else {
             await updateNotificationPreference(user.uid, false);
        }
        // Re-check status after any change
        const finalStatus = await checkNotificationPermission();
        setNotificationStatus(finalStatus);
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <AppHeader />
            <main className="flex-1 overflow-y-auto flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Settings</CardTitle>
                        <CardDescription>
                            Manage your application preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full" defaultValue="appearance">
                            <AccordionItem value="appearance">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">Appearance</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <Label>Dark Mode</Label>
                                            <FormDescription>
                                                Enable or disable dark mode.
                                            </FormDescription>
                                        </div>
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        />
                                    </div>
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
                                            <Label>Push Notifications</Label>
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
                    </CardContent>
                </Card>
            </main>
            {!isAdmin && <AppFooter />}
        </div>
    );
}
