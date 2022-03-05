import React, { useContext, useEffect, useState } from "react";
import {
	Alert,
	Button,
	LoadingOverlay,
	Modal,
	Pagination,
	ScrollArea,
	Select,
} from "@mantine/core";
import moment from "moment";
import axios, { AxiosResponse, AxiosError } from "axios";
import { MapPin, Users, CalendarBlank } from "phosphor-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AuthContext } from "../../../context/AuthContext";
import DateComponent from "../../../components/Calendar";
import { changeToDate } from "../../../utils/formatDateMoment";

type CertificateVaccine = {
	admin: string;
	id: string;
	dosage: number;
	image: string;
	user: string;
	status: string;
};

type AttendancesState = {
	id: string;
	office: string;
	Quota: number;
	date: string;
};
interface AttendancesDay {
	id?: string;
	office?: string;
	Quota?: number;
	date?: string;
	token: string | null;
}

type AttendsProps = {
	id: string;
	office: string;
	employee: string;
	notes: string;
	admin: string;
	status: string;
	day: string;
	user_avatar: string;
	user_email: string;
	nik: string;
};
type LocationState = {
	id: string;
	name: string;
};
type ListProps = {
	attends: AttendsProps;
};

type ModalProps = {
	opened: boolean;
	setOpened: (args: boolean) => void;
	days: AttendancesState;
};

type PostType = {
	token: string | null;
	id: string;
};

const fetchCategory = async () => {
	const { data } = await axios.get(
		`${process.env.REACT_APP_API_URL}/offices/`
	);
	return data.data;
};

const postDate = async (data: PostType) => {
	const { token, id } = data;

	const response = await axios
		.post(
			`${process.env.REACT_APP_API_URL}/attendances/`,
			{ day: id },
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
			return error.message;
		});

	return response;
};

const fecthCertificate = async (token: string | null) => {
	if (token) {
		const { data: response } = await axios.get(
			`${process.env.REACT_APP_API_URL}/certificates/user`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	}
};

const fetchProfile = async (token: string | null) => {
	if (token) {
		const { data: response } = await axios.get(
			`${process.env.REACT_APP_API_URL}/users/profile`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.data;
	}
};

const getAllAttends = async (token: string | null) => {
	if (token) {
		const data = await axios.get(
			`${process.env.REACT_APP_API_URL}/attendances/`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return data;
	}
};

const getAttendsByParams = async (attendecesByDays: AttendancesDay) => {
	const { token, date, office } = attendecesByDays;

	if (token && date && office) {
		const dates = moment(date).format("YYYY-MM-DD");

		const { data: response } = await axios.get(
			`${process.env.REACT_APP_API_URL}/attendances/`,
			{
				params: {
					date: dates,
					office: office,
				},
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.data;
	}
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

const ModalRequest = ({ opened, setOpened, days }: ModalProps) => {
	const queryClient = useQueryClient();
	const { state } = useContext(AuthContext);
	const { token } = state;
	const { isLoading, data } = useQuery("getProfile", () =>
		fetchProfile(token)
	);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);
	const mutation = useMutation(postDate, {
		onSettled: (data: any) => {
			if (data.status === 200) {
				setIsSuccess(true);
				setTimeout(() => {
					setOpened(false);
					setIsSuccess(false);
				}, 2000);
				queryClient.invalidateQueries("allAttendence");
				queryClient.invalidateQueries("attendsByDay");
			} else {
				setIsError(true);
				setTimeout(() => {
					setIsError(false);
				}, 2000);
			}
		},
	});
	const handleRequestAttends = async () => {
		const data = {
			id: days.id,
			token: token,
		};
		await mutation.mutate(data);
	};
	const date = days && moment(days.date).format("LL");
	if (isLoading) {
		<LoadingOverlay visible={true} />;
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title="Request Work from Office"
				centered
				styles={{
					header: {
						paddingLeft: 20,
						paddingRight: 20,
						paddingTop: 10,
					},
					modal: { padding: 0 },
				}}
			>
				{isLoading && <LoadingOverlay visible={true} />}
				{isSuccess && (
					<div className="mx-4 my-2">
						<Alert title="Success!" color="blue">
							WFO request successful!
						</Alert>
					</div>
				)}
				{isError && (
					<div className="mx-4 my-2">
						<Alert title="Failed!" color="red">
							The WFO request has passed or has been registered on
							the same day!
						</Alert>
					</div>
				)}
				<div className="bg-blue-100 px-4 w-full flex flex-row justify-between py-4">
					<div className="w-1/2">
						<h2 className="text-gray-500 text-sm">Date</h2>
						<p className="font-bold">{date}</p>
					</div>
					<div className="w-1/2">
						<h2 className="text-gray-500 text-sm">Location</h2>
						<p className="font-bold">{days && days.office}</p>
					</div>
				</div>
				<div className="px-4 flex flex-row justify-between py-3">
					<div className="w-1/2">
						<h2 className="text-gray-500 text-sm">Applicant</h2>
						<p>{data.name}</p>
					</div>
					<div className="w-1/2">
						<h2 className="text-gray-500 text-sm">NIK</h2>
						<p>{data.nik}</p>
					</div>
				</div>

				<div className="px-4 py-4 flex justify-end gap-x-4">
					<button
						className="py-2 mx-4 text-gray-500"
						onClick={() => setOpened(false)}
					>
						Back
					</button>
					<button
						className="flex flex-row items-center bg-gray-700 text-white py-2 px-4 rounded"
						onClick={handleRequestAttends}
						disabled={isSuccess}
					>
						Send Request WFO
					</button>
				</div>
			</Modal>
		</>
	);
};
const CardListRequest = ({ attends }: ListProps) => {
	const { day, office, employee, notes, status } = attends;
	const date = moment(day).format("LL");
	const styleApproved = status.toLocaleLowerCase() === "approved";
	const styleRejected = status.toLocaleLowerCase() === "rejected";
	const stylePending = status.toLocaleLowerCase() === "pending";
	return (
		<div className="bg-white shadow-sm p-3 flex flex-col space-y-2 border-b text-gray-500">
			<div className="flex space-x-2 items-center">
				<Users size={25} />
				<h1>{employee}</h1>
			</div>
			<div className="flex space-x-2 items-center">
				<MapPin size={25} />
				<h1>{office}</h1>
			</div>
			<div className="flex space-x-2 items-center">
				<CalendarBlank size={25} />
				<h1>{date}</h1>
			</div>
			<div className="flex justify-between">
				<p>{notes}</p>
				<div
					className={`${
						styleApproved
							? "bg-green-200 text-green-800"
							: stylePending
							? "bg-gray-200 text-gray-500"
							: styleRejected
							? "bg-red-200 text-red-500"
							: ""
					} py-1 px-2 rounded-xl text-sm capitalize`}
				>
					{`${
						styleApproved
							? status
							: stylePending
							? status
							: styleRejected
							? status
							: ""
					} `}
				</div>
			</div>
		</div>
	);
};
const ListAttendances = ({ attends }: ListProps) => {
	const { employee, user_email, user_avatar } = attends;
	return (
		<div className="flex flex-row border-b-2 gap-x-4 items-center">
			<img
				src={`${
					user_avatar ? user_avatar : "/cofficed-logo-black.svg"
				}`}
				alt="logo"
				className="w-9 h-9"
			/>
			<div className="flex flex-col ">
				<h1>{employee}</h1>
				<p>{user_email}</p>
			</div>
		</div>
	);
};
const DashboardEmployeeSchedule = () => {
	const { state } = useContext(AuthContext);
	const { token } = state;
	const [isLocation, setIsLocation] = useState<LocationState[]>([]);
	const [filteredCategory, setFilteredCategory] = useState<LocationState>();

	const [isDays, setIsDays] = useState<AttendancesState>();

	const [opened, setOpened] = useState<boolean>(false);
	// Pagination
	const tablePerPage = 3;
	const [isAttendences, setIsAttendences] = useState<AttendsProps[]>();
	const [activePage, setPage] = useState<number>(1);
	const [totalPage, setTotalPage] = useState<number>(1);

	const dataLocation = isLocation?.map((location: LocationState) => ({
		value: `${location.id}`,
		label: `${location.name}`,
	}));

	// Fetch api with react query
	const { data } = useQuery("getCategory", fetchCategory);
	const { data: dataCalendar, refetch } = useQuery("getDataCalender", () =>
		getCalendar(filteredCategory)
	);

	const { data: vaccineUser } = useQuery("getVaccineUser", () =>
		fecthCertificate(token)
	);

	const isVaccine = vaccineUser
		?.filter((data: CertificateVaccine) => data.status === "approved")
		.map((data: CertificateVaccine) => {
			return data;
		});
	const vaccineApproved = isVaccine?.length > 1 ? isVaccine[0] : undefined;

	const attendecesByDays: AttendancesDay = {
		token: token,
		...isDays,
	};

	const { data: dataAllAttends } = useQuery("allAttendence", () =>
		getAllAttends(token)
	);

	const {
		data: dataAttendantsByDay,
		refetch: refetchAttends,
		isFetching,
	} = useQuery("attendsByDay", () => getAttendsByParams(attendecesByDays));

	useEffect(() => {
		if (dataAllAttends && isLocation[0]) {
			const num = Math.ceil(
				dataAllAttends.data.data.length / tablePerPage
			);
			setTotalPage(num);
			const dataAttends = dataAllAttends?.data.data.slice(
				(activePage - 1) * tablePerPage,
				activePage * tablePerPage
			);

			setIsAttendences(dataAttends);
			setFilteredCategory({
				name: isLocation[0].name,
				id: isLocation[0].id,
			});
		}
		if (data) {
			setIsLocation(data);
		}
	}, [data, isLocation, dataAllAttends, activePage]);

	const handleChange = (e: string | null) => {
		const category = isLocation.filter(
			(location: LocationState) => location.id === e
		);
		setFilteredCategory({
			name: category[0].name,
			id: category[0].id,
		});
		setTimeout(() => {
			refetch();
		}, 300);
	};

	const handleChangeCalendar = (e: Date) => {
		if (dataCalendar) {
			const filteredCalendars = dataCalendar.filter(
				(calender: AttendancesState) =>
					changeToDate(calender.date) === changeToDate(e)
			);

			if (filteredCalendars.length > 0) {
				setIsDays({ ...filteredCalendars[0] });
				setTimeout(() => {
					refetchAttends();
				}, 400);
			}
		}
	};

	return (
		<div className="flex flex-col lg:flex-row">
			{isDays && (
				<ModalRequest
					opened={opened}
					setOpened={setOpened}
					days={isDays}
				/>
			)}
			<div className="lg:w-1/3">
				{dataLocation && (
					<Select
						label="Select which office"
						placeholder="Pick one"
						onChange={handleChange}
						data={dataLocation}
					/>
				)}
				<h1 className="mt-5">Request Log</h1>
				<div className="flex flex-col justify-between h-screen">
					<div className="flex flex-col my-2">
						{isAttendences?.map((data: AttendsProps, i: number) => (
							<CardListRequest attends={data} key={i} />
						))}
					</div>
					<div className="flex my-14 justify-center">
						<Pagination
							page={activePage}
							onChange={setPage}
							total={totalPage}
							color="cyan"
							boundaries={1}
						/>
					</div>
				</div>
			</div>
			<div className="mx-6">
				<DateComponent
					data={dataCalendar}
					onHandle={handleChangeCalendar}
					isMobile={true}
					isTablet={false}
					isDesktop={false}
					isQuota={false}
				/>
			</div>
			<div className="lg:w-2/5 my-4">
				<div className="flex flex-col items-center justify-center">
					<Button
						color="green"
						onClick={() => isDays && setOpened(true)}
						className="my-4 mx-2"
						disabled={!vaccineApproved}
					>
						<p className="text-lg py-4"> Request WFO 📝 🏢 💼</p>
					</Button>
					{!vaccineApproved && (
						<p className="text-sm">
							You must to upload your certificates! (min 2)
						</p>
					)}
				</div>
				<div className="flex flex-col gap-y-2 rounded h-screen overflow-auto">
					<h1 className="font-fraunces text-lg py-2">
						You will be working with
					</h1>
					<ScrollArea>
						{isFetching && (
							<LoadingOverlay
								visible={true}
								loaderProps={{
									size: "sm",
									color: "blue",
									variant: "bars",
								}}
								overlayOpacity={0.3}
								overlayColor="#c5c5c5"
							/>
						)}
						{!dataAttendantsByDay && <p>No one</p>}
						{dataAttendantsByDay?.map(
							(attends: AttendsProps, i: number) => (
								<ListAttendances attends={attends} key={i} />
							)
						)}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
};

export default DashboardEmployeeSchedule;
