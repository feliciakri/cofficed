import { Outlet } from "react-router-dom";
import {
  CalendarBlank,
  Syringe,
  HouseLine,
  CaretRight,
  CalendarCheck,
  Scroll,
  UserPlus,
  HandWaving,
} from "phosphor-react";

import {
  AppShell,
  Burger,
  Header,
  MediaQuery,
  Navbar,
  ScrollArea,
  useMantineTheme,
  Divider,
  Badge,
  Center,
} from "@mantine/core";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

const Layout = () => {
  const { state } = useContext(AuthContext);
  const { profile, role } = state;
  const isAdmin = role?.toLowerCase() === "admin";

  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

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
                to="/"
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
                  <Divider />
                  <Center>
                    <Badge
                      variant="gradient"
                      gradient={{
                        from: "grape",
                        to: "pink",
                        deg: 35,
                      }}
                      className="mt-3"
                    >
                      Admin Menus
                    </Badge>
                  </Center>

                  <NavLink
                    to="/dashboard-admin/quota-schedule"
                    className={({ isActive }) =>
                      `${
                        isActive ? "bg-gray-200" : ""
                      } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                    }
                  >
                    <CalendarCheck size={20} />
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
                    <HandWaving size={20} />
                    WFO Requests
                  </NavLink>
                  <NavLink
                    to="/dashboard-admin/add-employee"
                    className={({ isActive }) =>
                      `${
                        isActive ? "bg-gray-200" : ""
                      } flex flex-row items-center w-full hover:bg-gray-200 cursor-point py-3 px-2 my-1 gap-x-4 rounded-md`
                    }
                  >
                    <UserPlus size={20} />
                    Add New Employee
                  </NavLink>
                </>
              )}
            </Navbar.Section>
            <Navbar.Section>
              <hr className="my-2" />
              <NavLink to="/profile/setting">
                <div className="flex flex-row gap-x-2 items-center hover:cursor-pointer">
                  <>
                    <img
                      src={`${profile?.avatar}?${Date.now()}`}
                      alt="logo.png"
                      className="rounded-full w-12 h-12"
                    />
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className="flex flex-col gap-y-0.5">
                        <h1 className="text-base font-bold">{profile?.name}</h1>
                        <p className="text-sm">{profile?.email}</p>
                      </div>
                      <CaretRight size={30} />
                    </div>
                  </>
                </div>
              </NavLink>
            </Navbar.Section>
          </Navbar>
        }
        header={
          <Header height={60} padding="xs">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-x-6">
                <NavLink to="/dashboard">
                  <div className="flex flex-row gap-x-2 items-center mx-3 font-fraunces">
                    <img
                      src="/apple-touch-icon.png"
                      alt="logo"
                      className="w-9 h-9"
                    />
                    <h1 className="text-xl">Cofficed</h1>
                  </div>
                </NavLink>
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
