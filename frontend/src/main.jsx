import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/variables.css";
import "./styles/typography.css";
import "./styles/spacing.css";
import "./styles/globals.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);