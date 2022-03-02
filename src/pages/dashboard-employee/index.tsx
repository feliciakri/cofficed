import { Alert, Button, Group, Input, LoadingOverlay } from "@mantine/core";
import axios from "axios";
import moment from "moment";
import { Bus, Syringe } from "phosphor-react";
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AuthContext } from "../../context/AuthContext";

type AttendanceUserDay = {
  id: string;
  day: string;
  office_id: string;
  status: string;
  admin: string;
  office: string;
  employee: string;
  user_avatar: string;
  user_email: string;
  notes: string;
  nik: string;
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

const fetchCheckIn = async (token: string | null) => {
  if (token) {
    const data = await axios.get(
      `${process.env.REACT_APP_API_KEY}/check/user`,
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
    const { data: response } = await axios.post(
      `${process.env.REACT_APP_API_KEY}/check/ins`,
      {
        attendance_id: attendance_id,
        temprature: +temprature,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
};

type AttendanceUser = {
  token: string | null;
  status: string;
};
const fetchAttendanceUser = async (data: AttendanceUser) => {
  if (data.token) {
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_KEY}/attendances/user`,
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

type CardProps = {
  isCheckIn: boolean;
  isPending: boolean;
  isWFO: boolean;
  data: any;
};
const CardDashboard: React.FC<CardProps> = ({
  isCheckIn,
  isPending,
  isWFO,
  data,
}) => {
  const numCheckIn = data === null || data === undefined ? 0 : data.length;

  return (
    <div
      className="py-4 px-5 rounded-lg lg:w-3/4"
      style={{ backgroundColor: "#EFD4BA" }}
    >
      <Group position="apart">
        <div className="bg-gray-100 p-7 rounded-full">
          <Bus size={45} />
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
  const { token } = state;
  const queryClient = useQueryClient();
  const [isSucces, setIsSucces] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [isTemprature, setIsTemprature] = useState<number>();
  const dateNow = Date.now();
  const date = moment(dateNow).format("YYYY-MM-DD");
  const { isLoading, data } = useQuery("getProfile", () => fetchProfile(token));
  const { data: dataCheckIn } = useQuery("getCheckIn", () =>
    fetchCheckIn(token)
  );
  const { name, office_name } = data;

  const { data: attendaceApprove } = useQuery("getAttendanceApproved", () =>
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
    onSuccess: async () => {
      queryClient.invalidateQueries("getCheckIn");
      setIsSucces(true);
      setTimeout(() => {
        setIsSucces(false);
      }, 2000);
    },
    onError: async () => {
      setIsFailed(true);
      setTimeout(() => {
        setIsFailed(false);
      }, 2000);
    },
  });

  const attendanceFilter = attendaceApprove?.current_attendances
    ?.filter(
      (data: AttendanceUserDay) =>
        moment(data.day).format("YYYY-MM-DD") === date &&
        data.office === office_name
    )
    .map((data: AttendanceUserDay) => {
      return data;
    });

  console.log(attendanceFilter);
  const attendanceId =
    attendanceFilter?.length > 0 ? attendanceFilter[0].id : undefined;
  const isCheckIn = dataCheckIn
    ?.filter((data: CheckInsProps) => data.attendance_id === attendanceId)
    .map((data: CheckInsProps) => {
      return data;
    });
  const checkInId =
    isCheckIn && isCheckIn.length > 0 ? isCheckIn[0] : undefined;

  const handleCheckIn = async () => {
    await mutation.mutate({
      token: token,
      attendance_id: attendanceId,
      temprature: isTemprature,
    });
  };

  if (isLoading) {
    <LoadingOverlay visible={isLoading} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-fraunces">Hello {name},</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 my-10">
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
      <div className="my-2">
        {isSucces && (
          <Alert title="Checked in!" color="blue">
            Have a cup of coffee and enjoy your day
          </Alert>
        )}
        {isFailed && (
          <Alert title="Failed!" color="red">
            You have been check in today!
          </Alert>
        )}
        {checkInId && (
          <h1 className="text-3xl font-fraunces">
            You have been check in today!
          </h1>
        )}
        {!attendanceId && (
          <h1 className="text-3xl font-fraunces">
            You don't have request WFO today!
          </h1>
        )}
        {attendanceId && !checkInId && (
          <>
            <h1 className="text-3xl font-fraunces">Enjoy your WFH today!</h1>
            <div className="my-4 flex flex-row gap-x-2 items-end">
              <div className="w-1/6">
                <label>Temprature</label>
                <Input
                  type="number"
                  placeholder="Temprature"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setIsTemprature(+e.target.value)
                  }
                />
              </div>
              <Button
                style={{ backgroundColor: "#A5D8FF" }}
                rightIcon={<Syringe size={20} className="text-red-500" />}
                onClick={handleCheckIn}
              >
                Check In
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardEmployee;
