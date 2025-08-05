
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAuthAction = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account created successfully!" });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Logged in successfully!" });
      }
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="transform transition-transform duration-300 hover:scale-105">Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Sign Up' : 'Login'}</DialogTitle>
          <DialogDescription>
            {isSignUp ? 'Create a new account to get started.' : 'Enter your credentials to access your account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center">
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Button>
            <Button onClick={handleAuthAction}>
                {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
