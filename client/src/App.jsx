import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { useUserSync } from "./hooks/useUserSync";
import { useWebSocket } from "./hooks/useWebSocket";
import { SidebarProvider } from "./components/ui/sidebar";

function App() {
  useUserSync();
  useWebSocket();

  return (
    <SidebarProvider>
      <RouterProvider router={router} />
    </SidebarProvider>
  );
}

export default App;
