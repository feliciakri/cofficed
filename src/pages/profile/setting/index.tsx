import {
	useMantineTheme,
	LoadingOverlay,
	Button,
	Modal,
	Alert,
	Group,
	Text,
} from "@mantine/core";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useContext } from "react";
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { SubmitHandler, useForm } from "react-hook-form";

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

//change password
// const changePassword = async (password: string, token: string | null) => {
// 	console.log(password);
// 	axios.put(`${process.env.REACT_APP_API_KEY}/users/`, {
// 		password: password,
// 	}, {
// 		headers: {
// 			Authorization: `Bearer ${token}`,
// 		},
// 	})
// 	.then(function (response) {
// 		console.log(response);
// 	}
// 	)
// 	.catch(function (error) {
// 		console.log(error);
// 	}
// };

type ModalProps = {
	isOpened: boolean;
	setIsOpened: (arg: boolean) => void;
};

type Inputs = {
	image: string;
};

const postAvatar = async (data: any) => {
	const { token, image } = data;
	const { data: response } = await axios
		.post(`${process.env.REACT_APP_API_KEY}/users/avatar/`, image, {
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			},
		})
		.catch((err) => err);
	return response.data;
};

const ModalAvatar = ({ isOpened, setIsOpened }: ModalProps) => {
	const { state } = useContext(AuthContext);
	const { token } = state;
	const [isImage, setIsImage] = useState<string | null>(null);
	const [isSucces, setIsSucces] = useState<boolean>(false);
	const [isFailed, setIsFailed] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { register, handleSubmit } = useForm<Inputs>();
	const mutation = useMutation(postAvatar, {
		onMutate: () => {
			setIsLoading(true);
		},
		onSuccess: async () => {
			setIsSucces(true);
			setIsLoading(false);
			setTimeout(() => {
				setIsSucces(false);
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
			<h1 className="text-center font-fraunces text-lg">Upload Avatar</h1>
			{isSucces && (
				<Alert title="Success!" color="Blue">
					Your avatar has been uploaded
				</Alert>
			)}
			{isFailed && (
				<Alert title="Failed :(" color="red">
					Image upload failed
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
									Attach as files as you like, each file
									should not exceed 2mb
								</Text>
								{isImage && (
									<img src={isImage} alt="images vaccine" />
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

const ProfileSetting = () => {
	const { state } = useContext(AuthContext);
	const { token, role } = state;
	const isAdmin = role?.toLowerCase() === "admin";
	const { isLoading, data } = useQuery("getProfile", () =>
		fetchProfile(token)
	);
	//avatar modal
	const [amOpened, setAmOpened] = useState(false);
	//password modal
	const [pwOpened, setPwOpened] = useState(false);
	const theme = useMantineTheme();

	if (isLoading) {
		return (
			<>
				<div>
					<LoadingOverlay transitionDuration={500} visible={true} />
				</div>
			</>
		);
	}
	const { name, avatar, email, office_name, nik, phone } = data;
	console.log(data);
	return (
		<>
			<ModalAvatar isOpened={amOpened} setIsOpened={setAmOpened} />
			<div className="divide-y divide-gray-200">
				<div className="space-y-1">
					<h3 className="text-lg leading-6 font-medium text-gray-900">
						Profile
					</h3>
					<p className="max-w-2xl text-sm text-gray-500">
						This information will be displayed publicly so be
						careful what you share.
					</p>
				</div>
				<div className="mt-6">
					<dl className="divide-y divide-gray-200">
						<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
							<dt className="text-sm font-medium text-gray-500">
								Name
							</dt>
							<dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								<span className="flex-grow">{name}</span>
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
							<dt className="text-sm font-medium text-gray-500">
								Photo
							</dt>
							<dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								<span className="flex-grow">
									<img
										className="h-8 w-8 rounded-full"
										src={avatar}
										alt=""
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
							<dt className="text-sm font-medium text-gray-500">
								Email
							</dt>
							<dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								<span className="flex-grow">{email}</span>
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
							<dt className="text-sm font-medium text-gray-500">
								NIK
							</dt>
							<dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								<span className="flex-grow">{nik}</span>
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
							<dt className="text-sm font-medium text-gray-500">
								Office
							</dt>
							<dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								<span className="flex-grow">{office_name}</span>
								<span className="ml-4 flex-shrink-0">
									<button
										type="button"
										className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
									>
										Update
									</button>
								</span>
							</dd>
						</div>
						<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200">
							<dt className="text-sm font-medium text-gray-500">
								Password
							</dt>
							<dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								<span className="flex-grow">●●●●●●●●●●●</span>
								<span className="ml-4 flex-shrink-0">
									<button
										type="button"
										className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
