import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  CalendarBlank,
  Syringe,
  HouseLine,
  CaretRight,
  CalendarCheck,
  Scroll,
  UserPlus,
  HandWaving,
  SignOut,
  Gear,
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
  UnstyledButtonProps,
  UnstyledButton,
  Group,
  Avatar,
  Text,
  Menu,
} from "@mantine/core";
import { forwardRef, useState } from "react";

import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { AuthActionKind } from "../../context/AuthReducer";

const Layout = () => {
  const { state } = useContext(AuthContext);
  const { profile, role } = state;
  const isAdmin = role?.toLowerCase() === "admin";
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState<boolean>(false);
  //logout function
  function LogOutHandler() {
    localStorage.removeItem("token");
    localStorage.removeItem("users");
    dispatch({
      type: AuthActionKind.LOGOUT,
    });
    const redirect = async () => {
      await navigate("/");
    };
    redirect();
  }

  interface UserButtonProps extends UnstyledButtonProps {
    avatar: string;
    name: string;
    email: string;
    icon: React.ReactNode;
  }

  const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
    ({ avatar, name, email, icon, ...others }: UserButtonProps, ref) => (
      <UnstyledButton
        ref={ref}
        {...others}
        sx={(theme) => ({
          width: "120%",
          padding: theme.spacing.md,
          color:
            theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        <Group position="apart">
          <Avatar src={avatar} radius="xl" />

          <div style={{ flex: 1 }}>
            <Text size="sm" weight={500}>
              {name}
            </Text>

            <Text color="dimmed" size="xs">
              {email}
            </Text>
          </div>

          {icon || ">"}
        </Group>
      </UnstyledButton>
    )
  );

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
              <Group>
                <Menu
                  withArrow
                  placement="center"
                  position="top"
                  control={
                    <UserButton
                      avatar={profile?.avatar}
                      name={profile?.name}
                      email={profile?.email}
                      icon={<CaretRight size={30} />}
                    />
                  }
                >
                  <Menu.Item
                    component={NavLink}
                    to="/profile/setting"
                    icon={<Gear />}
                  >
                    Profile Settings
                  </Menu.Item>
                  <Menu.Item
                    onClick={LogOutHandler}
                    component={NavLink}
                    to="/"
                    color="red"
                    icon={<SignOut />}
                  >
                    Sign Out
                  </Menu.Item>
                </Menu>
              </Group>
            </Navbar.Section>
          </Navbar>
        }
        header={
          <Header height={60} padding="xs">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-x-6">
                <NavLink to="/">
                  <div className="flex flex-row gap-x-2 items-center mx-3 font-fraunces">
                    <img
                      src="/cofficed-logo-black.svg"
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
function dispatch(arg0: { type: any }) {
  throw new Error("Function not implemented.");
}
