import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import TodoApp from "./routes/Page";

const router = createBrowserRouter([
  {
    path: "/",
    index: true,
    lazy: async () => import("@/routes/index"),
  },
  {
    path: "/new",
    element: <TodoApp />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
