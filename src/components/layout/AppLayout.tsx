import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Outlet } from "react-router-dom";
import { AiCopilotWidget } from "@/components/ai/AiCopilotWidget";

export const AppLayout = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <AiCopilotWidget />
  </div>
);
