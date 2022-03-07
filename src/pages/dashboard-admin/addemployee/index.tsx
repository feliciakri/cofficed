import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Input,
  InputWrapper,
  PasswordInput,
  Text,
  RadioGroup,
  Radio,
  Select,
} from "@mantine/core";
import {
  Envelope,
  User,
  Hash,
  Key,
  Phone,
  XCircle,
  Check,
} from "phosphor-react";
import { ErrorMessage } from "@hookform/error-message";
import axios from "axios";
import { useNotifications } from "@mantine/notifications";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { AuthContext } from "../../../context/AuthContext";
import {
  CategoryState,
  LocationState,
} from "../../dashboard-employee/schedule";

type InputAddEmployee = {
  name: string;
  email: string;
  password: string;
  phone: string;
  nik: string;
  role: string;
  office_id: string;
};

const fetchCategory = async () => {
  const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/offices/`);
  return data.data;
};
export default function AddEmployee() {
  const { state } = useContext(AuthContext);
  const { data } = useQuery("getCategory", fetchCategory);
  const [isLocation, setIsLocation] = useState<CategoryState[]>();

  useEffect(() => {
    if (data) {
      setIsLocation(
        data?.map((location: LocationState) => ({
          value: `${location.id}`,
          label: `${location.name}`,
        }))
      );
    }
  }, [data]);

  const notifications = useNotifications();
  const {
    control,
    handleSubmit,
    register,
    resetField,
    formState: { errors },
  } = useForm<InputAddEmployee>();
  const onSubmit: SubmitHandler<InputAddEmployee> = async (data) => {
    await axios
      .post(`${process.env.REACT_APP_API_URL}/users/`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      })
      .then((res) => {
        notifications.showNotification({
          title: "Success",
          message: `User Added`,
          icon: <Check className="text-white" size={32} />,
        });
        resetField("name");
        resetField("email");
        resetField("password");
        resetField("phone");
        resetField("nik");
        resetField("office_id");
        resetField("role");
      })
      .catch((err) => {
        notifications.showNotification({
          title: `${err}`,
          color: "red",
          message: "User Not Added",
          icon: <XCircle className="text-white" size={32} />,
        });
      });
  };
  const invalidEmail = errors.email ? true : false;
  const invalidPassword = errors.password ? true : false;
  const invalidPhone = errors.phone ? true : false;
  const invalidNik = errors.nik ? true : false;
  const invalidName = errors.name ? true : false;
  const [chipValue, setChipValue] = useState("user");

  return (
    <>
      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-fraunces leading-6 text-gray-900">
                New Employee Information
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Please check for data accuracy
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 bg-white sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-6">
                      <InputWrapper
                        id="input-name-label"
                        required
                        label="Name"
                        description="Name must be at least 3 characters"
                      >
                        <Input
                          icon={<User />}
                          invalid={invalidName}
                          {...register("name", {
                            required: true,
                            minLength: {
                              value: 3,
                              message: "Name must be at least 3 characters",
                            },
                          })}
                        />
                        <ErrorMessage
                          errors={errors}
                          render={({ message }) => (
                            <Text size="xs" color="red">
                              {message}
                            </Text>
                          )}
                          name="name"
                        />
                      </InputWrapper>
                    </div>

                    <div className="col-span-6 sm:col-span-6">
                      <InputWrapper
                        id="input-email-label"
                        required
                        label="Email"
                      >
                        <Input
                          icon={<Envelope />}
                          placeholder="someone@mail.com"
                          invalid={invalidEmail}
                          {...register("email", {
                            required: true,
                            pattern: {
                              value:
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                              message: "Invalid email address",
                            },
                          })}
                        />
                        <ErrorMessage
                          errors={errors}
                          render={({ message }) => (
                            <Text size="xs" color="red">
                              {message}
                            </Text>
                          )}
                          name="email"
                        />
                      </InputWrapper>
                    </div>

                    <div className="col-span-6 sm:col-span-6">
                      <InputWrapper
                        id="input-nik-label"
                        required
                        label="NIK"
                        description="NIK must be 16 digits"
                      >
                        <Input
                          icon={<Hash />}
                          placeholder="3123456789123456"
                          invalid={invalidNik}
                          {...register("nik", {
                            required: true,
                            pattern: {
                              value: /^[0-9]{16}$/i,
                              message: "Invalid NIK",
                            },
                          })}
                        />
                        <ErrorMessage
                          errors={errors}
                          render={({ message }) => (
                            <Text size="xs" color="red">
                              {message}
                            </Text>
                          )}
                          name="nik"
                        />
                      </InputWrapper>
                    </div>

                    <div className="col-span-6 sm:col-span-6">
                      <InputWrapper
                        id="input-password-label"
                        required
                        label="Password"
                        description="Password must be at least 8 characters"
                      >
                        <PasswordInput
                          icon={<Key />}
                          invalid={invalidPassword}
                          {...register("password", {
                            required: true,
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                          })}
                        />
                        <ErrorMessage
                          errors={errors}
                          render={({ message }) => (
                            <Text size="xs" color="red">
                              {message}
                            </Text>
                          )}
                          name="password"
                        />
                      </InputWrapper>
                    </div>

                    <div className="col-span-6 sm:col-span-6">
                      <InputWrapper
                        id="input-phone-label"
                        required
                        label="Phone Number"
                        description="Phone number must be 10 digits"
                      >
                        <Input
                          icon={<Phone />}
                          placeholder="08123456789"
                          invalid={invalidPhone}
                          {...register("phone", {
                            required: true,
                            pattern: {
                              value: /^[0-9]{10}$/i,
                              message: "Invalid phone number",
                            },
                          })}
                        />
                        <ErrorMessage
                          errors={errors}
                          render={({ message }) => (
                            <Text size="xs" color="red">
                              {message}
                            </Text>
                          )}
                          name="phone"
                        />
                      </InputWrapper>
                    </div>
                    <div className="col-span-6 sm:col-span-6">
                      {isLocation && (
                        <Controller
                          control={control}
                          name="office_id"
                          render={({ field }) => {
                            return (
                              <Select
                                label="Select which office"
                                placeholder="Pick one"
                                data={isLocation}
                                {...field}
                              />
                            );
                          }}
                        />
                      )}
                    </div>
                    <div className="col-span-6 sm:col-span-6">
                      <InputWrapper
                        id="input-role-label"
                        label="Select User Role"
                        description="Default Role is Employee"
                        required
                      >
                        <RadioGroup
                          value={chipValue}
                          onChange={setChipValue}
                          required
                        >
                          <Radio value="user" {...register("role")}>
                            Employee
                          </Radio>
                          <Radio value="admin" {...register("role")}>
                            Admin
                          </Radio>
                        </RadioGroup>
                        <ErrorMessage
                          errors={errors}
                          render={({ message }) => (
                            <Text size="xs" color="red">
                              {message}
                            </Text>
                          )}
                          name="role"
                        />
                      </InputWrapper>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
