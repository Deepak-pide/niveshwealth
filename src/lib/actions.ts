"use server";

import { generateInvestmentStrategy, type GenerateInvestmentStrategyInput, type GenerateInvestmentStrategyOutput } from "@/ai/flows/generate-investment-strategy";

export async function getInvestmentStrategyAction(input: GenerateInvestmentStrategyInput): Promise<{
    data: GenerateInvestmentStrategyOutput | null;
    error: string | null;
}> {
    try {
        const output = await generateInvestmentStrategy(input);
        return { data: output, error: null };
    } catch (e: any) {
        console.error(e);
        return { data: null, error: e.message || "An unexpected error occurred." };
    }
}
