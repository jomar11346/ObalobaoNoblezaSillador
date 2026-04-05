import { Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";

const SampleComponent = () => {
  return (
    <h1 className="font-serif text-lg font-medium text-[#9b1c1c] md:text-xl">
      Hello World
    </h1>
  );
};


const AppRoutes = () => {
  return (
      <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<SampleComponent />} />
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;