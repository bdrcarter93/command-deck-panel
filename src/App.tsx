import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OfficeLive from "./pages/OfficeLive";
import LoginGate from "./components/LoginGate";
import CommandCenterApp from "./features/commandCenter/CommandCenterApp";

const queryClient = new QueryClient();

const App = () => {
  return (
    <LoginGate>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CommandCenterApp />} />
            <Route path="/command/:pageId" element={<CommandCenterApp />} />
            <Route path="/mission-control" element={<Index />} />
            <Route path="/office-live" element={<OfficeLive />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </LoginGate>
  );
};

export default App;
