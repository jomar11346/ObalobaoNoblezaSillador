import AxiosInstance from "./AxiosInstance";

const DashboardService = {
    getDashboardStats: async () => {
        return AxiosInstance.get("/dashboard/getDashboardStats");
    },
    loadDailySales: async () => {
        return AxiosInstance.get("/dashboard/loadDailySales");
    },
    getDailySaleFlowers: async (saleDate: string) => {
        return AxiosInstance.get("/dashboard/getDailySaleFlowers", {
            params: { sale_date: saleDate },
        });
    },
    loadMonthlySales: async () => {
        return AxiosInstance.get("/dashboard/loadMonthlySales");
    },
    syncDailySales: async () => {
        return AxiosInstance.post("/dashboard/syncDailySales");
    },
    storeDailySale: async (data: {
        sale_date: string;
        amount: string | number;
        notes?: string;
    }) => {
        return AxiosInstance.post("/dashboard/storeDailySale", data);
    },
    destroyDailySale: async (dailySaleId: string | number) => {
        return AxiosInstance.put(`/dashboard/destroyDailySale/${dailySaleId}`);
    },
    destroyMonthlySale: async (yearMonth: string) => {
        return AxiosInstance.put(`/dashboard/destroyMonthlySale/${yearMonth}`);
    },
};

export default DashboardService;
