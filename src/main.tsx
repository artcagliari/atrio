import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400.css";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { BackgroundLights } from "@/components/layout/BackgroundLights";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStoreProvider } from "@/lib/store";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStoreProvider>
      <TooltipProvider delayDuration={300}>
        <BackgroundLights />
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </AppStoreProvider>
  </StrictMode>,
);
