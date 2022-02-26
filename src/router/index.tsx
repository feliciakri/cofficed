import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import DashboardAdmin from "../pages/dashboard-admin";
import DashboardEmployee from "../pages/dashboard-employee";
import DashboardEmployeeSchedule from "../pages/dashboard-employee/schedule";
import Login from "../pages/login";

const Router = () => {
  const { state } = useContext(AuthContext);
  const { role, isLogged } = state;
  const isAdmin = role?.toLowerCase() === "admin";

  return (
    <BrowserRouter>
      <Routes>
        {!isLogged && <Route path="/" element={<Login />} />}
        <Route path="/" element={<Layout />}>
          {isLogged && (
            <>
              <Route path="/dashboard" element={<DashboardEmployee />} />
              <Route
                path="/dashboard-employee/schedule"
                element={<DashboardEmployeeSchedule />}
              />
            </>
          )}
          {isLogged && isAdmin && (
            <>
              <Route
                path="/dashboard-admin/quota-schedule"
                element={<DashboardAdmin />}
              />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
