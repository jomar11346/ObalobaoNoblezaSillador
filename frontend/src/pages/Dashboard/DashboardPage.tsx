import { useCallback, useEffect, useState } from "react";
import DashboardService from "../../Services/DashboardService";
import Spinner from "../../components/Spinner/Spinner";
import PageHeader from "../../components/Brand/PageHeader";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";
import DailySalesList from "./components/DailySalesList";
import MonthlySalesList from "./components/MonthlySalesList";
import DeleteMonthlySaleFormModal from "./components/DeleteMonthlySaleFormModal";
import ViewDailySaleFormModal from "./components/ViewDailySaleFormModal";
import type { DailySaleColumns, MonthlySaleColumns } from "../../interfaces/DailySaleInterface";

const getCurrentSalesMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

const DashboardPage = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total_sales: 0,
        low_stock_flowers: 0,
        pending_orders: 0,
        sales_month_label: "",
    });
    const [trackedSalesMonth, setTrackedSalesMonth] = useState(getCurrentSalesMonth);

    const { refresh, handleRefresh } = useRefresh(false);

    const {
        isOpen: isViewDailySaleFormModalOpen,
        selectedItem: selectedDailySaleForView,
        openModal: openViewDailySaleFormModal,
        closeModal: closeViewDailySaleFormModal,
    } = useModal<DailySaleColumns>(false);

    const {
        isOpen: isDeleteMonthlySaleFormModalOpen,
        selectedItem: selectedMonthlySaleForDelete,
        openModal: openDeleteMonthlySaleFormModal,
        closeModal: closeDeleteMonthlySaleFormModal,
    } = useModal<MonthlySaleColumns>(false);

    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage,
    } = useToastMessage("", false, false);

    const handleLoadDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await DashboardService.getDashboardStats();
            if (res.status === 200) {
                setStats({
                    total_sales: res.data.total_sales,
                    low_stock_flowers: res.data.low_stock_flowers,
                    pending_orders: res.data.pending_orders,
                    sales_month_label: res.data.sales_month_label ?? "",
                });
                if (res.data.sales_month) {
                    setTrackedSalesMonth(res.data.sales_month);
                }
            }
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        document.title = "Yui Blooms — Dashboard";
    }, []);

    useEffect(() => {
        handleLoadDashboardStats();
    }, [refresh, handleLoadDashboardStats]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            const currentMonth = getCurrentSalesMonth();
            if (currentMonth !== trackedSalesMonth) {
                setTrackedSalesMonth(currentMonth);
                handleLoadDashboardStats();
                handleRefresh();
            }
        }, 60_000);

        return () => window.clearInterval(intervalId);
    }, [trackedSalesMonth, handleLoadDashboardStats, handleRefresh]);

    const salesMonthCaption = stats.sales_month_label
        ? `${stats.sales_month_label} · from daily sales this month`
        : "This month · from daily sales";

    return (
        <>
            <ToastMessage
                message={toastMessage}
                isVisible={toastMessageIsVisible}
                onClose={closeToastMessage}
            />
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
                    <p className="mt-3 text-xs text-[#4a4541]">{salesMonthCaption}</p>
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
            <ViewDailySaleFormModal
                dailySale={selectedDailySaleForView}
                isOpen={isViewDailySaleFormModalOpen}
                onClose={closeViewDailySaleFormModal}
            />
            <DeleteMonthlySaleFormModal
                monthlySale={selectedMonthlySaleForDelete}
                onMonthlySaleDeleted={showToastMessage}
                refreshKey={handleRefresh}
                isOpen={isDeleteMonthlySaleFormModalOpen}
                onClose={closeDeleteMonthlySaleFormModal}
            />
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <DailySalesList
                    refreshKey={refresh}
                    onViewDailySale={openViewDailySaleFormModal}
                />
                <MonthlySalesList
                    refreshKey={refresh}
                    onDeleteMonthlySale={(monthlySale) =>
                        openDeleteMonthlySaleFormModal(monthlySale)
                    }
                />
            </div>
        </>
    );
};

export default DashboardPage;
