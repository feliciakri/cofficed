import { useContext, useEffect, useState, ChangeEvent } from "react";
import {
  Menu,
  Divider,
  Pagination,
  Table,
  Input,
  LoadingOverlay,
  Loader,
  Tabs,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "react-query";
import moment from "moment";
import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { Check, SortAscending, SortDescending, XCircle } from "phosphor-react";
import { useNotifications } from "@mantine/notifications";
import { AttendancesProps } from "../../../types/type";
import DefaultEmptyState from "../../../components/EmptyStates";

type PropsTable = {
  attends: AttendancesProps;
};
export type PostCheckInProps = {
  token: string | null;
  attendance_id: string;
  temperature: number | undefined;
};

const postCheckIn = async ({
  token,
  attendance_id,
  temperature,
}: PostCheckInProps) => {
  if (token) {
    const response = await axios
      .post(
        `${process.env.REACT_APP_API_URL}/check/ins`,
        {
          attendance_id: attendance_id,
          temperature: temperature,
        },
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
  }
};

const TableNotCheckIn = ({ attends }: PropsTable) => {
  const queryClient = useQueryClient();
  const { state } = useContext(AuthContext);
  const { token } = state;
  const notifications = useNotifications();

  const [isTemperature, setIsTemperature] = useState<number>();
  const { id, office, employee, status, user_avatar, user_email } = attends;
  const mutation = useMutation(postCheckIn, {
    onSettled: (data) => {
      if (data.status === 200) {
        queryClient.invalidateQueries("allAttendence");
        queryClient.invalidateQueries("attendenceByRange");
        notifications.showNotification({
          title: "Success",
          message: "Check In Employee is Successfully",
          icon: <Check size={20} />,
        });
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

  const handleCheckIn = async () => {
    await mutation.mutate({
      token: token,
      attendance_id: id,
      temperature: isTemperature,
    });
  };

  return (
    <>
      <tr className="bg-white text-gray-900">
        <td className="capitalize flex flex-row space-x-2 items-center">
          <img
            src={`${
              user_avatar ? user_avatar : "/apple-touch-icon.png"
            }?${Date.now()}`}
            alt="logo"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <p>{employee}</p>
            <p>{user_email}</p>
          </div>
        </td>
        <td className="font-semibold">{office}</td>

        <td>
          <span
            className="
               bg-green-200 text-green-900 p-0.5 px-3 rounded-t-full rounded-b-full capitalize"
          >
            {status}
          </span>
        </td>
        <td>
          <Menu closeOnItemClick={false} control={<div>Check In</div>}>
            <Menu.Item>
              <Input
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIsTemperature(+e.target.value)
                }
              />
            </Menu.Item>
            <Divider />
            <Menu.Item onClick={handleCheckIn}>Details</Menu.Item>
          </Menu>
        </td>
      </tr>
    </>
  );
};
type CheckInsState = {
  attendance_id: string;
  id: string;
  is_checkins: boolean;
  is_checkouts: boolean;
  updated_at: string;
  office_name: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
  temprature: number;
};

type CheckInProps = {
  dataCheckIns: CheckInsState;
};
const TableHistoryCheckIns = ({ dataCheckIns }: CheckInProps) => {
  const {
    office_name,
    created_at,
    user_name,
    user_avatar,
    user_email,
    temprature,
  } = dataCheckIns;
  const date = moment(created_at).format("DD MMMM YYYY");
  const time = moment(created_at).format("hh:mm");
  return (
    <>
      <tr className="bg-white text-gray-900">
        <td>
          <p className="text-sm text-gray-900">{date}</p>
          <p className="text-sm text-gray-500">{time}</p>
        </td>
        <td className="capitalize flex flex-row space-x-2 items-center">
          <img
            src={`${
              user_avatar ? user_avatar : "/apple-touch-icon.png"
            }?${Date.now()}`}
            alt="logo"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <p>{user_name}</p>
            <p>{user_email}</p>
          </div>
        </td>
        <td>{office_name}</td>
        <td>{temprature}</td>
      </tr>
    </>
  );
};

const getAttendances = async (token: string | null) => {
  if (token) {
    const data = await axios.get(`${process.env.REACT_APP_API_URL}/check/`, {
      params: {
        order_by: "desc",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  }
};
type AttendanceDayProps = {
  token: string | null;
  date: string | Date;
};
const getAttendancesToday = async ({ token, date }: AttendanceDayProps) => {
  if (token) {
    const data = await axios.get(
      `${process.env.REACT_APP_API_URL}/attendances/`,
      {
        params: {
          date_start: date,
          date_end: date,
          status: "approved",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  }
};
const DashboardAdminCheckIns = () => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [isAttendances, setIsAttendances] = useState<AttendancesProps[]>();
  const [isCheckIns, setIsCheckIns] = useState<CheckInsState[]>();
  const [activePageCheckIns, setActivePageCheckIns] = useState<number>(1);
  const [activePageNotCheckIns, setActivePageNotCheckIns] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalPageNotCheckIns, setTotalPageNotCheckIns] = useState<number>(1);
  const tablePerPage = 6;
  const [isEmployeeCheckIns, setIsEmployeeCheckIns] =
    useState<CheckInsState[]>();
  const [isAttendancesToday, setIsAttendancesToday] = useState<
    AttendancesProps[] | undefined
  >();
  const [filteredByOrder, setFilteredByOrder] = useState<boolean>(false);
  const { isLoading, data, refetch, isFetching } = useQuery("getCheckIns", () =>
    getAttendances(token)
  );
  const dateNow = moment(Date.now()).format("YYYY-MM-DD");
  const { data: dataAttendants } = useQuery("attendancesToday", () =>
    getAttendancesToday({
      token: token,
      date: dateNow,
    })
  );
  useEffect(() => {
    if (data) {
      setIsEmployeeCheckIns(data.data.data);
    }
    if (isEmployeeCheckIns) {
      const numPageCheckIns = Math.ceil(
        isEmployeeCheckIns?.length / tablePerPage
      );
      setTotalPage(numPageCheckIns);
      const dataCheckIns = isEmployeeCheckIns.slice(
        (activePageCheckIns - 1) * tablePerPage,
        activePageCheckIns * tablePerPage
      );
      setIsCheckIns(dataCheckIns);
    }
  }, [
    data,
    activePageCheckIns,
    isEmployeeCheckIns,
    dataAttendants,
    isAttendancesToday,
  ]);
  useEffect(() => {
    if (dataAttendants) {
      setIsAttendancesToday(dataAttendants?.data?.data);
    }
    if (isAttendancesToday) {
      const numPageNotCheckIns = Math.ceil(
        isAttendancesToday?.length / tablePerPage
      );
      setTotalPageNotCheckIns(numPageNotCheckIns);
      const dataAttends = isAttendancesToday?.slice(
        (activePageNotCheckIns - 1) * tablePerPage,
        activePageNotCheckIns * tablePerPage
      );
      setIsAttendances(dataAttends);
    }
  }, [activePageNotCheckIns, dataAttendants, isAttendancesToday]);
  const handleFilterBySort = () => {
    setFilteredByOrder(!filteredByOrder);
    setTimeout(() => {
      refetch();
    }, 200);
  };

  return (
    <>
      <div className="py-5 font-inter">
        <h1 className="text-xl font-fraunces">Employee Check Ins</h1>

        <div className="flex flex-row items-center justify-end py-4">
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

        {isLoading && <LoadingOverlay visible={true} />}
        {isFetching && (
          <div className="flex justify-end">
            <Loader size="sm" />
          </div>
        )}

        <Tabs>
          <Tabs.Tab label="Employees Not Yet Checked In Today">
            <div className="overflow-x-auto border shadow-md first-letter:rounded-t-lg rounded-t-lg">
              <Table verticalSpacing="xs">
                {isCheckIns?.length === 0 ? (
                  <>
                    <DefaultEmptyState />
                  </>
                ) : (
                  <>
                    <thead className="bg-gray-50">
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isAttendances?.map(
                        (data: AttendancesProps, i: number) => (
                          <TableNotCheckIn attends={data} key={i} />
                        )
                      )}
                    </tbody>
                  </>
                )}
              </Table>
            </div>
            <div className="flex mt-8 justify-center">
              <Pagination
                page={activePageNotCheckIns}
                onChange={setActivePageNotCheckIns}
                total={totalPageNotCheckIns}
                color="cyan"
              />
            </div>
          </Tabs.Tab>
          <Tabs.Tab label="Check Ins History">
            <div className="overflow-x-auto border shadow-md first-letter:rounded-t-lg rounded-t-lg">
              <Table verticalSpacing="xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Time</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Temperature</th>
                  </tr>
                </thead>
                <tbody>
                  {isCheckIns?.map((data: CheckInsState, i: number) => (
                    <TableHistoryCheckIns dataCheckIns={data} key={i} />
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="flex mt-8 justify-center">
              <Pagination
                page={activePageCheckIns}
                onChange={setActivePageCheckIns}
                total={totalPage}
                color="cyan"
              />
            </div>
          </Tabs.Tab>
        </Tabs>
      </div>
    </>
  );
};

export default DashboardAdminCheckIns;
