import { motion } from "framer-motion";
import Logo from "@/assets/Logo";

export const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[9999]">
      <motion.div
        className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Logo />
      </motion.div>
    </div>
  );
};
