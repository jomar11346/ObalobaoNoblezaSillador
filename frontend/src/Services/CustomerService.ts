import AxiosInstance from "./AxiosInstance";

const CustomerService = {
    loadCustomers: async (page: number, search?: string) => {
        try {
          const response = await AxiosInstance.get(search ? `/customer/loadCustomers?page=${page}&search=${search}`
             : `/customer/loadCustomers?page=${page}`);
          return response;
        } catch (error) {
          throw error;
        }
    },
    storeCustomer: async (data: any) => {
        try {
            const response = await AxiosInstance.post("/customer/storeCustomer", data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateCustomer: async (customerId: string | number, data: any) => {
        try {
            const response = await AxiosInstance.post(
                `/customer/updateCustomer/${customerId}`, 
                data
            );
            return response;
        } catch (error) {
            throw error;
        }
    },
    destroyCustomer: async (customerId: string | number) => {
        try {
            const response = await AxiosInstance.put(`/customer/destroyCustomer/${customerId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default CustomerService;
