import ClubsTable from "./components/ClubsTable";
import Header from "@/components/Header";
import { useUserSync } from "./hooks/useUserSync";
import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  useUserSync();
  useWebSocket();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ClubsTable />
      </main>
    </div>
  );
}

export default App;
