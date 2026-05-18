import AxiosInstance from "./AxiosInstance";

const FlowerService = {
  loadFlowers: async () => {
    return AxiosInstance.get("/flower/loadFlowers");
  },

  storeFlower: async (data: FormData) => {
    return AxiosInstance.post("/flower/storeFlower", data);
  },
  getFlower: async (flowerID: string | number) => {
    return AxiosInstance.get(`/flower/getFlower/${flowerID}`);
  },
  updateFlower: async (flowerId: string | number, data: FormData) => {
    return AxiosInstance.post(`/flower/updateFlower/${flowerId}`, data);
  },

  destroyFlower: async (flowerId: string | number) => {
    return AxiosInstance.put(`/flower/destroyFlower/${flowerId}`);
  },
};

export default FlowerService;
