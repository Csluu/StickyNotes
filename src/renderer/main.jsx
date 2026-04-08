// main.jsx — Entry point for main window (notes list)
import React from "react";
import { createRoot } from "react-dom/client";
import MainWindow from "./components/main/MainWindow";
import "./styles.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <MainWindow />
  </React.StrictMode>
);
