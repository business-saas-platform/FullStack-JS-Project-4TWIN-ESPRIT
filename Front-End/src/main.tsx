import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

if (import.meta.env.DEV) {
  import("@axe-core/react").then(async (axe) => {
    const ReactDOM = await import("react-dom");
    axe.default(React, ReactDOM, 1000);
  });
}

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);