import { NavLink } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import YuiBloomsLogo from "../assets/img/YuiBloomsLogo.png";
import FacebookLink from "../components/Brand/FacebookLink";

const AppSidebar = () => {
    const { isOpen, toggleSidebar } = useSidebar();

    const sidebarItems = [
        { path: "/dashboard", text: "Dashboard" },
        { path: "/flowers", text: "Flowers" },
        { path: "/customers", text: "Customers" },
        { path: "/orders", text: "Orders" },
        { path: "/users", text: "Users" },
    ];

    return (
        <>
            {!isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-[#2d2926]/20 sm:hidden"
                    onClick={toggleSidebar}
                    aria-hidden
                />
            )}
            <aside
                id="logo-sidebar"
                className={`yb-sidebar fixed top-0 left-0 z-40 h-screen w-64 pt-16 transition-transform sm:translate-x-0 ${
                    isOpen ? "-translate-x-full" : "translate-x-0"
                }`}
                aria-label="Sidebar"
            >
                <div className="yb-sidebar-brand hidden sm:block">
                    <img
                        src={YuiBloomsLogo}
                        alt="Yui Blooms Flower Bar"
                        className="mx-auto h-28 w-auto object-contain"
                    />
                    <p className="yb-eyebrow mt-3 text-center">Flower Bar</p>
                </div>
                <div className="flex h-[calc(100vh-4rem)] flex-col sm:h-[calc(100vh-12rem)]">
                    <nav className="flex-1 overflow-y-auto px-2 py-4">
                        <ul className="space-y-1">
                            {sidebarItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `yb-nav-link ${isActive ? "yb-nav-link-active" : ""}`
                                        }
                                    >
                                        {item.text}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="border-t border-[#2d2926] px-3 py-4">
                        <FacebookLink className="w-full justify-center" />
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AppSidebar;
