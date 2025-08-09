
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, TrendingUp, Handshake, PiggyBank, FileText, Info } from "lucide-react";
import Image from 'next/image';
import { Button } from "./ui/button";
import BusinessModelSection from "./business-model-section";


export default function AboutUsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in space-y-12">
                <section className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Nivesh</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our commitment to building your secure financial future.
                    </p>
                </section>

                <BusinessModelSection />

                <section>
                    <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden">
                        <div className="md:flex items-center">
                             <div className="md:w-1/3 p-6 flex justify-center">
                                <div className="relative h-48 w-48 rounded-full overflow-hidden shadow-lg">
                                    <Image
                                        src="/MyImage.jpg"
                                        alt="Founder's Photo"
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                            </div>
                            <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                                <blockquote className="text-lg italic text-foreground border-l-4 border-primary pl-4">
                                    "Investment is a must-know part of life for a secured future. Don't let your money lose value. Invest in safe assets and see it grow."
                                </blockquote>
                                <p className="mt-4 text-right font-semibold text-primary">-Founder</p>
                            </div>
                        </div>
                    </Card>
                </section>

                <section>
                    <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-3">
                                <Info className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Company Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <a href="/Brochure.pdf" download>
                                <Button variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Document
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                </section>
        </div>
    );
}
