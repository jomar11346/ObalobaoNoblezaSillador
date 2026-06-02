import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import FlowerService from "../../../Services/FlowerService";
import Spinner from "../../../components/Spinner/Spinner";
import type { FlowerColumns } from "../../../interfaces/FlowerInterface";

interface FlowerListProps {
    refreshKey: boolean;
}

export const FlowerList: FC<FlowerListProps> = ({ refreshKey }) => {
    const [loadingFlowers, setLoadingFlowers] = useState(false);
    const [flowers, setFlowers] = useState<FlowerColumns[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const handleLoadFlowers = useCallback(async () => {
        try {
            setLoadingFlowers(true);

            const res = await FlowerService.loadFlowers();

            if (res.status === 200) {
                setFlowers(res.data.flowers ?? []);
            } else {
                console.error(
                    "Unexpected error status occured during loading flowers:",
                    res.status,
                );
            }
        } catch (error) {
            console.error("Unexpected server eror occured during loading flowers: ", error);
        } finally {
            setLoadingFlowers(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim().toLowerCase());
        }, 400);

        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        handleLoadFlowers();
    }, [refreshKey, handleLoadFlowers]);

    const filteredFlowers = useMemo(() => {
        if (!debouncedSearch) {
            return flowers;
        }

        return flowers.filter((flower) => {
            const haystack = [
                flower.name,
                String(flower.price),
                String(flower.stock_quantity),
            ]
                .join(" ")
                .toLowerCase();

            return haystack.includes(debouncedSearch);
        });
    }, [flowers, debouncedSearch]);

    return (
        <section className="yb-panel p-5 h-full min-h-0 flex flex-col">
            <div className="mb-4 border-b border-[#2d2926]/10 pb-4">
                <h2 className="yb-eyebrow mb-4">Flower inventory</h2>
                <div className="w-full max-w-sm">
                    <FloatingLabelInput
                        label="Search"
                        type="text"
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="yb-table-wrap min-h-0 flex-1">
                <div className="max-h-[min(28rem,calc(100vh-14rem))] overflow-y-auto overflow-x-auto">
                    <Table>
                        <TableHeader className="yb-table-head sticky top-0 z-10">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                                    No.
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                                    Image
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                                    Name
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-end">
                                    Price
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                                    Stock
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="yb-table-body divide-y divide-[#2d2926]/10">
                            {loadingFlowers ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-6 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredFlowers.length > 0 ? (
                                filteredFlowers.map((flower, index) => (
                                    <TableRow key={flower.flower_id} className="yb-table-row">
                                        <TableCell className="px-4 py-3 text-center">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {flower.image ? (
                                                <img
                                                    src={flower.image}
                                                    alt={flower.name}
                                                    className="w-12 h-12 object-cover rounded mx-auto"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-sm">
                                                    No image
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start font-medium text-[#2d2926]">
                                            {flower.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-end">
                                            ₱{parseFloat(String(flower.price)).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            {flower.stock_quantity}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex justify-center items-center gap-x-4">
                                                <Link
                                                    to={`/flower/edit/${flower.flower_id}`}
                                                    className="yb-link"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    to={`/flower/delete/${flower.flower_id}`}
                                                    className="yb-link yb-link-danger"
                                                >
                                                    Delete
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-sm text-[#4a4541]"
                                    >
                                        {debouncedSearch
                                            ? "No flowers match your search."
                                            : "No flowers yet. Add one using the form."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    );
};
