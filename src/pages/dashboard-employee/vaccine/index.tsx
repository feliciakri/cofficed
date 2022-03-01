import { Syringe, Upload, X } from "phosphor-react";
import {
  Stepper,
  Button,
  Group,
  Modal,
  Text,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { SubmitHandler, useForm } from "react-hook-form";

type ModalVaccineProps = {
  isOpened: boolean;
  setIsOpened: (arg: boolean) => void;
};
const postImage = async (data: any) => {
  const { token, image } = data;
  const { data: response } = await axios
    .post(`${process.env.REACT_APP_API_KEY}/certificates/`, image, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {})
    .catch((err) => err);

  return response.data;
};

type Inputs = {
  image: string;
};
const ModalVaccine = ({ isOpened, setIsOpened }: ModalVaccineProps) => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [isImage, setIsImage] = useState<string | null>(null);
  const [isSucces, setIsSucces] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { register, handleSubmit } = useForm<Inputs>();
  const mutation = useMutation(postImage, {
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: async () => {
      setIsLoading(false);
      setIsSucces(true);
      setTimeout(() => {
        setIsFailed(false);
      }, 2000);
    },
    onError: () => {
      setIsLoading(false);
      setIsFailed(true);
      setTimeout(() => {
        setIsFailed(false);
      }, 2000);
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const bodyData = new FormData();
    bodyData.append("image", data.image[0]);
    const dataInput = {
      token: token,
      image: bodyData,
    };
    await mutation.mutate(dataInput);
  };
  const handleInputImage = (files: any) => {
    const file = files[0];
    const url = URL.createObjectURL(file);
    setIsImage(url);
  };
  return (
    <Modal opened={isOpened} onClose={() => setIsOpened(false)} centered>
      {isLoading && <LoadingOverlay visible={isLoading} />}
      <h1 className="text-center font-fraunces text-lg">
        Upload Certificate Vaccine
      </h1>
      {isSucces && (
        <Alert title="Success!" color="Blue">
          Your certificate has been uploaded
        </Alert>
      )}
      {isFailed && (
        <Alert title="Failed :(" color="red">
          Please wait for the previous image verification...
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="my-2">
        <Dropzone
          onDrop={handleInputImage}
          onReject={(files) => console.log("rejected files", files)}
          accept={[
            MIME_TYPES.png,
            MIME_TYPES.jpeg,
            MIME_TYPES.svg,
            MIME_TYPES.svg,
          ]}
          maxSize={3 * 1024 ** 2}
          {...register("image", {
            required: true,
          })}
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
                  Attach as files as you like, each file should not exceed 2mb
                </Text>
                {isImage && <img src={isImage} alt="images vaccine" />}
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
const fecthCertificate = async (token: string | null) => {
  if (token) {
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_KEY}/certificates/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
};
const DashboardEmployeeVaccine = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const { state } = useContext(AuthContext);
  const { token } = state;

  const { data, isLoading } = useQuery("getVaccineUser", () =>
    fecthCertificate(token)
  );

  const [active, setActive] = useState<number>(0);
  useEffect(() => {
    if (data) {
      setActive(data.length);
    }
  }, [data]);
  if (isLoading) {
    <LoadingOverlay visible={isLoading} />;
  }
  return (
    <div className="mx-6 my-2">
      <ModalVaccine isOpened={isOpened} setIsOpened={setIsOpened} />
      <div className="flex flex-row space-x-2 items-center">
        <h1 className="capitalize font-fraunces text-2xl">
          vaccine certificates
        </h1>
        <Syringe size={30} className="text-red-500" />
      </div>
      <div className="my-6">
        <Stepper
          active={active}
          onStepClick={setActive}
          breakpoint="sm"
          orientation="vertical"
        >
          {data &&
            data
              .map((certificate: any, i: number) => (
                <Stepper.Step
                  label={`Vaccin ${certificate.dosage}`}
                  description={certificate.status}
                  key={i}
                  disabled={certificate.status === "approved"}
                  completedIcon={
                    certificate.status === "rejected" ? <X size={20} /> : ""
                  }
                />
              ))
              .reverse()}
        </Stepper>

        <div className="my-10">
          <h1 className="py-2">Upload your certificate</h1>
          <Button
            radius="lg"
            rightIcon={<Upload size={20} />}
            onClick={() => setIsOpened(true)}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployeeVaccine;
