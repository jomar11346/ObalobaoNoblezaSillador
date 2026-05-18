import AxiosInstance from "./AxiosInstance";

const OrderService = {
    loadOrders: async (page: number, search?: string) => {
        try {
          const response = await AxiosInstance.get(search ? `/order/loadOrders?page=${page}&search=${search}`
             : `/order/loadOrders?page=${page}`);
          return response;
        } catch (error) {
          throw error;
        }
    },
    storeOrder: async (data: any) => {
        try {
            const response = await AxiosInstance.post("/order/storeOrder", data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateOrderStatus: async (orderId: string | number, data: any) => {
        try {
            const response = await AxiosInstance.post(
                `/order/updateOrderStatus/${orderId}`, 
                data
            );
            return response;
        } catch (error) {
            throw error;
        }
    },
    destroyOrder: async (orderId: string | number) => {
        try {
            const response = await AxiosInstance.put(`/order/destroyOrder/${orderId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default OrderService;
