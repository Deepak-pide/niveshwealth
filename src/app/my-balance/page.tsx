import AppHeader from "@/components/app-header";
import MyBalancePage from "@/components/my-balance-page";
import AppFooter from "@/components/app-footer";

export default function MyBalance() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        <MyBalancePage />
      </main>
      <AppFooter />
    </div>
  );
}
