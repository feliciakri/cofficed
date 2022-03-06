import { useContext, useEffect, useState } from "react";
import moment from "moment";
import axios, { AxiosResponse, AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Button,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Select,
} from "@mantine/core";
import {
  AttendancesDay,
  AttendancesProps,
  CertificateVaccine,
} from "../../../types/type";
import { useNotifications } from "@mantine/notifications";
import {
  MapPin,
  Users,
  CalendarBlank,
  SortAscending,
  SortDescending,
  XCircle,
  Check,
} from "phosphor-react";
import { AuthContext } from "../../../context/AuthContext";
import DateComponent from "../../../components/Calendar";
import { changeToDate } from "../../../utils/formatDateMoment";
import DefaultEmptyState from "../../../components/EmptyStates";

type LocationState = {
  id: string;
  name: string;
};
type CategoryState = {
  label: string;
  value: string;
};
type ListProps = {
  attends: AttendancesProps;
};

type ModalProps = {
  opened: boolean;
  setOpened: (args: boolean) => void;
  days: AttendancesDay;
};

type CalendarType = {
  date: string | Date;
};

type PostType = {
  token: string | null;
  id: string | undefined;
};

const fetchCategory = async () => {
  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/offices/`);
  return data.data;
};

const postDate = async (data: PostType) => {
  const { token, id } = data;
  const response = await axios
    .post(
      `${process.env.REACT_APP_API_URL}/attendances/`,
      { day_id: id },
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

type AttendancesUser = {
  token: string | null;
  order: string;
};
const getAttendancesByUser = async (data: AttendancesUser) => {
  const { data: response } = await axios.get(
    `${process.env.REACT_APP_API_URL}/attendances/user`,
    {
      params: {
        order_by: data.order,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    }
  );

  return response.data;
};

const getAttendsByParams = async (attendecesByDays: AttendancesDay) => {
  const { token, date, office, value } = attendecesByDays;

  if (token && date && office) {
    const dates = moment(date).format("YYYY-MM-DD");
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_URL}/attendances/`,
      {
        params: {
          date_start: dates,
          date_end: dates,
          office_id: value,
          status: "approved",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
};
const getCalendar = async (category: CategoryState | undefined) => {
  if (category) {
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_URL}/days/`,
      {
        params: {
          office_id: category.value,
        },
      }
    );
    return response.data;
  }
};

const ModalRequest = ({ opened, setOpened, days }: ModalProps) => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { state } = useContext(AuthContext);
  const { token, profile } = state;
  const mutation = useMutation(postDate, {
    onSettled: (data: any) => {
      if (data.status === 200) {
        notifications.showNotification({
          title: "Success",
          icon: <Check className="text-white" size={32} />,
          message: `${data.data.meta.message}`,
        });
        setTimeout(() => {
          setOpened(false);
        }, 2000);
        queryClient.invalidateQueries("allAttendence");
        queryClient.invalidateQueries("attendsByDay");
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
  const handleRequestAttends = async () => {
    const data = {
      id: days.id,
      token: token,
    };
    await mutation.mutate(data);
  };
  const date = days && moment(days.date).format("LL");

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
            <p>{profile?.name}</p>
          </div>
          <div className="w-1/2">
            <h2 className="text-gray-500 text-sm">NIK</h2>
            <p>{profile?.nik}</p>
          </div>
        </div>

        <div className="px-4 py-4 flex justify-end gap-x-4">
          <Button variant="outline" onClick={() => setOpened(false)}>
            Back
          </Button>
          <Button onClick={handleRequestAttends}>Send Request WFO</Button>
        </div>
      </Modal>
    </>
  );
};
const CardListRequest = ({ attends }: ListProps) => {
  const { day, office, notes, status, admin } = attends;
  const date = moment(day).format("LL");
  const styleApproved = status.toLocaleLowerCase() === "approved";
  const styleRejected = status.toLocaleLowerCase() === "rejected";
  const stylePending = status.toLocaleLowerCase() === "pending";
  return (
    <div className="bg-white shadow-sm p-3 flex flex-col space-y-2 border-b text-gray-500">
      <div className="flex space-x-2 items-center">
        <Users size={25} />
        <h1>{admin}</h1>
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
        src={`${user_avatar ? user_avatar : "/apple-touch-icon.png"}`}
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
  const [filteredCategory, setFilteredCategory] = useState<CategoryState>();

  const [isDays, setIsDays] = useState<AttendancesDay>();

  const [opened, setOpened] = useState<boolean>(false);
  // Pagination
  const tablePerPage = 3;
  const [isAttendences, setIsAttendences] = useState<AttendancesProps[]>();
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

  const { data: dataAllAttends, refetch: refetchAttendanceUser } = useQuery(
    "attendanceByUser",
    () =>
      getAttendancesByUser({
        token: token,
        order: filteredByOrder ? "asc" : "desc",
      })
  );

  const {
    data: dataAttendants,
    refetch: refetchAttends,
    isFetching,
  } = useQuery("attendsByDay", () => getAttendsByParams(attendecesByDays));

  useEffect(() => {
    if (dataAllAttends && isLocation[0]) {
      const num = Math.ceil(
        dataAllAttends.current_attendances.length / tablePerPage
      );
      setTotalPage(num);
      const dataAttends = dataAllAttends?.current_attendances.slice(
        (activePage - 1) * tablePerPage,
        activePage * tablePerPage
      );

      setIsAttendences(dataAttends);
      setFilteredCategory({
        label: isLocation[0].name,
        value: isLocation[0].id,
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
      label: category[0].name,
      value: category[0].id,
    });
    setTimeout(() => {
      refetch();
    }, 300);
  };

  const handleChangeCalendar = (e: Date) => {
    if (dataCalendar) {
      const filteredCalendars = dataCalendar.filter(
        (calender: CalendarType) =>
          changeToDate(calender.date) === changeToDate(e)
      );

      if (filteredCalendars.length > 0) {
        setIsDays({ ...filteredCalendars[0], ...filteredCategory });
        setTimeout(() => {
          refetchAttends();
        }, 400);
      }
    }
  };

  const [filteredByOrder, setFilteredByOrder] = useState<boolean>(false);
  const handleFilterBySort = () => {
    setFilteredByOrder(!filteredByOrder);
    setTimeout(() => {
      refetchAttendanceUser();
    }, 300);
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
        <div className="flex justify-between items-center my-4">
          <h1>My Request Log</h1>
          <button
            className="rounded-r-xl border-2 h-full px-2 text-sm flex flex-row gap-x-2 items-center cursor-pointer transition duration-150 transform hover:scale-105 hover:bg-white"
            onClick={handleFilterBySort}
          >
            {filteredByOrder ? (
              <SortAscending size={20} />
            ) : (
              <SortDescending size={20} />
            )}
            Sort
          </button>
        </div>
        <div className="flex flex-col justify-between h-screen">
          <div className="flex flex-col my-2">
            {isAttendences?.map((data: AttendancesProps, i: number) => (
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
      <div className="lg:mx-6 mx-auto">
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
          <h1 className="font-fraunces text-lg py-2">You will working with</h1>
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
            {!dataAttendants && <DefaultEmptyState />}
            {dataAttendants?.map((attends: AttendancesProps, i: number) => (
              <ListAttendances attends={attends} key={i} />
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployeeSchedule;
