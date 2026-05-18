import { Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import EditFlowerPage from "../pages/Flower/EditFlowerPage";
import FlowerMainPage from "../pages/Flower/FlowerMainPage";
import DeleteFlowerPage from "../pages/Flower/DeleteFlowerPage";
import UserMainPage from "../pages/User/UserMainPage";
import LoginPage from "../pages/Auth/LoginPage";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import CustomerMainPage from "../pages/Customer/CustomerMainPage";
import OrderMainPage from "../pages/Order/OrderMainPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
const AppRoutes = () => {
    return (
        <>
        <AuthProvider>
        <Routes>
            <Route path='/' element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/flowers" element={<FlowerMainPage />} />
                <Route path="/flower/edit/:flower_id" element={<EditFlowerPage />} />
                <Route path="/flower/delete/:flower_id" element={<DeleteFlowerPage />} />
                <Route path="/users" element={<UserMainPage />} />
                <Route path="/customers" element={<CustomerMainPage />} />
                <Route path="/orders" element={<OrderMainPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
        </Routes>
        </AuthProvider>
        </>
    );
};

export default AppRoutes;
