import { useCallback, useEffect, useState, useRef, type FC } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table"
import Spinner from "../../../components/Spinner/Spinner";
import CustomerService from "../../../Services/CustomerService";
import type { CustomerColumns } from "../../../interfaces/CustomerInterface";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";

interface CustomerListProps {
    onAddCustomer: () => void
    onEditCustomer: (customer: CustomerColumns | null) => void
    onDeleteCustomer: (customer: CustomerColumns | null) => void
    refreshKey: boolean
}

const CustomerList: FC<CustomerListProps> = ({ onAddCustomer, onEditCustomer, onDeleteCustomer, refreshKey }) => {
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [customers, setCustomers] = useState<CustomerColumns[]>([]);
    const [customersTableCurrentPage, setCustomersTableCurrentPage] = useState(1);
    const [customersTableLastPage, setCustomersTableLastPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const tableRef = useRef<HTMLDivElement>(null);

    const handleLoadCustomers = async (page: number, append = false, search: string) => {
        try {
            setLoadingCustomers(true)

            const res = await CustomerService.loadCustomers(page, search);

            if (res.status === 200) {
                const customerData = res.data.customers.data || res.data.customers || [];
                const lastPage = res.data.customers.last_page || res.data.last_page || customersTableLastPage || 1
                
                setCustomers(append ? [...customers, ...customerData] : customerData);
                setCustomersTableCurrentPage(page);
                setCustomersTableLastPage(lastPage);
                setHasMore(page < lastPage);

            } else {
                setCustomers(append ? [...customers] : []);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Unexpected server error occured during loading customers: ', error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handeScroll = useCallback(() => {
        const ref = tableRef.current;
        if (ref && ref.scrollTop + ref.clientHeight >= ref.scrollHeight - 10 && hasMore && !loadingCustomers) {
            handleLoadCustomers(customersTableCurrentPage + 1, true, debouncedSearch);
        }
    }, [hasMore, loadingCustomers, customersTableCurrentPage, debouncedSearch]);

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
        setCustomers([]);
        setCustomersTableCurrentPage(1);
        setHasMore(true);

        handleLoadCustomers(1, false, debouncedSearch);
    }, [refreshKey, debouncedSearch]);

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
                                        onClick={onAddCustomer}>
                                        Add Customer
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
                                    Name
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Contact
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Email
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Address
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 text-gray-500 text-sm">
                            {customers.length ?? 0 > 0 ? (
                                customers.map((customer, index) => (
                                    <TableRow className="hover:bg-gray-100" key={index}>
                                        <TableCell className="px-4 py-3 text-center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {customer.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {customer.contact}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {customer.email || '-'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {customer.address}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    type="button"
                                                    className="text-green-600 hover:underline"
                                                    onClick={() => onEditCustomer(customer)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:underline"
                                                    onClick={() => onDeleteCustomer(customer)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) :  !loadingCustomers && (customers.length ?? 0) <= 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center font-medium">
                                        No Records found
                                    </TableCell>
                                </TableRow>
                            ) :(
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {loadingCustomers && (customers.length ?? 0) > 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center">
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

export default CustomerList
