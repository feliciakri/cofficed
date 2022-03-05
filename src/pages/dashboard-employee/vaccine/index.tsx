import { Spinner, Syringe, Upload, X } from "phosphor-react";
import {
	Stepper,
	Button,
	Group,
	Modal,
	Text,
	Alert,
	LoadingOverlay,
} from "@mantine/core";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthContext } from "../../../context/AuthContext";
import DefaultEmptyState from "../../../components/EmptyStates";

type CertificateProps = {
	dosage: number;
	status: string;
};
type ModalVaccineProps = {
	isOpened: boolean;
	setIsOpened: (arg: boolean) => void;
};
const postImage = async (data: any) => {
	if (data) {
		const { token, image } = await data;
		const response = await axios
			.post(`${process.env.REACT_APP_API_URL}/certificates/`, image, {
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

const ModalVaccine = ({ isOpened, setIsOpened }: ModalVaccineProps) => {
	const queryClient = useQueryClient();
	const { state } = useContext(AuthContext);
	const { token } = state;
	const [isImage, setIsImage] = useState<Blob>();
	const [isSucces, setIsSucces] = useState<boolean>(false);
	const [isFailed, setIsFailed] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const mutation = useMutation(postImage, {
		onMutate: () => {
			setIsLoading(true);
		},
		onSettled: (data: any) => {
			if (data.status === 200) {
				queryClient.invalidateQueries("getVaccineUser");
				setIsSucces(true);
				setIsLoading(false);
				setTimeout(() => {
					setIsSucces(false);
				}, 2000);
			} else {
				setIsLoading(false);
				setIsFailed(true);
				setTimeout(() => {
					setIsFailed(false);
				}, 2000);
			}
		},
	});
	const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isImage) {
			const bodyData = new FormData();
			bodyData.append("image", isImage);
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
	const previewImage = isImage && URL.createObjectURL(isImage);
	return (
		<Modal opened={isOpened} onClose={() => setIsOpened(false)} centered>
			{isLoading && <LoadingOverlay visible={isLoading} />}
			<h1 className="text-center font-fraunces text-lg">
				Upload Vaccine Certificate
			</h1>
			{isSucces && (
				<Alert title="Success!" color="Blue">
					Your certificate has been uploaded
				</Alert>
			)}
			{isFailed && (
				<Alert title="Failed :(" color="red">
					Please wait for the previous certificate to be verified...
				</Alert>
			)}
			<form className="my-2" onSubmit={onSubmit}>
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
									Attach your vaccine certificate, each file
									should not exceed 2mb
								</Text>
								{isImage && (
									<img
										src={previewImage}
										alt="images vaccine"
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
const fetchCertificate = async (token: string | null) => {
	if (token) {
		const { data: response } = await axios.get(
			`${process.env.REACT_APP_API_URL}/certificates/user`,
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
		fetchCertificate(token)
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
					vaccine certificates 💉
				</h1>
			</div>

			{!data && (
				<div className="mx-auto h-80 w-80 mt-5">
					<DefaultEmptyState />
				</div>
			)}
			<div className="my-6">
				<Stepper
					active={active}
					onStepClick={setActive}
					breakpoint="sm"
					orientation="vertical"
				>
					{data
						?.map((certificate: CertificateProps, i: number) => (
							<Stepper.Step
								label={`Vaccine ${certificate.dosage}`}
								description={certificate.status}
								key={i}
								disabled={certificate.status === "approved"}
								completedIcon={
									certificate.status === "rejected" ? (
										<X size={20} />
									) : certificate.status === "pending" ? (
										<Spinner size={20} />
									) : (
										""
									)
								}
							/>
						))
						.reverse()}
				</Stepper>
			</div>
			<div className="my-6">
				<h1 className="py-2">Upload your certificate</h1>
				<Button
					radius="sm"
					rightIcon={<Upload size={20} />}
					onClick={() => setIsOpened(true)}
				>
					Upload
				</Button>
			</div>
		</div>
	);
};

export default DashboardEmployeeVaccine;
