
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Wallet } from "lucide-react";

export default function AdminPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to the admin dashboard.</p>
                </header>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total FD
                            </CardTitle>
                             <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹12,50,000</div>
                            <p className="text-xs text-muted-foreground">
                                +15% from last month
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Balance
                            </CardTitle>
                             <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹5,48,590</div>
                             <p className="text-xs text-muted-foreground">
                                +18.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
