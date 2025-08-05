"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function InvestmentCalculatorPage() {
    const [amount, setAmount] = useState(50000);
    const [years, setYears] = useState(5);

    return (
        <div className="container mx-auto p-4 md:p-8 flex justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Investment Calculator</CardTitle>
                    <CardDescription>
                        Estimate your returns by setting the investment amount and duration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                        <Button type="submit">Calculate</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
