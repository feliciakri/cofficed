import {
  LoadingOverlay,
  Button,
  Modal,
  Group,
  Text,
  PasswordInput,
} from "@mantine/core";
import { useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { ChangeEvent, useContext } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNotifications } from "@mantine/notifications";
import { Check, XCircle } from "phosphor-react";

type ModalProps = {
  isOpened: boolean;
  setIsOpened: (arg: boolean) => void;
};

type PasswordModalProps = {
  isOpened: boolean;
  setIsOpened: (arg: boolean) => void;
  datap: any;
};

type InputPassword = {
  password: string;
};

const postAvatar = async (data: any) => {
  if (data) {
    const { token, image } = data;
    const response = await axios
      .post(`${process.env.REACT_APP_API_URL}/users/avatar`, image, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: AxiosResponse) => {
        return response;
      })
      .catch((error: AxiosError) => {
        return error.message;
      });

    return response;
  }
};
const putPassword = async (data: any) => {
  if (data) {
    const { token, dataInput } = data;
    const response = axios
      .put(`${process.env.REACT_APP_API_URL}/users/`, dataInput, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: AxiosResponse) => {
        return response;
      })
      .catch((error: AxiosError) => {
        return error.message;
      });

    return response;
  }
};

const ModalAvatar = ({ isOpened, setIsOpened }: ModalProps) => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [isImage, setIsImage] = useState<Blob>();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mutation = useMutation(postAvatar, {
    onMutate: async () => {
      setIsLoading(true);
    },
    onSettled: (data: any) => {
      queryClient.invalidateQueries("getProfile", data.id);
      if (data.status === 200) {
        setIsLoading(false);
        notifications.showNotification({
          title: "Success",
          message: "Change avatar is Succesfully",
          icon: <Check className="text-white" size={32} />,
        });
        setTimeout(() => {
          setIsOpened(false);
        }, 500);
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

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isImage) {
      const bodyData = new FormData();
      bodyData.append("avatar", isImage);
      const dataInput = {
        token: token,
        image: bodyData,
      };
      await mutation.mutate(dataInput);
    }
  };

  const handleInputImage = (files: any) => {
    const file = files[0];
    setIsImage(file);
  };
  const imagePreview = isImage && URL.createObjectURL(isImage);
  return (
    <Modal opened={isOpened} onClose={() => setIsOpened(false)} centered>
      {isLoading && <LoadingOverlay visible={isLoading} />}
      <h1 className="text-center font-fraunces text-lg">Upload Avatar</h1>

      <form onSubmit={onSubmit} className="my-2">
        <Dropzone
          onDrop={handleInputImage}
          onReject={(files) => console.log("rejected files", files)}
          accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg]}
          maxSize={3 * 1024 ** 2}
        >
          {(status) => (
            <Group
              position="center"
              spacing="xl"
              style={{ minHeight: 80, pointerEvents: "none" }}
            >
              <div>
                <Text size="xl" inline>
                  Drag images here or click to select files
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  Attach your avatar, each file should not exceed 2mb
                </Text>
                {imagePreview && (
                  <img
                    className="mt-5"
                    src={imagePreview}
                    alt="images avatar"
                  />
                )}
              </div>
            </Group>
          )}
        </Dropzone>
        <div className="flex justify-end mr-2 mt-6">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
};

const ModalPassword = ({
  isOpened,
  setIsOpened,
  datap,
}: PasswordModalProps) => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const mutation = useMutation(putPassword, {
    onSettled: (data: any) => {
      if (data.status === 200) {
        setIsOpened(false);
        setIsLoading(false);
        notifications.showNotification({
          title: "Success",
          message: `${data.data.meta.message}`,
          icon: <Check className="text-white" size={32} />,
        });
      } else {
        setIsLoading(false);
        notifications.showNotification({
          title: "Failed",
          color: "red",
          message: `${data}`,
          icon: <XCircle className="text-white" size={32} />,
        });
      }
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleSubmit } = useForm<InputPassword>();
  const [value, setValue] = useState("");
  const notifications = useNotifications();
  const onSubmit: SubmitHandler<InputPassword> = async (data) => {
    const dataUser = {
      nik: datap.nik,
      email: datap.email,
      name: datap.name,
      phone: datap.phone,
      password: value,
    };
    const dataInput = {
      token: token,
      dataInput: dataUser,
    };
    await mutation.mutate(dataInput);
  };

  return (
    <Modal opened={isOpened} onClose={() => setIsOpened(false)} centered>
      {isLoading && <LoadingOverlay visible={isLoading} />}
      <h1 className="text-center font-fraunces text-lg">Change Password</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="my-2">
        <PasswordInput
          placeholder="Password"
          label="Password"
          required
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        <div className="flex justify-end mr-2 mt-6">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
};

const ProfileSetting = () => {
  const { state } = useContext(AuthContext);
  const { profile } = state;

  //avatar modal
  const [amOpened, setAmOpened] = useState(false);
  //password modal
  const [pwOpened, setPwOpened] = useState(false);

  return (
    <>
      <ModalAvatar isOpened={amOpened} setIsOpened={setAmOpened} />
      <ModalPassword
        isOpened={pwOpened}
        setIsOpened={setPwOpened}
        datap={profile}
      />
      <div className="divide-y divide-gray-200">
        <div className="mt-2 space-y-1">
          <h3 className="text-xl leading-6 font-medium font-fraunces text-gray-900">
            Your Profile
          </h3>
          <p className="max-w-2xl text-sm text-gray-500">
            Only your email, name and avatar are visible to your coworkers.
          </p>
        </div>
        <div className="mt-6">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">{profile?.name}</span>
                {/* <span className="ml-4 flex-shrink-0">
									<button
										type="button"
										className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
									>
										Update
									</button>
								</span> */}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
              <dt className="text-sm font-medium text-gray-500">Photo</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={`${profile?.avatar}?${Date.now()}`}
                    alt="images"
                  />
                </span>
                <span className="ml-4 flex-shrink-0 flex items-start space-x-4">
                  <button
                    type="button"
                    className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={() => setAmOpened(true)}
                  >
                    Update
                  </button>
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">{profile?.email}</span>
                {/* <span className="ml-4 flex-shrink-0">
									<button
										type="button"
										className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
									>
										Update
									</button>
								</span> */}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200">
              <dt className="text-sm font-medium text-gray-500">NIK</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">{profile?.nik}</span>
                {/* <span className="ml-4 flex-shrink-0">
									<button
										type="button"
										className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
									>
										Update
									</button>
								</span> */}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">{profile?.phone}</span>
                {/* <span className="ml-4 flex-shrink-0">
									<button
										type="button"
										className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
									>
										Update
									</button>
								</span> */}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Office</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">{profile?.office_name}</span>
                {/* <span className="ml-4 flex-shrink-0">
									<button
										type="button"
										className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
									>
										Update
									</button>
								</span> */}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Password</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">●●●●●●●●●●●</span>
                <span className="ml-4 flex-shrink-0">
                  <button
                    type="button"
                    className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={() => setPwOpened(true)}
                  >
                    Update
                  </button>
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
};

export default ProfileSetting;
