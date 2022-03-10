import {
	Button,
	Input,
	InputWrapper,
	Text,
	PasswordInput,
} from "@mantine/core";
import { SubmitHandler, useForm } from "react-hook-form";
import { Check, Envelope, Key, XCircle } from "phosphor-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AuthActionKind } from "../../context/AuthReducer";
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { useNotifications } from "@mantine/notifications";
import { ErrorMessage } from "@hookform/error-message";
import LoginAnimation from "../../components/LoginAnimation";
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
			<div className="min-h-screen bg-white flex">
				<div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
					<div className="mx-auto w-full max-w-sm lg:w-96">
						<div>
							<img
								className="h-20 w-auto"
								src="/cofficed-logo-black.svg"
								alt="logo"
							/>
							<h1 className="mt-6 text-3xl font-fraunces text-gray-900">
								Sign in to your account
							</h1>
						</div>

						<div className="mt-8">
							<div className="mt-6">
								<form
									onSubmit={handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<InputWrapper
										id="input-email-label"
										required
										label="Email"
									>
										<Input
											icon={<Envelope />}
											placeholder="someone@mail.com"
											invalid={invalidEmail}
											{...register("identity", {
												required: true,
												pattern: {
													value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
													message:
														"Invalid email address",
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
									<InputWrapper
										id="input-password-label"
										required
										label="Password"
										className="space-y-1"
									>
										<PasswordInput
											icon={<Key />}
											invalid={invalidPassword}
											placeholder="●●●●●●●●●●"
											{...register("password", {
												required: true,
												minLength: {
													value: 6,
													message:
														"Password must be at least 6 characters",
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
									<div className="mt-6 flex justify-end">
										<Button size="sm" type="submit">
											Login
										</Button>
									</div>
								</form>
								<div className="text-sm text-gray-500 my-4">
									<p>
										Need an account of forget your Password?
									</p>
									<p>Kindly contact your HR</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="hidden lg:block relative w-0 flex-1">
					{/* <img
						className="absolute inset-0 h-full w-full object-cover"
						src="https://source.unsplash.com/user/erondu/1600x900"
						alt="login background"
					/> */}
					<div className="absolute inset-0 h-full w-full object-cover">
						<LoginAnimation />
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
