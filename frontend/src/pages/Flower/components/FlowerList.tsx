import { useEffect, useState, type FC } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table"
import FlowerService from "../../../Services/FlowerService";
import Spinner from "../../../components/Spinner/Spinner";
import type { FlowerColumns } from "../../../interfaces/FlowerInterface";
import { Link } from "react-router-dom";

interface FlowerListProps {
  refreshKey: boolean
}

export const FlowerList: FC<FlowerListProps> = ({ refreshKey }) => {
  const [loadingFlowers, setLoadingFlowers] = useState(false)
  const [flowers, setFlowers] = useState<FlowerColumns[]>([])

  const handleLoadFlowers = async () => {
    try {
      setLoadingFlowers(true)

      const res = await FlowerService.loadFlowers()

      if (res.status === 200) {
        setFlowers(res.data.flowers)
      } else {
        console.error('Unexpected error status occured during loading flowers:', res.status)
      }
    } catch (error) {
      console.error('Unexpected server eror occured during loading flowers: ', error)
    } finally {
      setLoadingFlowers(false);
    }
  };

  useEffect(() => {
    handleLoadFlowers()
  }, [refreshKey]);

  return (
    <>
      <div className="yb-table-wrap">
        <div className="max-w-full max-h-[calc(100vh)] overflow-x-auto">
          <Table>
            <TableHeader className="yb-table-head sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                  No.
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                  Image
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                  Price
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                  Stock
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                  Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-center">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="yb-table-body divide-y divide-[#2d2926]/10">
              {loadingFlowers ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-3 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : (
                flowers.map((flower: FlowerColumns, index: number) => (
                  <TableRow className="yb-table-row">
                    <TableCell className="px-4 py-3 text-center">{index + 1}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {flower.image ? (
                        <img src={flower.image} alt={flower.name} className="w-12 h-12 object-cover rounded mx-auto" />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">{flower.name}</TableCell>
                    <TableCell className="px-4 py-3 text-center">₱{parseFloat(String(flower.price)).toFixed(2)}</TableCell>
                    <TableCell className="px-4 py-3 text-center">{flower.stock_quantity}</TableCell>
                    <TableCell className="px-4 py-3 text-center">{flower.category}</TableCell>
                    <TableCell className="px-4 px-y text-center">
                      <div className="flex justfy-center items-center gap-x-4">
                        <Link to={`/flower/edit/${flower.flower_id}`} className="yb-link">Edit</Link>
                        <Link to={`/flower/delete/${flower.flower_id}`} className="yb-link yb-link-danger">Delete</Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};