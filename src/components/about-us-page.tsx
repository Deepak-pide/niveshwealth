
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, TrendingUp, Handshake, PiggyBank, FileText, Info } from "lucide-react";
import Image from 'next/image';
import { Button } from "./ui/button";


export default function AboutUsPage() {
    const commitments = [
        {
            icon: <Handshake className="h-8 w-8 text-primary" />,
            title: "Company Transparency",
            description: "We believe in clear and open communication. You'll always have access to detailed information about your investments and our performance."
        },
        {
            icon: <PiggyBank className="h-8 w-8 text-primary" />,
            title: "Backup for Investment",
            description: "Your investments are secured with robust backup strategies to mitigate risks and protect your principal."
        },
        {
            icon: <ShieldCheck className="h-8 w-8 text-primary" />,
            title: "Safe & Secure",
            description: "We prioritize the security of your assets with state-of-the-art encryption and industry-leading safety protocols."
        },
        {
            icon: <TrendingUp className="h-8 w-8 text-primary" />,
            title: "High Interest",
            description: "Our expert financial strategies are designed to maximize your returns, offering competitive interest rates on your investments."
        },
    ];


    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
            <div className="space-y-12">
                <section className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Nivesh Insights</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our commitment to building your secure financial future.
                    </p>
                </section>

                <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {commitments.map((item, index) => (
                         <Card key={index} className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="rounded-full bg-primary/10 p-3">
                                    {item.icon}
                                </div>
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section>
                    <Card className="transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden">
                        <div className="md:flex">
                             <div className="md:w-1/3 relative h-64 md:h-auto">
                                <Image
                                    src="https://placehold.co/400x400.png"
                                    alt="Founder's Photo"
                                    layout="fill"
                                    objectFit="cover"
                                    data-ai-hint="professional portrait"
                                />
                            </div>
                            <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                                <blockquote className="text-lg italic text-foreground border-l-4 border-primary pl-4">
                                    "Investment is a must-know part of life for a secured future. Don't let your money lose value. Invest in safe assets and see it grow."
                                </blockquote>
                                <p className="mt-4 text-right font-semibold text-primary">- Founder, Nivesh Insights</p>
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
                            <p className="text-muted-foreground">
                                Nivesh Insights is a leading financial services company dedicated to helping individuals achieve their financial goals. We offer a range of investment products designed for security and growth. Our team of experts is committed to providing personalized advice and transparent services to empower our clients on their investment journey.
                            </p>
                            <a href="/company-document.pdf" download>
                                <Button variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Document
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
