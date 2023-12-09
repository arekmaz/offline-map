import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { EvoluProvider } from "@evolu/react";
import "./index.css";
import App from "./App";
import Home from "./pages/Home";
import Hi from "./pages/hi/[name]";
import Map from "./pages/MapPage";
import { evolu } from "./localDb";
import { Suspense } from "react";

createRoot(document.getElementById("app")!).render(
  <Suspense fallback="loading...">
    <EvoluProvider value={evolu}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/hi">
              <Route path=":name" element={<Hi />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </EvoluProvider>
  </Suspense>
);
