
"use client";

import { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function InvestmentPage() {
    const [amount, setAmount] = useState(50000);
    const [years, setYears] = useState(5);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="space-y-8">
                <section className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        <span className="text-primary">Secure your Future with</span> High-Yield Investments
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Unlock the potential for up to <span className="font-bold text-green-600">9%</span> returns and build lasting wealth with our expert-guided investment plans.
                    </p>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-colors hover:bg-accent/50">
                                <div className="mb-4 rounded-full bg-primary/10 p-3">
                                    <Calculator className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Investment Calculator</h3>
                                <p className="text-sm text-muted-foreground">Calculate your potential returns</p>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Investment Calculator</DialogTitle>
                                <DialogDescription>
                                    Estimate your returns by setting the investment amount and duration.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Math.min(Number(e.target.value), 50000))}
                                        className="w-full"
                                        max="50000"
                                    />
                                    <Slider
                                        value={[amount]}
                                        onValueChange={(value) => setAmount(value[0])}
                                        max={50000}
                                        step={1000}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>₹0</span>
                                        <span>₹50,000</span>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="years">Years</Label>
                                    <Input
                                        id="years"
                                        type="number"
                                        value={years}
                                        onChange={(e) => setYears(Math.min(Number(e.target.value), 30))}
                                        className="w-full"
                                        max="30"
                                    />
                                    <Slider
                                        value={[years]}
                                        onValueChange={(value) => setYears(value[0])}
                                        max={30}
                                        step={1}
                                    />
                                     <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>1 Year</span>
                                        <span>30 Years</span>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Calculate</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Card className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-colors hover:bg-accent/50">
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Start Invest in FD</h3>
                        <p className="text-sm text-muted-foreground">Grow your wealth securely</p>
                    </Card>
                </section>

                <section>
                    <Accordion type="single" collapsible className="w-full">
                        <Card>
                            <AccordionItem value="item-1" className="border-b-0">
                                <AccordionTrigger className="hover:no-underline">
                                    <CardHeader>
                                        <CardTitle>About Us</CardTitle>
                                    </CardHeader>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            Nivesh Insights is a premier financial technology company dedicated to empowering individuals to achieve their financial goals. We provide innovative tools and expert insights to help you make informed investment decisions and build a secure financial future. Our mission is to democratize wealth creation by making sophisticated investment strategies accessible to everyone.
                                        </p>
                                    </CardContent>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    </Accordion>
                </section>
            </div>
        </div>
    );
}
