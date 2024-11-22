import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import Header from "@/components/Header";

export default function RootLayout() {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-full w-full bg-gray-100">
          <Header />
          <div className="w-full px-4 py-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
