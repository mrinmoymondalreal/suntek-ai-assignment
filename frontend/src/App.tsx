import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import TodoApp from "./routes/tasks";
import LoginPage from "./routes/login";
import SignUpPage from "./routes/signup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchClient } from "./lib/fetchClient";

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
      return await response.json();
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
