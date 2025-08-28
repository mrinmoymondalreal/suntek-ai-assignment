import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import TodoApp from "./routes/tasks";
import LoginPage from "./routes/login";
import SignUpPage from "./routes/signup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchClient } from "./lib/fetchClient";
import { ThemeProvider } from "./components/theme-provider";

const router = createBrowserRouter([
  {
    path: "/",
    index: true,
    lazy: async () => import("@/routes/index"),
  },
  {
    path: "/tasks",
    element: <TodoApp />,
    loader: async () => {
      const response = await fetchClient("/api/tasks");
      const activeTimers = await fetchClient("/api/timers/active");
      return {
        tasks: (await response.json()).tasks,
        activeTimers: (await activeTimers.json()).active_timers,
      };
    },
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
