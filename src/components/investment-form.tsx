"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { GenerateInvestmentStrategyInput } from "@/ai/flows/generate-investment-strategy";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    age: z.coerce.number().int().positive("Age must be a positive number.").min(18, "You must be at least 18 years old."),
    income: z.coerce.number().positive("Income must be a positive number."),
    riskTolerance: z.enum(['low', 'medium', 'high']),
    timeHorizon: z.enum(['short', 'medium', 'long']),
    investmentGoals: z.string().min(10, "Please describe your goals in at least 10 characters."),
    existingInvestments: z.string().optional(),
});

type InvestmentFormProps = {
    onGenerate: (data: GenerateInvestmentStrategyInput) => void;
    isLoading: boolean;
};

export default function InvestmentForm({ onGenerate, isLoading }: InvestmentFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            age: 30,
            income: 75000,
            riskTolerance: "medium",
            timeHorizon: "long",
            investmentGoals: "Retirement savings and long-term growth.",
            existingInvestments: "401(k) with employer match.",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        onGenerate(values);
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Your Financial Profile</CardTitle>
                <CardDescription>
                    Provide your financial details to generate a personalized investment strategy.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 30" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="income"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Annual Income (USD)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 75000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="riskTolerance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Risk Tolerance</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your risk tolerance" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="timeHorizon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time Horizon</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your time horizon" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="short">Short Term (&lt; 3 years)</SelectItem>
                                                <SelectItem value="medium">Medium Term (3-10 years)</SelectItem>
                                                <SelectItem value="long">Long Term (10+ years)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="investmentGoals"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Investment Goals</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., Save for retirement, buy a house, grow wealth..."
                                            {...field}
                                        />
                                    </FormControl>
                                     <FormDescription>
                                        Describe what you want to achieve with your investments.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="existingInvestments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Existing Investments (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., 401(k), IRA, stocks in Apple..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        List any investments you currently hold.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate Strategy"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
