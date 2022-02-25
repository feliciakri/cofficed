import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import DashboardEmployee from "../pages/dashboard-employee";
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
            <Route path="/dashboard" element={<DashboardEmployee />} />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
