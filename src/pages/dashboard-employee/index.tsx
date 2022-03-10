import { Alert, Button, Grid, Group, Input, Tooltip } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import axios, { AxiosError, AxiosResponse } from "axios";
import moment from "moment";
import { Bus, Check, HourglassMedium, SunDim, XCircle } from "phosphor-react";
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import MyScheduleComponent from "../../components/Calendar/schedule";
import ScheduleComponent from "../../components/Calendar/schedule";
import { AuthContext } from "../../context/AuthContext";
import { AttendancesProps } from "../../types/type";

type CardProps = {
  isCheckIn: boolean;
  isPending: boolean;
  isWFO: boolean;
  data: any;
};

type AttendanceUser = {
  token: string | null;
  status: string;
};

const fetchCheckIn = async (token: string | null) => {
  if (token) {
    const data = await axios.get(
      `${process.env.REACT_APP_API_URL}/check/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data.data.data;
  }
};

const postCheckIn = async ({ token, attendance_id, temprature }: any) => {
  if (token) {
    const response = await axios
      .post(
        `${process.env.REACT_APP_API_URL}/check/ins`,
        {
          attendance_id: attendance_id,
          temprature: +temprature,
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
        return error.message;
      });
    return response;
  }
};

const fetchAttendanceUser = async (data: AttendanceUser) => {
  if (data.token) {
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_URL}/attendances/user`,
      {
        params: {
          status: data.status,
        },
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }
    );

    return response.data;
  }
};

const CardDashboard = ({ isCheckIn, isPending, isWFO, data }: CardProps) => {
  const numCheckIn = data === null || data === undefined ? 0 : data.length;

  return (
    <div
      className="py-4 px-5 rounded-lg lg:w-3/4"
      style={{ backgroundColor: "#EFD4BA" }}
    >
      <Group position="apart">
        <div className="bg-gray-100 p-7 rounded-full">
          {isCheckIn ? (
            <Bus size={45} />
          ) : isPending ? (
            <HourglassMedium size={45} />
          ) : isWFO ? (
            <SunDim size={45} />
          ) : (
            ""
          )}
        </div>
      </Group>

      <div className="py-2">
        <h1 className="text-lg">
          {isCheckIn
            ? "Your Check Ins"
            : isPending
            ? "You have"
            : isWFO
            ? "You got"
            : ""}
        </h1>
        <h1 className="text-7xl font-fraunces font-medium">
          {isCheckIn
            ? numCheckIn
            : isPending
            ? data?.total
            : isWFO
            ? data?.total
            : ""}
        </h1>
        <h1 className="text-lg ">
          {isCheckIn
            ? "This Month"
            : isPending
            ? "Pending Request"
            : isWFO
            ? "Future WFO"
            : ""}
        </h1>
      </div>
    </div>
  );
};
type CheckInsProps = {
  attendance_id: string;
  is_checkins: boolean;
};

const DashboardEmployee = () => {
  const { state } = useContext(AuthContext);
  const { token, profile } = state;
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const [isSucces, setIsSucces] = useState<boolean>(false);
  const [isTemperature, setIsTemperature] = useState<number>();
  const dateNow = Date.now();
  const date = moment(dateNow).format("YYYY-MM-DD");

  const { data: dataCheckIn } = useQuery("getCheckIn", () =>
    fetchCheckIn(token)
  );

  const { data: attendanceApprove } = useQuery("getAttendanceApproved", () =>
    fetchAttendanceUser({
      token: token,
      status: "approved",
    })
  );

  const { data: attendancePending } = useQuery("getAttendancePending", () =>
    fetchAttendanceUser({
      token: token,
      status: "pending",
    })
  );

  const { data: allAttendance } = useQuery("getAttendance", () =>
    fetchAttendanceUser({
      token: token,
      status: "",
    })
  );

  const mutation = useMutation(postCheckIn, {
    onSettled: async (data: any) => {
      if (data.status === 200) {
        queryClient.invalidateQueries("getCheckIn");
        setIsSucces(true);
        setTimeout(() => {
          setIsSucces(false);
        }, 2000);
        notifications.showNotification({
          title: "Success",
          message: "Check In Success!",
          icon: <Check className="text-white" size={32} />,
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

  const attendanceFilter = attendanceApprove?.current_attendances
    ?.filter(
      (data: AttendancesProps) => moment(data.day).format("YYYY-MM-DD") === date
    )
    .map((data: AttendancesProps) => {
      return data;
    });

  const attendanceId =
    attendanceFilter?.length > 0 ? attendanceFilter[0].id : undefined;
  const isCheckIn = dataCheckIn
    ?.filter((data: CheckInsProps) => data.attendance_id === attendanceId)
    .map((data: CheckInsProps) => {
      return data;
    });
  const checkInId = isCheckIn?.length > 0 ? isCheckIn[0] : undefined;

  const handleCheckIn = async () => {
    await mutation.mutate({
      token: token,
      attendance_id: attendanceId,
      temprature: isTemperature,
    });
  };
  return (
    <div>
      <h1 className="text-3xl font-fraunces">Hello {profile?.name}, 👋</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mt-5">
        <div className="lg:col-span-2">
          <div>
            <h2>Your WFO Schedule</h2>
            <MyScheduleComponent
              data={attendanceApprove?.current_attendances}
            />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="flex-wrap shrink">
            {checkInId && (
              <h1 className="text-3xl font-fraunces">
                You have checked in for today! 🎉
                <br /> Have a cup of coffee and enjoy your day ☕💻
              </h1>
            )}
            {!attendanceId && (
              <h1 className="text-3xl font-fraunces">
                Enjoy your WFH today! 🏠
              </h1>
            )}

            {attendanceId && !checkInId && (
              <>
                <h1 className="text-3xl font-fraunces">
                  Welcome to the office, please check in!
                </h1>
                <div className="my-4 flex flex-row gap-x-2 items-end">
                  <div>
                    <label>Temperature</label>
                    <Input
                      type="number"
                      placeholder="Temperature"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setIsTemperature(+e.target.value)
                      }
                    />
                  </div>
                  <Button
                    style={{ backgroundColor: "#A5D8FF" }}
                    onClick={handleCheckIn}
                  >
                    Check In 🌡️✅
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 mt-5 lg:mt-3 my-10 gap-x-4 gap-y-4">
        <CardDashboard
          isCheckIn={true}
          isPending={false}
          isWFO={false}
          data={dataCheckIn}
        />
        <CardDashboard
          isCheckIn={false}
          isPending={true}
          isWFO={false}
          data={attendancePending}
        />
        <CardDashboard
          isCheckIn={false}
          isPending={false}
          isWFO={true}
          data={allAttendance}
        />
      </div>
    </div>
  );
};

export default DashboardEmployee;
