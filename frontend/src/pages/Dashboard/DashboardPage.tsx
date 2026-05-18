import { useEffect, useState } from "react";
import DashboardService from "../../Services/DashboardService";
import Spinner from "../../components/Spinner/Spinner";
import PageHeader from "../../components/Brand/PageHeader";

const DashboardPage = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total_sales: 0,
        low_stock_flowers: 0,
        pending_orders: 0,
    });

    const handleLoadDashboardStats = async () => {
        try {
            setLoading(true);
            const res = await DashboardService.getDashboardStats();
            if (res.status === 200) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Yui Blooms — Dashboard";
        handleLoadDashboardStats();
    }, []);

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of sales, stock, and orders at a glance."
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <article className="yb-card">
                    <p className="yb-card-stat-label">Total sales</p>
                    <p className="yb-card-stat-value">
                        ₱{parseFloat(String(stats.total_sales)).toFixed(2)}
                    </p>
                    <p className="mt-3 text-xs text-[#4a4541]">Completed orders only</p>
                </article>
                <article className="yb-card">
                    <p className="yb-card-stat-label">Low stock</p>
                    <p className="yb-card-stat-value">{stats.low_stock_flowers}</p>
                    <p className="mt-3 text-xs text-[#4a4541]">Fewer than 10 stems available</p>
                </article>
                <article className="yb-card">
                    <p className="yb-card-stat-label">Pending orders</p>
                    <p className="yb-card-stat-value">{stats.pending_orders}</p>
                    <p className="mt-3 text-xs text-[#4a4541]">Awaiting confirmation or prep</p>
                </article>
            </div>
            {loading && (
                <div className="mt-10 flex justify-center">
                    <Spinner size="lg" />
                </div>
            )}
        </>
    );
};

export default DashboardPage;
