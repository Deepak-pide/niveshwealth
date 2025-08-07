
"use client";

import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { LogOut, User as UserIcon, LayoutDashboard, Download, DownloadCloud, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useData } from "@/hooks/use-data";
import { format, subYears, differenceInYears, isAfter } from "date-fns";
import React, { useState, useEffect } from "react";


export default function UserNav() {
    const { user, logout } = useAuth();
    const { investments, balanceHistory, users, userDetails, userBalances } = useData();
    const isMobile = useIsMobile();
    const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
    const [showInstall, setShowInstall] = useState(false);


    useEffect(() => {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
        const dismissed = localStorage.getItem('nivesh_install_dismissed');
        if (!dismissed) {
          setShowInstall(true);
        }
      };
  
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }, []);


    if (!user) {
        return (
            <Link href="/login">
                <Button>Login</Button>
            </Link>
        )
    }
    
    const currentUser = users.find(u => u.id === user.id);
    const isProfileComplete = currentUser?.isProfileComplete ?? false;


    const handleDownload = () => {
        if (!user) return;
        
        const wb = XLSX.utils.book_new();

        // User Profile Sheet
        const currentUserData = users.find(u => u.id === user.id);
        const currentUserDetails = userDetails.find(ud => ud.userId === user.id);

        const profileData = [
            { "Field": "Name", "Value": currentUserData?.name || 'N/A' },
            { "Field": "Email", "Value": currentUserData?.email || 'N/A' },
            { "Field": "Phone Number", "Value": currentUserDetails?.phoneNumber || 'N/A' },
            { "Field": "Occupation", "Value": currentUserDetails?.occupation || 'N/A' }
        ];

        const wsProfile = XLSX.utils.json_to_sheet(profileData, { skipHeader: true });
        XLSX.utils.book_append_sheet(wb, wsProfile, "User Profile");


        // Investment Sheet
        const userInvestments = investments
            .filter(inv => inv.userId === user.id)
            .map(inv => {
                const startDate = inv.startDate.toDate();
                const maturityDate = inv.maturityDate.toDate();
                const years = differenceInYears(maturityDate, startDate);
                const simpleReturn = inv.amount * inv.interestRate * years;
                const totalValue = inv.amount + simpleReturn;

                return {
                    'Issue Date': format(startDate, 'yyyy-MM-dd'),
                    'Amount': inv.amount,
                    'Maturity Date': format(maturityDate, 'yyyy-MM-dd'),
                    'Return': parseFloat(simpleReturn.toFixed(2)),
                    'Total Amount': parseFloat(totalValue.toFixed(2)),
                    'Status': inv.status,
                }
            });

        if (userInvestments.length > 0) {
            const wsInvestments = XLSX.utils.json_to_sheet(userInvestments);
            XLSX.utils.book_append_sheet(wb, wsInvestments, "Investments");
        }


        // Balance Sheet
        const currentUserBalanceData = userBalances.find(b => b.userId === user.id);
        const currentUserBalance = currentUserBalanceData?.balance ?? 0;
        
        const userBalanceHistory = balanceHistory
            .filter(bh => bh.userId === user.id)
            .sort((a, b) => b.date.toMillis() - a.date.toMillis())
            .map(bh => ({
                'Date': format(bh.date.toDate(), 'yyyy-MM-dd'),
                'Description': bh.description,
                'Amount': bh.amount,
                'Type': bh.type,
            }));
        
        const wsBalance = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(wsBalance, [
            ["Total Balance", `₹${currentUserBalance.toLocaleString('en-IN')}`],
            [] // Empty row for spacing
        ], { origin: "A1" });

        if (userBalanceHistory.length > 0) {
            XLSX.utils.sheet_add_json(wsBalance, userBalanceHistory, { origin: "A4", skipHeader: false });
            XLSX.utils.sheet_add_aoa(wsBalance, [
                ["Date", "Description", "Amount", "Type"]
            ], { origin: "A3" });
        }
        XLSX.utils.book_append_sheet(wb, wsBalance, "Balance History");

        const currentDate = format(new Date(), "dd_MM_yyyy");
        const fileName = `Nivesh_Statement_${currentDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleInstallClick = async () => {
      if (!installPrompt) return;
      
      (installPrompt as any).prompt();
      const { outcome } = await (installPrompt as any).userChoice;
      
      if (outcome === 'accepted' || outcome === 'dismissed') {
        setShowInstall(false);
        localStorage.setItem('nivesh_install_dismissed', 'true');
        setInstallPrompt(null);
      }
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
                    
                    {!isAdmin && !isProfileComplete && (
                        <Link href="/complete-profile">
                            <DropdownMenuItem>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Complete Profile</span>
                            </DropdownMenuItem>
                        </Link>
                    )}
                    
                    <DropdownMenuItem onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download Statement</span>
                    </DropdownMenuItem>
                    {showInstall && (
                        <DropdownMenuItem onClick={handleInstallClick}>
                            <DownloadCloud className="mr-2 h-4 w-4" />
                            <span>Download App</span>
                        </DropdownMenuItem>
                    )}
                    
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
