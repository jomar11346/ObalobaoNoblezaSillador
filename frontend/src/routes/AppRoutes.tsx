import { Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import GenderMainPage from "../pages/Gender/GenderMainPage";
import EditGenderPage from "../pages/Gender/EditGenderPage";
import DeleteGenderPage from "../pages/Gender/DeleteGenderPage";
import UserMainPage from "../pages/User/UserMainPage";
const AppRoutes = () => {
  return (
  <>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<GenderMainPage />} />
        <Route path='/gender/edit' element={<EditGenderPage />} />
        <Route path="/gender/delete" element={<DeleteGenderPage />} />
        <Route path="/users" element={<UserMainPage />} />
        <Route
          path="/users/edit"
          element={<p className="text-gray-600">Edit User</p>}
        />
        <Route
          path="/users/delete"
          element={<p className="text-gray-600">Delete User</p>}
        />
      </Route>
    </Routes>
  </>
  );
};

export default AppRoutes;
