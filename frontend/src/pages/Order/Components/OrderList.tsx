import { useCallback, useEffect, useState, useRef, type FC } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table"
import Spinner from "../../../components/Spinner/Spinner";
import OrderService from "../../../Services/OrderService";
import type { OrderColumns } from "../../../interfaces/OrderInterface";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";

interface OrderListProps {
    onAddOrder: () => void
    onEditOrder: (order: OrderColumns | null) => void
    onDeleteOrder: (order: OrderColumns | null) => void
    refreshKey: boolean
}

const OrderList: FC<OrderListProps> = ({ onAddOrder, onEditOrder, onDeleteOrder, refreshKey }) => {
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orders, setOrders] = useState<OrderColumns[]>([]);
    const [ordersTableCurrentPage, setOrdersTableCurrentPage] = useState(1);
    const [ordersTableLastPage, setOrdersTableLastPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const tableRef = useRef<HTMLDivElement>(null);

    const handleLoadOrders = async (page: number, append = false, search: string) => {
        try {
            setLoadingOrders(true)

            const res = await OrderService.loadOrders(page, search);

            if (res.status === 200) {
                const orderData = res.data.orders.data || res.data.orders || [];
                const lastPage = res.data.orders.last_page || res.data.last_page || ordersTableLastPage || 1
                
                setOrders(append ? [...orders, ...orderData] : orderData);
                setOrdersTableCurrentPage(page);
                setOrdersTableLastPage(lastPage);
                setHasMore(page < lastPage);

            } else {
                setOrders(append ? [...orders] : []);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Unexpected server error occured during loading orders: ', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handeScroll = useCallback(() => {
        const ref = tableRef.current;
        if (ref && ref.scrollTop + ref.clientHeight >= ref.scrollHeight - 10 && hasMore && !loadingOrders) {
            handleLoadOrders(ordersTableCurrentPage + 1, true, debouncedSearch);
        }
    }, [hasMore, loadingOrders, ordersTableCurrentPage, debouncedSearch]);

    useEffect(() => {
        const ref = tableRef.current;
        if (ref) {
            ref.addEventListener('scroll', handeScroll);
        }
        return () => {
            if (ref) {
                ref.removeEventListener('scroll', handeScroll);
            }
        };
    }, [handeScroll]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 800);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setOrders([]);
        setOrdersTableCurrentPage(1);
        setHasMore(true);

        handleLoadOrders(1, false, debouncedSearch);
    }, [refreshKey, debouncedSearch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "yb-badge yb-badge-pending";
            case "Confirmed": return "yb-badge yb-badge-confirmed";
            case "Ready": return "yb-badge yb-badge-ready";
            case "Completed": return "yb-badge yb-badge-completed";
            case "Cancelled": return "yb-badge yb-badge-cancelled";
            default: return "yb-badge";
        }
    };

    return (
        <>
            <div className="yb-table-wrap">
                <div ref={tableRef} className="relative max-w-full max-h-[calc(100vh-8.5rem)] overflow-x-auto">
                    <Table>
                        <caption className="mb-4">
                            <div className="border-b border-gray-100">
                                <div className="p-4 flex justify-between">
                                    <div className="w-64">
                                            <FloatingLabelInput label="Search" type="text" name="search"
                                             value={search}
                                             onChange={(e) => setSearch(e.target.value)}
                                             autoFocus />
                                    </div>
                                    <button type="button" className="yb-btn-primary"
                                        onClick={onAddOrder}>
                                        Add Order
                                    </button>
                                </div>
                            </div>
                        </caption>
                        <TableHeader className="yb-table-head sticky top-0 z-10">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                                    No.
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Order ID
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Customer
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Total Amount
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Order Date
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 text-gray-500 text-sm">
                            {orders.length ?? 0 > 0 ? (
                                orders.map((order, index) => (
                                    <TableRow className="hover:bg-gray-100" key={index}>
                                        <TableCell className="px-4 py-3 text-center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            #{order.order_id}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {order.customer?.name || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            ₱{parseFloat(String(order.total_amount)).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {order.order_date}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    type="button"
                                                    className="text-green-600 hover:underline"
                                                    onClick={() => onEditOrder(order)}
                                                >
                                                    Edit Status
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:underline"
                                                    onClick={() => onDeleteOrder(order)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) :  !loadingOrders && (orders.length ?? 0) <= 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-3 text-center font-medium">
                                        No Records found
                                    </TableCell>
                                </TableRow>
                            ) :(
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-3 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {loadingOrders && (orders.length ?? 0) > 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-3 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
};

export default OrderList
