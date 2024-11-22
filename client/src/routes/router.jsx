import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";
import ClubsTable from "@/components/ClubsTable";
import Discussions from "@/components/Discussions";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ClubsTable />,
      },
      {
        path: "discussions",
        element: <Discussions />,
      },
      // Add more routes here as needed
    ],
  },
]);
