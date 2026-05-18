import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { SidebarProvider } from "../contexts/SidebarContext";
import { HeaderProvider } from "../contexts/HeaderContext";

const LayoutContent = () => {
    return (
        <div className="yb-shell">
            <AppSidebar />
            <AppHeader />
            <main className="min-h-screen pt-16 pl-0 sm:pl-64">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const AppLayout = () => {
    return (
        <HeaderProvider>
            <SidebarProvider>
                <LayoutContent />
            </SidebarProvider>
        </HeaderProvider>
    );
};

export default AppLayout;
