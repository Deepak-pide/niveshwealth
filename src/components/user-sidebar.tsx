
"use client";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Home, Briefcase, Wallet, Menu, Download } from "lucide-react";
import Link from "next/link";
import { useData } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export function UserSidebar() {
  const { user } = useAuth();
  const { investments, balanceHistory } = useData();

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <div className="text-lg font-semibold text-foreground">Menu</div>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-4">
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Home className="h-5 w-5" />
                Home
            </Link>
          </SheetClose>
          <SheetClose asChild>
             <Link href="/investments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Briefcase className="h-5 w-5" />
                Investments
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/my-balance" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Wallet className="h-5 w-5" />
                My Balance
            </Link>
          </SheetClose>
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-3 justify-start px-3 py-2 text-muted-foreground transition-all hover:text-primary">
             <Download className="h-5 w-5" />
             Download Data
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
