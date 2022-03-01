import { Alert, Button, Group, Input, LoadingOverlay } from "@mantine/core";
import axios from "axios";
import moment from "moment";
import { Bus, Syringe } from "phosphor-react";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "../../context/AuthContext";

type AttendanceToday = {
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

type AttendanceNow = {
  token: string | null;
  office: string;
  date: string;
  employee: string;
};
const fetchAttendanceNow = async ({
  token,
  office,
  date,
  employee,
}: AttendanceNow) => {
  if (token) {
    const data = await axios.get(
      `${process.env.REACT_APP_API_KEY}/attendances/`,
      {
        params: {
          office: office,
          date: date,
          employee: employee,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data.data.data;
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
          {isCheckIn ? numCheckIn : isPending ? 2 : isWFO ? 1 : ""}
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
  const [isAttendance, setIsAttendance] = useState<
    AttendanceToday | undefined
  >();
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

  const { data: dataAttendance } = useQuery("getAttendanceNow", () =>
    fetchAttendanceNow({
      token: token,
      employee: name,
      office: office_name,
      date: date,
    })
  );

  useEffect(() => {
    if (dataAttendance) {
      setIsAttendance(dataAttendance[0]);
    }
  }, [dataAttendance]);
  const mutation = useMutation(postCheckIn, {
    onSuccess: async () => {
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
  const attendanceId = dataAttendance && dataAttendance[0].id;
  const isCheckIn =
    dataCheckIn &&
    dataCheckIn.map((data: CheckInsProps) => {
      if (data.attendance_id === attendanceId) {
        return data.is_checkins;
      }
    });

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
          data={dataCheckIn}
        />
        <CardDashboard
          isCheckIn={false}
          isPending={false}
          isWFO={true}
          data={dataCheckIn}
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
        {isCheckIn && (
          <h1 className="text-3xl font-fraunces">
            You have been check in today!
          </h1>
        )}
        {isAttendance && isAttendance.status === "approved" && !isCheckIn[0] && (
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
