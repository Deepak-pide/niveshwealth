"use client";

import type { GenerateInvestmentStrategyOutput } from "@/ai/flows/generate-investment-strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, PieChart, ShieldAlert, Info, FileText } from "lucide-react";

type StrategyDisplayProps = {
    strategy: GenerateInvestmentStrategyOutput | null;
    isLoading: boolean;
};

const StrategySkeleton = () => (
    <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
             <Card key={i} className="shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        ))}
    </div>
);

const InitialState = () => (
    <Card className="shadow-lg h-full flex flex-col items-center justify-center text-center p-8">
        <div className="bg-accent/50 p-4 rounded-full mb-6">
            <Lightbulb className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl mb-2">Get Your Personalized Strategy</CardTitle>
        <p className="text-muted-foreground max-w-md">
            Complete the form with your financial details, and our AI-powered advisor will create a custom investment plan just for you.
        </p>
    </Card>
);

const StrategyCard = ({ icon: Icon, title, content }: { icon: React.ElementType, title: string, content: string }) => (
    <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Icon className="h-6 w-6" />
            </div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
        </CardContent>
    </Card>
);

export default function StrategyDisplay({ strategy, isLoading }: StrategyDisplayProps) {
    if (isLoading) {
        return <StrategySkeleton />;
    }

    if (!strategy) {
        return <InitialState />;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Your Investment Strategy</h2>
            <StrategyCard
                icon={FileText}
                title="Strategy Summary"
                content={strategy.strategySummary}
            />
            <StrategyCard
                icon={PieChart}
                title="Recommended Asset Allocation"
                content={strategy.recommendedAssetAllocation}
            />
            <StrategyCard
                icon={ShieldAlert}
                title="Risk Assessment"
                content={strategy.riskAssessment}
            />
            <StrategyCard
                icon={Info}
                title="Disclaimer"
                content={strategy.disclaimer}
            />
        </div>
    );
}
