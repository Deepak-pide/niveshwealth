
"use client";

import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { LogOut, User as UserIcon, LayoutDashboard, Download, DownloadCloud } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useData } from "@/hooks/use-data";
import { format } from "date-fns";


export default function UserNav() {
    const { user, logout } = useAuth();
    const { investments, balanceHistory } = useData();
    const isMobile = useIsMobile();
    const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    if (!user) {
        return (
            <Link href="/login">
                <Button>Login</Button>
            </Link>
        )
    }

    const handleDownload = () => {
        if (!user) return;
        
        const userInvestments = investments
            .filter(inv => inv.userId === user.id)
            .map(inv => ({
                'Name': inv.name,
                'Amount': inv.amount,
                'Interest Rate': `${(inv.interestRate * 100).toFixed(2)}%`,
                'Start Date': format(inv.startDate.toDate(), 'yyyy-MM-dd'),
                'Maturity Date': format(inv.maturityDate.toDate(), 'yyyy-MM-dd'),
                'Status': inv.status,
            }));

        const userBalanceHistory = balanceHistory
            .filter(bh => bh.userId === user.id)
            .map(bh => ({
                'Date': format(bh.date.toDate(), 'yyyy-MM-dd'),
                'Description': bh.description,
                'Amount': bh.amount,
                'Type': bh.type,
            }));

        const wb = XLSX.utils.book_new();
        const wsInvestments = XLSX.utils.json_to_sheet(userInvestments);
        const wsBalanceHistory = XLSX.utils.json_to_sheet(userBalanceHistory);

        XLSX.utils.book_append_sheet(wb, wsInvestments, "Investments");
        XLSX.utils.book_append_sheet(wb, wsBalanceHistory, "Balance History");
        XLSX.writeFile(wb, "nivesh_data.xlsx");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                        <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {isAdmin ? (
                        <Link href="/admin">
                            <DropdownMenuItem>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </DropdownMenuItem>
                        </Link>
                    ) : (
                        
                            <Link href="/">
                                <DropdownMenuItem>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Home</span>
                                </DropdownMenuItem>
                            </Link>
                        
                    )}
                    
                        <DropdownMenuItem onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download Data</span>
                        </DropdownMenuItem>
                        <a href="/#" target="_blank" download>
                             <DropdownMenuItem>
                                <DownloadCloud className="mr-2 h-4 w-4" />
                                <span>Download App</span>
                            </DropdownMenuItem>
                        </a>
                    
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
