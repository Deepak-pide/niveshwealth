
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const balanceHistory = [
    {
        date: "2024-07-28",
        description: "Added to wallet",
        amount: "5,000.00",
        type: "Credit"
    },
    {
        date: "2024-07-27",
        description: "FD Investment",
        amount: "50,000.00",
        type: "Debit"
    },
    {
        date: "2024-07-25",
        description: "Added to wallet",
        amount: "60,000.00",
        type: "Credit"
    },
];

export default function MyBalancePage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold tracking-tight text-foreground">₹1,23,456.78</p>
                    </CardContent>
                    <CardFooter>
                        <Button>Add Balance</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Balance History</CardTitle>
                        <CardDescription>A record of your recent transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {balanceHistory.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.date}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={item.type === 'Credit' ? 'default' : 'destructive'}>
                                                {item.type === 'Credit' ? '+' : '-'}₹{item.amount}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
