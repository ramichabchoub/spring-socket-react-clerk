import BooksTable from "./components/BooksTable";
import Header from "@/components/Header";
import { useUserSync } from "./hooks/useUserSync";

function App() {
  useUserSync();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <BooksTable />
      </main>
    </div>
  );
}

export default App;
