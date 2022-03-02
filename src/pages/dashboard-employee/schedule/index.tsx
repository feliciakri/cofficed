import {
  Button,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Select,
} from "@mantine/core";
import moment from "moment";
import axios, { AxiosResponse, AxiosError } from "axios";
import {
  MapPin,
  Check,
  Users,
  CalendarBlank,
  Syringe,
  Bag,
} from "phosphor-react";
import React, { useContext, useEffect, useState } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { AuthContext } from "../../../context/AuthContext";
import DateComponent from "../../../components/Calendar";
import { changeToDate } from "../../../utils/formatDateMoment";

type AttendancesDay = {
  token: string | null;
  id: string | null;
  office: string | null;
  Quota: number | null;
  date: string | null;
};

type AttendsProps = {
  id: string;
  office: string;
  employee: string;
  notes: string;
  admin: string;
  status: string;
  day: string;
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
  days: any;
};

type PostType = {
  token: string | null;
  id: string;
};

const fetchCategory = async () => {
  const { data } = await axios.get(`${process.env.REACT_APP_API_KEY}/offices/`);
  return data.data;
};

const postDate = async (data: PostType) => {
  const { token, id } = data;
  const response = await axios
    .post(
      `${process.env.REACT_APP_API_KEY}/attendances/`,
      { day: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res: AxiosResponse) => res.status)
    .catch((error: AxiosError) => {
      console.log(error);
    });

  return response;
};

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

const getAllAttends = async (token: string | null) => {
  if (token) {
    const data = await axios.get(
      `${process.env.REACT_APP_API_KEY}/attendances/`,
      {
        params: {
          status: "",
          employee: "",
          time: "",
          office: "",
          order: "",
        },
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
    const data = await axios
      .get(`${process.env.REACT_APP_API_KEY}/attendances/`, {
        params: {
          status: "",
          employee: "",
          time: dates,
          office: office,
          order: "",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((err) => err.response);

    return data.data.data;
  }
};
const getCalendar = async (category: any) => {
  if (category) {
    console.log(category.id);
    const data = await axios.get(`${process.env.REACT_APP_API_KEY}/days/`, {
      params: {
        office: category.name,
        time: "",
      },
    });
    return data.data.data;
  }
};

const ModalRequest: React.FC<ModalProps> = ({ opened, setOpened, days }) => {
  const queryClient = useQueryClient();
  const { state } = useContext(AuthContext);
  const { token } = state;
  const { isLoading, data } = useQuery("getProfile", () => fetchProfile(token));
  const mutation = useMutation(postDate, {
    onSuccess: async (data: any) => {
      setOpened(false);
      queryClient.invalidateQueries(["allAttendence", data.id]);
      queryClient.invalidateQueries(["attendsByDay", data.id]);
    },
    onError: async (error) => {},
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
    console.log(isLoading);
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Request Work from Office"
        centered
        styles={{
          header: { paddingLeft: 20, paddingRight: 20, paddingTop: 10 },
          modal: { padding: 0 },
        }}
      >
        <div className="bg-blue-100 px-4 w-full flex flex-row justify-between py-4">
          <div className="w-1/2">
            <h2 className="text-gray-500 text-sm">Tanggal</h2>
            <p className="font-bold">{date}</p>
          </div>
          <div className="w-1/2">
            <h2 className="text-gray-500 text-sm">Lokasi</h2>
            <p className="font-bold">{days && days.office}</p>
          </div>
        </div>
        <div className="px-4 flex flex-row justify-between py-3">
          <div className="w-1/2">
            <h2 className="text-gray-500 text-sm">Pemohon</h2>
            <p>{data.name}</p>
          </div>
          <div className="w-1/2">
            <h2 className="text-gray-500 text-sm">NIK</h2>
            <p>{data.nik}</p>
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="flex flex-row items-center bg-blue-200 py-2 px-4 rounded">
            <Check className="mr-2" size={20} />
            <p>Vaksinasi Lengkap</p>
          </div>
        </div>
        <div className="px-4 py-4 flex justify-end gap-x-4">
          <button
            className="py-2 mx-4 text-gray-500"
            onClick={() => setOpened(false)}
          >
            Kembali
          </button>
          <button
            className="flex flex-row items-center bg-gray-700 text-white py-2 px-4 rounded"
            onClick={handleRequestAttends}
          >
            Kirim permintaan WFO
          </button>
        </div>
      </Modal>
    </>
  );
};
const CardListRequest: React.FC<ListProps> = ({ attends }) => {
  console.log(attends);
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
const ListAttendences: React.FC<ListProps> = ({ attends }) => {
  return (
    <div className="flex flex-row border-b-2 gap-x-4 items-center">
      <img src="/apple-touch-icon.png" alt="logo" className="w-9 h-9" />
      <div className="flex flex-col ">
        <h1>{attends.employee}</h1>
        <p>{attends.office}</p>
      </div>
    </div>
  );
};
const DashboardEmployeeSchedule = () => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [isLocation, setIsLocation] = useState<LocationState[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<any>();
  const [isDays, setIsDays] = useState<any>();
  const [opened, setOpened] = useState<boolean>(false);
  // Pagination
  const tablePerPage = 3;
  const [isAttendences, setIsAttendences] = useState<AttendsProps[]>();
  const [activePage, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  const dataLocation =
    isLocation &&
    isLocation.map((location: LocationState) => ({
      value: `${location.id}`,
      label: `${location.name}`,
    }));

  // Fetch api with react query
  const { data } = useQuery("getCategory", fetchCategory);
  const { data: dataCalendar, refetch } = useQuery("getDataCalender", () =>
    getCalendar(filteredCategory)
  );

  const attendecesByDays = {
    token: token,
    ...isDays,
  };

  const { data: dataAllAttends } = useQuery("allAttendence", () =>
    getAllAttends(token)
  );

  const {
    data: dataAttendensByDay,
    refetch: refetchAttends,
    isFetching,
  } = useQuery("attendsByDay", () => getAttendsByParams(attendecesByDays));

  useEffect(() => {
    if (dataAllAttends && isLocation[0]) {
      const num = Math.ceil(dataAllAttends.data.data.length / tablePerPage);
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
      const filteredCalenders = dataCalendar.filter(
        (calender: any) => changeToDate(calender.date) === changeToDate(e)
      );

      if (filteredCalenders.length > 0) {
        setIsDays({ ...filteredCalenders[0] });
        setTimeout(() => {
          refetchAttends();
        }, 400);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {isDays && (
        <ModalRequest opened={opened} setOpened={setOpened} days={isDays} />
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
            {isAttendences &&
              isAttendences?.map((data: AttendsProps, i: number) => (
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
        />
      </div>
      <div className="lg:w-2/5 my-4">
        <div className="flex items-center justify-center">
          <Button
            color="green"
            onClick={() => isDays && setOpened(true)}
            className="my-4 mx-2"
            disabled={!isDays}
          >
            <p className="text-lg py-4"> Request WFO 📝 🏢 💼</p>
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 rounded h-screen overflow-auto">
          <h1 className="font-fraunces text-lg py-2">You will working with</h1>
          <ScrollArea>
            {isFetching && (
              <LoadingOverlay
                visible={true}
                loaderProps={{ size: "sm", color: "blue", variant: "bars" }}
                overlayOpacity={0.3}
                overlayColor="#c5c5c5"
              />
            )}
            {!dataAttendensByDay && <p>No one</p>}
            {dataAttendensByDay &&
              dataAttendensByDay?.map((attends: AttendsProps, i: number) => (
                <ListAttendences attends={attends} key={i} />
              ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployeeSchedule;
