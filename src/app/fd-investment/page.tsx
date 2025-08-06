
import AppHeader from "@/components/app-header";
import FdInvestmentPage from "@/components/fd-investment-page";
import AppFooter from "@/components/app-footer";

export default function FdInvestment() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        <FdInvestmentPage />
      </main>
      <AppFooter />
    </div>
  );
}
