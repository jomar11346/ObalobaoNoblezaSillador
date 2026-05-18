import AxiosInstance from "./AxiosInstance";

const GenderService = {
  loadGenders: async () => {
    return AxiosInstance.get("/gender/loadGenders");
  },
};

export default GenderService;
