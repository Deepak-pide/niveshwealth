'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized investment strategies based on user input.
 *
 * generateInvestmentStrategy - A function that takes user financial data and goals as input and returns a personalized investment strategy.
 * GenerateInvestmentStrategyInput - The input type for the generateInvestmentStrategy function.
 * GenerateInvestmentStrategyOutput - The output type for the generateInvestmentStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInvestmentStrategyInputSchema = z.object({
  age: z.number().describe('The age of the user.'),
  income: z.number().describe('The annual income of the user.'),
  riskTolerance: z
    .enum(['low', 'medium', 'high'])
    .describe('The risk tolerance of the user (low, medium, or high).'),
  investmentGoals: z.string().describe('The investment goals of the user.'),
  existingInvestments: z
    .string()
    .optional()
    .describe('Optional: Description of the user\'s existing investments.'),
  timeHorizon: z
    .enum(['short', 'medium', 'long'])
    .describe(
      'The time horizon for the investment (short, medium, or long term).'
    ),
});
export type GenerateInvestmentStrategyInput = z.infer<
  typeof GenerateInvestmentStrategyInputSchema
>;

const GenerateInvestmentStrategyOutputSchema = z.object({
  strategySummary: z
    .string()
    .describe('A summary of the personalized investment strategy.'),
  recommendedAssetAllocation: z
    .string()
    .describe('Recommended asset allocation (e.g., stocks, bonds, real estate).'),
  riskAssessment: z.string().describe('Assessment of the risks involved.'),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer that investment involves risk and the output should not be taken as financial advice.'
    ),
});
export type GenerateInvestmentStrategyOutput = z.infer<
  typeof GenerateInvestmentStrategyOutputSchema
>;

export async function generateInvestmentStrategy(
  input: GenerateInvestmentStrategyInput
): Promise<GenerateInvestmentStrategyOutput> {
  return generateInvestmentStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvestmentStrategyPrompt',
  input: {schema: GenerateInvestmentStrategyInputSchema},
  output: {schema: GenerateInvestmentStrategyOutputSchema},
  prompt: `You are an expert financial advisor. Analyze the user's financial profile and goals to generate a personalized investment strategy.

  User Financial Profile:
  Age: {{{age}}}
  Income: {{{income}}}
  Risk Tolerance: {{{riskTolerance}}}
  Investment Goals: {{{investmentGoals}}}
  Existing Investments: {{{existingInvestments}}}
  Time Horizon: {{{timeHorizon}}}

  Based on this information, provide a personalized investment strategy summary, recommended asset allocation, and risk assessment.
  Include a disclaimer that investment involves risk and the output should not be taken as financial advice.

  Ensure that the output is well-formatted and easy to understand.

  Output in a json format as defined by the GenerateInvestmentStrategyOutputSchema schema.
`,
});

const generateInvestmentStrategyFlow = ai.defineFlow(
  {
    name: 'generateInvestmentStrategyFlow',
    inputSchema: GenerateInvestmentStrategyInputSchema,
    outputSchema: GenerateInvestmentStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });
    return output!;
  }
);
