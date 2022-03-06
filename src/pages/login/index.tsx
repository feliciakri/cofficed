import { Button, Input } from "@mantine/core";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Check,
  EnvelopeSimple,
  Key,
  WarningCircle,
  XCircle,
} from "phosphor-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AuthActionKind } from "../../context/AuthReducer";
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { useNotifications } from "@mantine/notifications";
type InputLogin = {
  identity: string;
  password: string;
};

const Login = () => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const notifications = useNotifications();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<InputLogin>();
  const onSubmit: SubmitHandler<InputLogin> = (data) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/users/login`, data)
      .then((res: AxiosResponse) => {
        const role = res.data.data.role;
        localStorage.setItem(
          "users",
          JSON.stringify({ ...res.data.data, role: role })
        );
        dispatch({
          type: AuthActionKind.LOGIN_SUCCESS,
          payload: { token: res.data.data.token, role: role },
        });
        notifications.showNotification({
          title: "Success",
          message: "Login Success!",
          icon: <Check className="text-white" size={32} />,
        });
        navigate("/");
      })
      .catch(() => {
        notifications.showNotification({
          title: "Failed",
          color: "red",
          message: "Login Failed!",
          icon: <XCircle className="text-white" size={32} />,
        });
      });
  };
  const invalidEmail = errors.identity ? true : false;
  const invalidPassword = errors.password ? true : false;

  return (
    <>
      <div className="flex items-center bg-white h-screen">
        <div className="flex w-screen md:flex-row">
          <div className="flex items-center w-full justify-center p-6 sm:p-12 md:w-1/2">
            <div className=" md:w-3/4">
              <img
                src="/android-chrome-192x192.png"
                alt="logo"
                className="h-16"
              />
              <h1 className="mb-4 text-2xl lg:text-4xl font-bold text-black font-fraunces my-4">
                Sign in to your account
              </h1>

              <form onSubmit={handleSubmit(onSubmit)} className="my-2">
                <div>
                  <label className="block text-sm">Name</label>
                  <Input
                    type="email"
                    placeholder="Your email"
                    icon={<EnvelopeSimple className="w-6 h-6" />}
                    {...register("identity", {
                      required: true,
                    })}
                    invalid={invalidEmail}
                  />
                  {errors.identity && (
                    <p className="text-sm text-gray-500">
                      Please enter your email!
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm">Password</label>
                  <Input
                    type="password"
                    placeholder="Your password"
                    icon={<Key className="w-6 h-6" />}
                    rightSection={
                      invalidPassword && (
                        <WarningCircle className="w-6 h-6 text-red-600" />
                      )
                    }
                    invalid={invalidPassword}
                    {...register("password", {
                      required: true,
                      minLength: 4,
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-gray-500">
                      Your password must be more than 4 characters
                    </p>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button size="sm" type="submit">
                    Login
                  </Button>
                </div>
              </form>
              <div className="text-sm text-gray-500 my-4">
                <p>Need an account of forget your Password?</p>
                <p>Kindly contact your HR</p>
              </div>
            </div>
          </div>
          <div className="md:h-screen md:w-1/2 md:block hidden">
            <img
              className="object-cover w-full h-full"
              src="https://source.unsplash.com/user/erondu/1600x900"
              alt="images login"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
