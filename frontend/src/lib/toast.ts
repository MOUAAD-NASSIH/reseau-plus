import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { createElement } from "react";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

/**
 * Toast configuration with enhanced styling
 * Using unique IDs to prevent duplicate toasts
 */
const toastConfig = {
  duration: 4000,
  className: "shadow-lg border",
};

/**
 * Generate a unique toast ID based on content to prevent duplicates
 */
function generateToastId(type: string, title: string, description?: string): string {
  return `${type}-${title}-${description || ""}`.replace(/\s+/g, "-").toLowerCase();
}

/**
 * Show an error toast with consistent styling
 * Uses unique ID to prevent duplicate toasts
 */
export function showErrorToast(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again."
) {
  const err = error as ApiError;

  const backendMessage =
    err?.response?.data?.message &&
      typeof err.response.data.message === "string"
      ? err.response.data.message
      : null;

  const description = backendMessage ?? fallbackMessage;
  const toastId = generateToastId("error", "Action failed", description);

  toast.error("Action failed", {
    id: toastId,
    description,
    icon: createElement(XCircle, { className: "h-5 w-5" }),
    ...toastConfig,
  });
}

/**
 * Show a success toast with consistent styling
 * Uses unique ID to prevent duplicate toasts
 */
export function showSuccessToast(title: string, description?: string) {
  const toastId = generateToastId("success", title, description);

  toast.success(title, {
    id: toastId,
    description,
    icon: createElement(CheckCircle2, { className: "h-5 w-5" }),
    ...toastConfig,
  });
}

/**
 * Show a warning toast with consistent styling
 * Uses unique ID to prevent duplicate toasts
 */
export function showWarningToast(title: string, description?: string) {
  const toastId = generateToastId("warning", title, description);

  toast.warning(title, {
    id: toastId,
    description,
    icon: createElement(AlertTriangle, { className: "h-5 w-5" }),
    ...toastConfig,
  });
}

/**
 * Show an info toast with consistent styling
 * Uses unique ID to prevent duplicate toasts
 */
export function showInfoToast(title: string, description?: string) {
  const toastId = generateToastId("info", title, description);

  toast.info(title, {
    id: toastId,
    description,
    icon: createElement(Info, { className: "h-5 w-5" }),
    ...toastConfig,
  });
}

/**
 * Show a loading toast that can be updated
 * Returns a toast ID that can be used to dismiss or update the toast
 */
export function showLoadingToast(title: string, description?: string) {
  return toast.loading(title, {
    description,
    icon: createElement(Loader2, { className: "h-5 w-5 animate-spin" }),
  });
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Update an existing toast (useful for loading -> success/error transitions)
 */
export function updateToast(
  toastId: string | number,
  type: "success" | "error" | "warning" | "info",
  title: string,
  description?: string
) {
  const icons = {
    success: createElement(CheckCircle2, { className: "h-5 w-5" }),
    error: createElement(XCircle, { className: "h-5 w-5" }),
    warning: createElement(AlertTriangle, { className: "h-5 w-5" }),
    info: createElement(Info, { className: "h-5 w-5" }),
  };

  toast[type](title, {
    id: toastId,
    description,
    icon: icons[type],
    ...toastConfig,
  });
}
