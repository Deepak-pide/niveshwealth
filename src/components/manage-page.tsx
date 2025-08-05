import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Wallet } from "lucide-react";
import Link from "next/link";

export default function ManagePage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage</h1>
                <p className="text-muted-foreground">Select a category to manage.</p>
            </header>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                
            </div>
        </div>
    );
}
