
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';


interface CalculationResult {
    name: string;
    investment: number;
    return: number;
    total: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="font-bold">{label}</p>
                {payload.map((pld, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                         <span style={{
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            backgroundColor: pld.color,
                            marginRight: '5px'
                        }}></span>
                        <span style={{ color: pld.name === 'Investment' ? 'hsl(var(--secondary-foreground))' : 'hsl(var(--primary))' }}>
                            {pld.name}: ₹{pld.value?.toLocaleString('en-IN')}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};


export default function InvestmentCalculatorPage() {
    const [amount, setAmount] = useState(50000);
    const [years, setYears] = useState(5);
    const [results, setResults] = useState<CalculationResult[] | null>(null);

    const handleCalculate = () => {
        const rates = {
            "Nivesh": 0.09,
            "FD": 0.07,
            "Post Office": 0.0714
        };

        const calculatedData: CalculationResult[] = Object.entries(rates).map(([name, rate]) => {
            const investment = amount;
            // Simple interest calculation: P * R * T
            const simpleReturn = investment * rate * years;
            const total = investment + simpleReturn;
            return {
                name,
                investment,
                return: parseFloat(simpleReturn.toFixed(2)),
                total: parseFloat(total.toFixed(2))
            };
        });

        setResults(calculatedData);
    };


    const niveshResult = results ? results.find(r => r.name === 'Nivesh') : null;

    return (
        <div className="container mx-auto p-4 md:p-8 flex justify-center animate-fade-in">
            <div className="w-full max-w-lg space-y-8">
                <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <CardHeader>
                        <CardTitle>Investment Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-4">
                                <div className="flex items-center gap-4">
                                    <Label htmlFor="amount" className="w-20">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Math.min(Number(e.target.value), 50000))}
                                        className="w-full"
                                        max="50000"
                                    />
                                </div>
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
                            <div className="grid gap-4">
                                <div className="flex items-center gap-4">
                                    <Label htmlFor="years" className="w-20">Years</Label>
                                    <Input
                                        id="years"
                                        type="number"
                                        value={years}
                                        onChange={(e) => setYears(Math.min(Number(e.target.value), 5))}
                                        className="w-full"
                                        max="5"
                                    />
                                </div>
                                <Slider
                                    value={[years]}
                                    onValueChange={(value) => setYears(value[0])}
                                    max={5}
                                    step={1}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1 Year</span>
                                    <span>5 Years</span>
                                </div>
                            </div>
                            <Button onClick={handleCalculate}>Calculate</Button>
                        </div>
                    </CardContent>
                </Card>

                {results && niveshResult && (
                    <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                        <CardHeader>
                            <CardTitle>Calculation Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={results} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="investment" stackId="a" fill="hsl(var(--secondary))" name="Investment" />
                                        <Bar dataKey="return" stackId="a" fill="hsl(var(--primary))" name="Return" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-blue-600">Investment Amount</p>
                                    <p className="text-lg font-semibold text-blue-600">₹{niveshResult.investment.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Return</p>
                                    <p className="text-lg font-semibold text-green-600">₹{niveshResult.return.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Value</p>
                                    <p className="text-lg font-semibold">₹{niveshResult.total.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
