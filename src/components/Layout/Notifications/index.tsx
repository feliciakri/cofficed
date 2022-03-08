import { ScrollArea } from "@mantine/core";
import axios from "axios";
import moment from "moment";
import { Bell } from "phosphor-react";
import { useContext, useState } from "react";
import { useQuery } from "react-query";
import { AuthContext } from "../../../context/AuthContext";
import DefaultEmptyState from "../../EmptyStates";

type NotificationsData = {
	name: string;
	created_at: string;
};
const Notifications = () => {
	const { state } = useContext(AuthContext);
	const { data, refetch } = useQuery("getNotifications", async () => {
		if (state.token) {
			const { data: response } = await axios.get(
				`${process.env.REACT_APP_API_URL}/logcats/user`,
				{
					headers: {
						Authorization: `Bearer ${state.token}`,
					},
				}
			);

			return response.data;
		}
	});

	const [isDropdown, setIsDropdown] = useState<boolean>(false);

	const handleDropdown = () => {
		setIsDropdown(!isDropdown);
		refetch();
	};
	return (
		<div>
			<div
				className="lg:mx-10 hover:bg-gray-200 p-2 rounded-full relative cursor-pointer"
				onClick={handleDropdown}
			>
				<Bell size={25} />
			</div>
			<div
				className={`${!isDropdown ? "hidden" : ""} max-h-92 absolute
top-10 right-2 lg:right-10 bg-white text-base z-50 list-none divide-y divide-gray-100 rounded shadow my-4`}
				role="menu"
				aria-orientation="vertical"
				aria-labelledby="menu-button"
			>
				<div className="px-4 py-3">
					<h1>Notifications</h1>
				</div>
				<ul className="py-1" aria-labelledby="dropdown">
					<ScrollArea style={{ height: 300 }}>
						{!data && (
							<div className="lg:w-1/2 mx-auto">
								<DefaultEmptyState />
							</div>
						)}
						{data?.map((notif: NotificationsData, i: number) => (
							<li key={i} className=" px-4 py-2">
								<p>{notif.name}</p>
								<p className="text-sm text-blue-500">
									{moment(notif.created_at).fromNow()}
								</p>
							</li>
						))}
					</ScrollArea>
				</ul>
			</div>
		</div>
	);
};

export default Notifications;
