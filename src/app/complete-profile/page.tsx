
import AppHeader from "@/components/app-header";
import CompleteProfilePage from "@/components/complete-profile-page";
import AppFooter from "@/components/app-footer";

export default function CompleteProfile() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        <CompleteProfilePage />
      </main>
      <AppFooter />
    </div>
  );
}
