import { Outlet } from "react-router-dom";
import {
	CalendarBlank,
	Syringe,
	HouseLine,
	CaretRight,
	CalendarCheck,
	Scroll,
	UserPlus,
	DotsThreeOutline,
} from "phosphor-react";
import { Link } from "react-router-dom";
import {
	AppShell,
	Burger,
	Button,
	Header,
	MediaQuery,
	Navbar,
	ScrollArea,
	useMantineTheme,
	LoadingOverlay,
} from "@mantine/core";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "react-query";
import { AuthContext } from "../../../context/AuthContext";
import { useContext } from "react";
import axios from "axios";

const fetchProfile = async (token: string | null) => {
	if (token) {
		const data = await axios.get(
			`${process.env.REACT_APP_API_KEY}/users/profile`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return data.data.data;
	}
};

//change password
// const changePassword = async (password: string, token: string | null) => {
// 	console.log(password);
// 	axios.put(`${process.env.REACT_APP_API_KEY}/users/`, {
// 		password: password,
// 	}, {
// 		headers: {
// 			Authorization: `Bearer ${token}`,
// 		},
// 	})
// 	.then(function (response) {
// 		console.log(response);
// 	}
// 	)
// 	.catch(function (error) {
// 		console.log(error);
// 	}
// };

const ProfileSetting = () => {
	const { state } = useContext(AuthContext);
	const { token, role } = state;
	const isAdmin = role?.toLowerCase() === "admin";
	const { isLoading, data } = useQuery("getProfile", () =>
		fetchProfile(token)
	);
	const [opened, setOpened] = useState(false);
	const theme = useMantineTheme();

	if (isLoading) {
		return (
			<div>
				<LoadingOverlay transitionDuration={500} visible={true} />
			</div>
		);
	}
	const { name, avatar, email } = data;

	return (
		<>
			<div>
				{name} {avatar} {email}
			</div>
		</>
	);
};

export default ProfileSetting;
