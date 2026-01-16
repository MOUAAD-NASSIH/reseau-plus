import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ThemeProvider } from "./components/providers/ThemeProvider.tsx";
import { SocketProvider } from "./socket/SocketContext.tsx";
import { store } from "./features/store";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "shadow-lg border rounded-lg",
      }}
      gap={12}
      visibleToasts={5}
      closeButton
    />
    <Provider store={store}>
      <SocketProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <App />
        </ThemeProvider>
      </SocketProvider>
    </Provider>
  </StrictMode>
);

