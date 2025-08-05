import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

const articles = [
    {
        title: "Understanding Risk Tolerance",
        description: "Learn how your comfort with risk impacts your investment choices.",
        image: "https://placehold.co/600x400.png",
        hint: "finance charts"
    },
    {
        title: "What is an ETF?",
        description: "A beginner's guide to Exchange-Traded Funds and how they work.",
        image: "https://placehold.co/600x400.png",
        hint: "stock market"
    },
    {
        title: "Long-Term vs. Short-Term Goals",
        description: "How to align your investment timeline with your financial objectives.",
        image: "https://placehold.co/600x400.png",
        hint: "planning goals"
    }
];

export default function EducationalContent() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Market Insights</h2>
                <p className="text-muted-foreground">
                    Expand your financial knowledge with our curated articles.
                </p>
            </div>
            <div className="space-y-4">
                {articles.map((article) => (
                    <Card key={article.title} className="shadow-lg overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl">
                        <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-1/3">
                                <Image 
                                    src={article.image} 
                                    alt={article.title}
                                    data-ai-hint={article.hint} 
                                    width={200} 
                                    height={133} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="sm:w-2/3">
                                <CardHeader>
                                    <CardTitle className="text-lg">{article.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{article.description}</CardDescription>
                                </CardContent>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
