import React from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import App from "./App";
import "./styles/global.css";

// Grava no log central de arquivo a inicialização do frontend
invoke("log_event", { level: "info", target: "frontend", message: "Frontend inicializado e montando ReactDOM..." }).catch(() => {});

window.addEventListener("error", (event) => {
  invoke("log_event", { level: "error", target: "frontend:uncaught_error", message: `${event.message} at ${event.filename}:${event.lineno}` }).catch(() => {});
});

window.addEventListener("unhandledrejection", (event) => {
  invoke("log_event", { level: "error", target: "frontend:unhandled_rejection", message: String(event.reason) }).catch(() => {});
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24,
          fontFamily: "monospace",
          color: "#ff6369",
          background: "#0e1014",
          minHeight: "100vh",
          whiteSpace: "pre-wrap",
          fontSize: 13,
        }}>
          <strong>Erro de renderização:</strong>
          {"\n\n"}
          {this.state.error.message}
          {"\n\n"}
          {this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
