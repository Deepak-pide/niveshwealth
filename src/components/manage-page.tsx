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
                <Link href="/investments">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">
                                Fixed Deposits
                            </CardTitle>
                            <Briefcase className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View and manage all user FDs.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/my-balance">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">
                                Balances
                            </CardTitle>
                            <Wallet className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View and manage user balances.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}