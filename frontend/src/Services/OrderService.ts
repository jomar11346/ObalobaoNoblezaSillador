import AxiosInstance from "./AxiosInstance";

const OrderService = {
    loadOrders: async (page: number, search?: string) => {
        try {
            const response = await AxiosInstance.get(
                search
                    ? `/order/loadOrders?page=${page}&search=${search}`
                    : `/order/loadOrders?page=${page}`,
            );
            return response;
        } catch (error) {
            throw error;
        }
    },
    storeOrder: async (data: FormData) => {
        try {
            const response = await AxiosInstance.post("/order/storeOrder", data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateOrderStatus: async (orderId: string | number, data: FormData) => {
        try {
            const response = await AxiosInstance.post(
                `/order/updateOrderStatus/${orderId}`,
                data,
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
    downloadOrderReceipt: async (orderId: string | number, customerName?: string) => {
        const response = await AxiosInstance.get(`/order/downloadOrderReceipt/${orderId}`, {
            responseType: "blob",
        });

        const disposition = response.headers["content-disposition"] as string | undefined;
        const filename =
            getReceiptFilenameFromHeader(disposition) ??
            buildReceiptFilename(customerName, orderId);

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

function getReceiptFilenameFromHeader(disposition: string | undefined): string | null {
    if (!disposition) {
        return null;
    }

    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const match = disposition.match(/filename="?([^";\n]+)"?/i);
    return match?.[1] ?? null;
}

function buildReceiptFilename(customerName: string | undefined, orderId: string | number): string {
    const trimmed = (customerName ?? "").trim().replace(/[/\\:*?"<>|]/g, "").replace(/\s+/g, " ");
    const base = trimmed || `Receipt-${orderId}`;
    return `${base}.pdf`;
}


export default OrderService;
