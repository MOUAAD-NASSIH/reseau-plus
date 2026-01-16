import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  action?: React.ReactNode;
};

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  switch (variant) {
    case "destructive":
      sonnerToast.error(title, { description });
      break;
    case "success":
      sonnerToast.success(title, { description });
      break;
    case "warning":
      sonnerToast.warning(title, { description });
      break;
    case "info":
      sonnerToast.info(title, { description });
      break;
    default:
      sonnerToast(title, { description });
      break;
  }
};

export const useToast = () => {
  return {
    toast,
  };
};
