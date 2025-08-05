
import AppHeader from "@/components/app-header";
import InvestmentsPage from "@/components/investments-page";
import AppFooter from "@/components/app-footer";

export default function Investments() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <InvestmentsPage />
      </main>
      <AppFooter />
    </div>
  );
}
