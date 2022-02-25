import { Button, Group, LoadingOverlay } from "@mantine/core";
import axios from "axios";
import { Bus, Syringe } from "phosphor-react";
import { useContext, useState } from "react";
import { useQuery } from "react-query";
import { AuthContext } from "../../context/AuthContext";

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
  // number check in, pending, and future wfo
  const numCheckIn = data === null ? 0 : data;
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
const DashboardEmployee = () => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [isCheckIn, setIsCheckIn] = useState<boolean>(false);
  const { isLoading, data } = useQuery("getProfile", () => fetchProfile(token));
  const { data: dataCheckIn } = useQuery("getCheckIn", () =>
    fetchCheckIn(token)
  );

  const handleCheckIn = () => {
    // Send check in to backend
    setIsCheckIn(true);
  };

  if (isLoading) {
    <LoadingOverlay visible={isLoading} />;
  }
  const { name } = data;
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
        {!isCheckIn ? (
          <>
            <h1 className="text-3xl font-fraunces">Enjoy your WFH today!</h1>
            <div className="my-4">
              <Button
                style={{ backgroundColor: "#A5D8FF" }}
                rightIcon={<Syringe size={20} className="text-red-500" />}
                onClick={handleCheckIn}
              >
                Check In
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-fraunces">Checked in!</h1>
            <div className="my-4">
              <p>Have a cup of coffee and enjoy your day!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardEmployee;
