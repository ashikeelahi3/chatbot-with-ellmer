import Chatbot from "@/components/Chatbot";
import DataTable from "@/components/DataTable";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-white to-blue-300 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center p-4 animate-fade-in hide-scrollbar">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-12 items-stretch">
        <section className="flex-3 flex items-center justify-center">
          <Chatbot />
        </section>
        <div className="hidden md:block w-px bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 dark:from-blue-900 dark:via-blue-700 dark:to-blue-900 mx-2" />
        <section className="flex-1 flex items-center justify-center">
          <DataTable csvPath="/data/mtcars.csv" />
        </section>
      </div>
    </main>
  );
}
