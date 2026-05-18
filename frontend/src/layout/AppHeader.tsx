import { Link, useNavigate } from "react-router-dom";
import { useHeader } from "../contexts/HeaderContext";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useState, type FormEvent } from "react";
import YuiBloomsLogo from "../assets/img/YuiBloomsLogo.png";

const AppHeader = () => {
    const { isOpen, toggleUserMenu } = useHeader();
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Unexpected server error occurred during logging out:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fullName = () => {
        if (!user) return "";
        let name = `${user.user.first_name} ${user.user.last_name}`;
        if (user.user.suffix_name) name += ` ${user.user.suffix_name}`;
        return name;
    };

    const initials = () => {
        if (!user) return "";
        const f = user.user.first_name?.charAt(0) ?? "";
        const l = user.user.last_name?.charAt(0) ?? "";
        return `${f}${l}`.toUpperCase();
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={toggleUserMenu} aria-hidden />
            )}
            <nav className="yb-header fixed top-0 z-50 w-full">
                <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="p-2 text-[#2d2926] sm:hidden"
                            aria-label="Open menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
                            </svg>
                        </button>
                        <Link to="/dashboard" className="flex items-center gap-3">
                            <img
                                src={YuiBloomsLogo}
                                alt="Yui Blooms"
                                className="h-9 w-auto object-contain sm:hidden"
                            />
                            <span className="yb-display hidden text-xl sm:inline">Yui Blooms</span>
                        </Link>
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={toggleUserMenu}
                            className="yb-avatar"
                            aria-expanded={isOpen}
                            aria-label="Account menu"
                        >
                            {initials()}
                        </button>
                        <div
                            className={`absolute right-0 top-11 z-50 min-w-[12rem] ${isOpen ? "block" : "hidden"} yb-dropdown`}
                        >
                            <div className="border-b border-[#2d2926] px-4 py-3">
                                <p className="text-xs tracking-wide text-[#4a4541] uppercase">Signed in</p>
                                <p className="mt-1 text-sm font-medium text-[#2d2926]">{fullName()}</p>
                            </div>
                            <button
                                type="button"
                                className="w-full px-4 py-3 text-left text-sm text-[#2d2926] hover:bg-[#b8956c]/10 disabled:opacity-50"
                                onClick={handleLogout}
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing out…" : "Sign out"}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default AppHeader;
