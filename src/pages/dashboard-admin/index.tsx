import { ChangeEvent, useContext, useEffect, useState } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useMediaQuery } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "react-query";
import moment from "moment";
import { CalendarTypeProps } from "../../types/type";
import DateComponent from "../../components/Calendar";
import { changeToDate } from "../../utils/formatDateMoment";
import { Button, Input, Select, Modal } from "@mantine/core";
import { AuthContext } from "../../context/AuthContext";
import { useNotifications } from "@mantine/notifications";
import { Check, XCircle } from "phosphor-react";

type LocationState = {
	id: string;
	name: string;
};
type PutQuota = {
	id: string | undefined;
	quota: number;
	token: string | null;
};
type ModalUpdate = {
	isOpen: boolean;
	setIsOpen: (arg: boolean) => void;
	filteredCalendar: CalendarTypeProps | undefined;
	updateQuota: (arg: number) => void;
};

const fetchCategory = async () => {
	const { data } = await axios.get(
		`${process.env.REACT_APP_API_URL}/offices/`
	);
	return data.data;
};

const getCalendar = async (category: LocationState | undefined) => {
	if (category) {
		const { data: response } = await axios.get(
			`${process.env.REACT_APP_API_URL}/days/`,
			{
				params: {
					office_id: category.id,
				},
			}
		);

		return response.data;
	}
};

const putQuota = async (dayUpdate: PutQuota) => {
	const { token, id, quota } = dayUpdate;
	const response = await axios
		.put(
			`${process.env.REACT_APP_API_URL}/days/`,
			{ id: id, quota: quota },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		.then((response: AxiosResponse) => {
			return response;
		})
		.catch((error: AxiosError) => {
			return error.response?.data?.meta.message;
		});

	return response;
};

const ModalUpdateQuota = ({
	isOpen,
	setIsOpen,
	filteredCalendar,
	updateQuota,
}: ModalUpdate) => {
	const [isQuota, setIsQuota] = useState<number>(0);
	const date = moment(filteredCalendar?.date).format("DD MMMM YYYY");
	return (
		<>
			<Modal
				title="Quota Work From Office"
				centered
				styles={{
					header: {
						paddingLeft: 20,
						paddingRight: 20,
						paddingTop: 10,
					},
					modal: { padding: 0 },
				}}
				opened={isOpen}
				onClose={() => setIsOpen(false)}
			>
				{filteredCalendar && (
					<>
						<div className="bg-blue-100 w-full flex flex-col justify-between py-4">
							<div className="mx-4 flex flex-row">
								<div className="w-1/2">
									<label className="text-sm">Date</label>
									<p className="font-semibold">{date}</p>
								</div>
								<div className="w-1/2">
									<label className="text-sm">Location</label>
									<p className="font-semibold">
										{filteredCalendar.office}
									</p>
								</div>
							</div>
						</div>
						<div className="mx-4">
							<div className="my-3 flex flex-col gap-y-2">
								<h1>Quota WFO</h1>
								<div className="w-1/4">
									<Input
										onChange={(
											e: ChangeEvent<HTMLInputElement>
										) => setIsQuota(+e.target.value)}
									/>
								</div>
							</div>
							<div className="py-4 flex justify-end gap-x-4">
								<Button
									variant="outline"
									onClick={() => setIsOpen(false)}
								>
									Back
								</Button>
								<Button onClick={() => updateQuota(isQuota)}>
									Update Qouta
								</Button>
							</div>
						</div>
					</>
				)}
			</Modal>
		</>
	);
};

const DashboardAdmin = () => {
	const queryClient = useQueryClient();
	const notifications = useNotifications();
	const [filteredCategory, setFilteredCategory] = useState<
		LocationState | undefined
	>();
	const [filteredCalendar, setFilteredCalendar] = useState<
		CalendarTypeProps | undefined
	>();
	const [isLocation, setIsLocation] = useState<LocationState[]>([]);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	// Responsive Calendar
	const isDesktop = useMediaQuery("(min-width: 1200px)");
	const isTablet = useMediaQuery("(max-width: 1200px)");
	const isMobile = useMediaQuery("(max-width: 600px)");
	const { data } = useQuery("getCategory", fetchCategory);
	const { data: dataCalendar, refetch } = useQuery("getDataCalendar", () =>
		getCalendar(filteredCategory)
	);
	const mutation = useMutation(putQuota, {
		onSettled: (data: any) => {
			if (data.status === 200) {
				setIsOpen(false);
				notifications.showNotification({
					title: "Success",
					message: `${data.data.meta.message}`,
					icon: <Check className="text-white" size={32} />,
				});
				queryClient.invalidateQueries(["getDataCalendar"]);
			} else {
				notifications.showNotification({
					title: "Failed",
					color: "red",
					message: `${data}`,
					icon: <XCircle className="text-white" size={32} />,
				});
			}
		},
	});

	const { state } = useContext(AuthContext);
	const { token } = state;
	const updateQuota = async (quota: number) => {
		const dayUpdate = {
			id: filteredCalendar?.id,
			token: token,
			quota: +quota,
		};
		await mutation.mutate(dayUpdate);
	};
	const dataLocation =
		isLocation &&
		isLocation.map((location: LocationState) => ({
			value: `${location.id}`,
			label: `${location.name}`,
		}));

	useEffect(() => {
		if (data) {
			setIsLocation(data);
		}
		if (isLocation[0]) {
			setFilteredCategory({
				name: isLocation[0].name,
				id: isLocation[0].id,
			});
		}
	}, [data, isLocation]);

	const handleChangeOffice = (e: string) => {
		const category = isLocation.filter(
			(location: LocationState) => location.id === e
		);
		setFilteredCategory({
			name: category[0].name,
			id: category[0].id,
		});
		setTimeout(() => {
			refetch();
		}, 200);
	};
	const handleChangeCalendar = (e: Date) => {
		if (dataCalendar) {
			const filteredCalendars = dataCalendar.filter(
				(calendar: CalendarTypeProps) =>
					changeToDate(calendar.date) === changeToDate(e)
			);

			if (filteredCalendars.length > 0) {
				setIsOpen(true);
				setFilteredCalendar({
					id: filteredCalendars[0].id,
					date: filteredCalendars[0].date,
					office: filteredCalendars[0].office,
					quota: filteredCalendars[0].Quota,
				});
			}
		}
	};

	return (
		<div>
			<ModalUpdateQuota
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				filteredCalendar={filteredCalendar}
				updateQuota={updateQuota}
			/>
			<h1 className="font-fraunces text-xl">Change Quota Schedule</h1>
			<div className="lg:w-1/3 my-2">
				<h1 className="font-semibold">Office</h1>
				{dataLocation && (
					<Select
						label="Select which office"
						placeholder="Pick one"
						onChange={handleChangeOffice}
						data={dataLocation}
					/>
				)}
			</div>

			<div className="flex justify-center py-8">
				<DateComponent
					data={dataCalendar}
					onHandle={handleChangeCalendar}
					isMobile={isMobile}
					isTablet={isTablet}
					isDesktop={isDesktop}
					isQuota={true}
				/>
			</div>
		</div>
	);
};

export default DashboardAdmin;
