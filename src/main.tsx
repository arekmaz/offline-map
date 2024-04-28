import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { EvoluProvider } from "@evolu/react";
import "./index.css";
import App from "./App";
import Map from "./pages/MapPage";
import { evolu } from "./localDb";
import { Suspense } from "react";
import { Progress } from "./components/ui/progress";

createRoot(document.getElementById("app")!).render(
  <Suspense
    fallback={
      <div className="h-screen w-screen flex items-center justify-center">
        <Progress value={null} size="lg">
          <Progress.Label>Loading, please wait…</Progress.Label>
          <Progress.Circle>
            <Progress.CircleTrack />
            <Progress.CircleRange />
          </Progress.Circle>
        </Progress>
      </div>
    }
  >
    <EvoluProvider value={evolu}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/" element={<Map />} />
            <Route path="*" element={<Map />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EvoluProvider>
  </Suspense>,
);
