import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import "./styles/theme.css";
import "./styles/global.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/sidebar.css";
import "./styles/chat.css";
import "./styles/messages.css";
import "./styles/friends.css";
import "./styles/responsive.css";

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);