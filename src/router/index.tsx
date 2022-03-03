import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import DashboardAdmin from "../pages/dashboard-admin";
import DashboardAdminRequest from "../pages/dashboard-admin/request";
import DashboardAdminVaccine from "../pages/dashboard-admin/vaccine";
import DashboardEmployee from "../pages/dashboard-employee";
import DashboardEmployeeVaccine from "../pages/dashboard-employee/vaccine";
import DashboardEmployeeSchedule from "../pages/dashboard-employee/schedule";
import Login from "../pages/login";
import ProfileSetting from "../pages/profile/setting";

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
							<Route
								path="/dashboard"
								element={<DashboardEmployee />}
							/>
							<Route
								path="/dashboard-employee/schedule"
								element={<DashboardEmployeeSchedule />}
							/>
							<Route
								path="/dashboard-employee/vaccine"
								element={<DashboardEmployeeVaccine />}
							/>
							<Route
								path="/profile/setting"
								element={<ProfileSetting />}
							/>
						</>
					)}
					{isLogged && isAdmin && (
						<>
							<Route
								path="/dashboard-admin/vaccine"
								element={<DashboardAdminVaccine />}
							/>
							<Route
								path="/dashboard-admin/wfo-request"
								element={<DashboardAdminRequest />}
							/>
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
