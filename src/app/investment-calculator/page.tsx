
import AppHeader from "@/components/app-header";
import InvestmentCalculatorPage from "@/components/investment-calculator-page";
import AppFooter from "@/components/app-footer";

export default function InvestmentCalculator() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <InvestmentCalculatorPage />
      </main>
      <AppFooter />
    </div>
  );
}
