import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OfficeLive from "./pages/OfficeLive";
import LoginGate from "./components/LoginGate";

const queryClient = new QueryClient();

const App = () => {
  return (
    <LoginGate>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/office-live" element={<OfficeLive />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </LoginGate>
  );
};

export default App;
