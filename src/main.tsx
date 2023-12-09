import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { EvoluProvider } from "@evolu/react";
import "./index.css";
import App from "./App";
import Map from "./pages/MapPage";
import { evolu } from "./localDb";
import { Suspense } from "react";

createRoot(document.getElementById("app")!).render(
  <Suspense fallback="loading...">
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
  </Suspense>
);
