/**
 * @module main
 * @description Application bootstrap. Mounts the React root component
 * into the DOM using React 19's createRoot API.
 *
 * @author Asif
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
