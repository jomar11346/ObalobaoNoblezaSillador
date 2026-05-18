import AxiosInstance from "./AxiosInstance";

const DashboardService = {
    getDashboardStats: async () => {
        try {
            const response = await AxiosInstance.get("/dashboard/getDashboardStats");
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default DashboardService;
