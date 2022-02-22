import Router from "./router";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthContextProvider } from "./context/AuthContext";
const queryClient = new QueryClient();

function App() {
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
            }}
            emotionOptions={{ key: "mantine", prepend: false }}
          >
            <Router />
          </MantineProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
