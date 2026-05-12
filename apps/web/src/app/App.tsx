import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { ManualEntryPage } from "@/pages/ManualEntryPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { UploadReportPage } from "@/pages/UploadReportPage";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/manual" element={<ManualEntryPage />} />
            <Route path="/upload" element={<UploadReportPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
