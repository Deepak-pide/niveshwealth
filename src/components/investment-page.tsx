"use client";

import { useState } from "react";
import type { GenerateInvestmentStrategyInput, GenerateInvestmentStrategyOutput } from "@/ai/flows/generate-investment-strategy";
import { getInvestmentStrategyAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

import InvestmentForm from "./investment-form";
import StrategyDisplay from "./strategy-display";
import EducationalContent from "./educational-content";

export default function InvestmentPage() {
    const [strategy, setStrategy] = useState<GenerateInvestmentStrategyOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateStrategy = async (data: GenerateInvestmentStrategyInput) => {
        setIsLoading(true);
        setStrategy(null);
        const result = await getInvestmentStrategyAction(data);
        setIsLoading(false);

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error Generating Strategy",
                description: result.error,
            });
        } else if (result.data) {
            setStrategy(result.data);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <InvestmentForm onGenerate={handleGenerateStrategy} isLoading={isLoading} />
                    <EducationalContent />
                </div>
                <div className="lg:col-span-2 mt-8 lg:mt-0">
                    <StrategyDisplay strategy={strategy} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
