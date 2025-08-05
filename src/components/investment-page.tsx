"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp } from "lucide-react";

export default function InvestmentPage() {
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
                    <Card className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-colors hover:bg-accent/50">
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <Calculator className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Investment Calculator</h3>
                        <p className="text-sm text-muted-foreground">Calculate your potential returns</p>
                    </Card>
                    <Card className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-colors hover:bg-accent/50">
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Start Invest in FD</h3>
                        <p className="text-sm text-muted-foreground">Grow your wealth securely</p>
                    </Card>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle>About Us</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Nivesh Insights is a premier financial technology company dedicated to empowering individuals to achieve their financial goals. We provide innovative tools and expert insights to help you make informed investment decisions and build a secure financial future. Our mission is to democratize wealth creation by making sophisticated investment strategies accessible to everyone.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}