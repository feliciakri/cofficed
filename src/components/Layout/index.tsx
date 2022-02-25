import { Outlet } from "react-router-dom";
import {
  CalendarBlank,
  Syringe,
  HouseLine,
  CaretRight,
  CalendarCheck,
  Scroll,
  UserPlus,
  DotsThreeOutline,
} from "phosphor-react";
import { Link } from "react-router-dom";
import {
  AppShell,
  Burger,
  Button,
  Header,
  MediaQuery,
  Navbar,
  ScrollArea,
  useMantineTheme,
  LoadingOverlay,
} from "@mantine/core";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "react-query";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import axios from "axios";

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
const Layout = () => {
  const { state } = useContext(AuthContext);
  const { token, role } = state;
  const isAdmin = role?.toLowerCase() === "admin";
  const { isLoading, data } = useQuery("getProfile", () => fetchProfile(token));
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

  if (isLoading) {
    return (
      <div>
        <LoadingOverlay transitionDuration={500} visible={true} />
      </div>
    );
  }
  const { name, avatar, email } = data;

  return (
    <>
      <AppShell
        navbarOffsetBreakpoint="sm"
        padding="md"
        fixed
        navbar={
          <Navbar
            padding="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 300, lg: 300 }}
          >
            <Navbar.Section
              grow
              component={ScrollArea}
              ml={-10}
              mr={-10}
              sx={{ paddingLeft: 10, paddingRight: 10 }}
            >
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${
                    isActive ? "bg-gray-200" : ""
                  } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                }
              >
                <HouseLine size={20} />
                Dashboard
              </NavLink>
              <NavLink
                to="/dashboard-employee/schedule"
                className={({ isActive }) =>
                  `${
                    isActive ? "bg-gray-200" : ""
                  } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                }
              >
                <CalendarBlank size={20} />
                Schedule
              </NavLink>
              <NavLink
                to="/dashboard-employee/vaccine"
                className={({ isActive }) =>
                  `${
                    isActive ? "bg-gray-200" : ""
                  } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                }
              >
                <Syringe size={20} />
                Vaccine
              </NavLink>
              {isAdmin && (
                <>
                  <NavLink
                    to="/dashboard-admin/quota-schedule"
                    className={({ isActive }) =>
                      `${
                        isActive ? "bg-gray-200" : ""
                      } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                    }
                  >
                    <CalendarCheck size={20} />
                    <div className="bg-red-200 px-2 rounded-xl text-red-900 text-sm font-semibold">
                      Admin
                    </div>
                    Quota Schedule
                  </NavLink>
                  <NavLink
                    to="/dashboard-admin/vaccine"
                    className={({ isActive }) =>
                      `${
                        isActive ? "bg-gray-200" : ""
                      } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                    }
                  >
                    <Scroll size={20} />
                    <div className="bg-red-200 px-2 rounded-xl text-red-900 text-sm font-semibold">
                      Admin
                    </div>
                    Vaccine Certificates
                  </NavLink>
                  <NavLink
                    to="/dashboard-admin/wfo-request"
                    className={({ isActive }) =>
                      `${
                        isActive ? "bg-gray-200" : ""
                      } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                    }
                  >
                    <UserPlus size={20} />
                    <div className="bg-red-200 px-2 rounded-xl text-red-900 text-sm font-semibold">
                      Admin
                    </div>
                    WFO Requests
                  </NavLink>
                </>
              )}
            </Navbar.Section>
            <Navbar.Section>
              <hr className="my-2" />
              <div className="flex flex-row gap-x-2 items-center hover:cursor-pointer">
                <img
                  src={avatar}
                  alt="logo.png"
                  className="rounded-full w-12 h-12"
                />
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-col gap-y-0.5">
                    <h1 className="text-base font-bold">{name}</h1>
                    <p className="text-sm">{email}</p>
                  </div>
                  <CaretRight size={30} />
                </div>
              </div>
            </Navbar.Section>
          </Navbar>
        }
        header={
          <Header height={60} padding="xs">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-x-6">
                <div className="flex flex-row gap-x-2 items-center mx-3 font-fraunces">
                  <img
                    src="/apple-touch-icon.png"
                    alt="logo"
                    className="w-9 h-9"
                  />
                  <h1 className="text-xl">Coffee</h1>
                </div>
              </div>

              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
            </div>
          </Header>
        }
      >
        <div className="py-6 px-5">
          <Outlet />
        </div>
      </AppShell>
    </>
  );
};

export default Layout;
