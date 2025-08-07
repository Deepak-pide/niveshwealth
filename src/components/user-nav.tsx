
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useData } from "@/hooks/use-data";

export default function UserNav() {
    const { user, logout } = useAuth();
    const { users } = useData();
    
    if (!user) {
        return (
            <Link href="/login">
                <Button>Login</Button>
            </Link>
        )
    }

    const appUser = users.find(u => u.userId === user.uid);
    const displayName = appUser?.name || user.displayName;
    
    const adminEmails = ['moneynivesh@gmail.com', 'moneynivesh360@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? ""} alt={displayName ?? ""} />
                        <AvatarFallback>{displayName?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{displayName}</p>
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
