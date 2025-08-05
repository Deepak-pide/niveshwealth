import AppHeader from "@/components/app-header";
import InvestmentPage from "@/components/investment-page";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        <InvestmentPage />
      </main>
    </div>
  );
}
