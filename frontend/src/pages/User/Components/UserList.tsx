import type { FC } from "react";
import { Link } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/Table";

interface UserListProps {
    onAddUser: () => void;
}

type UserRow = {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    suffixName: string;
    gender: string;
    address: string;
};

const UserList: FC<UserListProps> = ({ onAddUser }) => {
    const users: UserRow[] = [
        {
            id: 1,
            firstName: "John",
            middleName: "",
            lastName: "Doe",
            suffixName: "",
            gender: "Male",
            address: "Roxas City",
        },
        {
            id: 2,
            firstName: "Mikha",
            middleName: "Bini",
            lastName: "Lim",
            suffixName: "",
            gender: "Female",
            address: "Iloilo City",
        },
        {
            id: 3,
            firstName: "Johnathan",
            middleName: "Baba Yaga",
            lastName: "Wick",
            suffixName: "Jr.",
            gender: "Prefer Not to Say",
            address: "Lawaan",
        },
    ];

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex justify-end border-b border-gray-200 p-4">
                <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    onClick={onAddUser}
                >
                    Add User
                </button>
            </div>
            <div className="max-w-full max-h-[calc(100vh)] overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10 border-b border-gray-200 bg-blue-600 text-xs text-white">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                No.
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                First Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                Middle Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                Last Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                Suffix Name
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                Gender
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                Address
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 text-center font-semibold"
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm text-gray-700">
                        {users.map((user, index) => (
                            <TableRow
                                key={user.id}
                                className={
                                    index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                }
                            >
                                <TableCell className="px-4 py-3 text-center">
                                    {user.id}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-center">
                                    {user.firstName}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-center">
                                    {user.middleName || "\u00A0"}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-center">
                                    {user.lastName}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-center">
                                    {user.suffixName || "\u00A0"}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-center">
                                    {user.gender}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-start">
                                    {user.address}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-start">
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Link
                                            to="/users/edit"
                                            state={{ userId: user.id }}
                                            className="font-medium text-green-600 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            to="/users/delete"
                                            state={{ userId: user.id }}
                                            className="font-medium text-red-600 hover:underline"
                                        >
                                            Delete
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default UserList;
