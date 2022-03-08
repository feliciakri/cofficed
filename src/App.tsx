import Router from "./router";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthContextProvider } from "./context/AuthContext";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { NotificationsProvider } from "@mantine/notifications";

function App() {
	const queryClient = new QueryClient();
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<AuthContextProvider>
					<MantineProvider
						theme={{
							breakpoints: {
								xs: 500,
								sm: 800,
								md: 1000,
								lg: 1200,
								xl: 1400,
							},
							fontFamily: "Questrial, sans-serif",
						}}
						emotionOptions={{ key: "mantine", prepend: false }}
					>
						<NotificationsProvider autoClose={10000}>
							<Router />
						</NotificationsProvider>
					</MantineProvider>
				</AuthContextProvider>
			</QueryClientProvider>
		</>
	);
}

export default App;
