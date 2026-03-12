import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove the initial HTML loader when React takes over
const initialLoader = document.getElementById("initial-loader");
if (initialLoader) {
  initialLoader.remove();
}

createRoot(document.getElementById("root")!).render(<App />);
