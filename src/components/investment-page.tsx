
"use client";

import { Card } from "@/components/ui/card";
import { Calculator, TrendingUp, Info } from "lucide-react";
import Link from "next/link";

export default function InvestmentPage() {

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="space-y-8">
                <section className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        <span className="text-primary">Secure your Future with</span> High-Yield Investments
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Unlock the potential for up to <span className="font-bold text-green-600">9%</span> returns and build lasting wealth with our expert-guided investment plans.
                    </p>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Link href="/investment-calculator">
                        <Card className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:bg-accent/50 hover:shadow-lg hover:-translate-y-1 h-full">
                            <div className="mb-4 rounded-full bg-primary/10 p-3">
                                <Calculator className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Investment Calculator</h3>
                            <p className="text-sm text-muted-foreground">Calculate your potential returns</p>
                        </Card>
                    </Link>

                    <Link href="/fd-investment">
                        <Card className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:bg-accent/50 hover:shadow-lg hover:-translate-y-1 h-full">
                            <div className="mb-4 rounded-full bg-primary/10 p-3">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Start Invest in FD</h3>
                            <p className="text-sm text-muted-foreground">Grow your wealth securely</p>
                        </Card>
                    </Link>
                </section>

                <section>
                    <Link href="/about-us">
                         <Card className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:bg-accent/50 hover:shadow-lg hover:-translate-y-1 h-full">
                            <div className="mb-4 rounded-full bg-primary/10 p-3">
                                <Info className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">About Us</h3>
                            <p className="text-sm text-muted-foreground">Learn more about our commitment to you</p>
                        </Card>
                    </Link>
                </section>
            </div>
        </div>
    );
}
