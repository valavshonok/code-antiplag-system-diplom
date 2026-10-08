import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/cn";

type ModalBackdrop = "opaque" | "blur";

interface ModalProps {
  className?: string;
  children?: React.ReactNode;
  backdrop?: ModalBackdrop;
  open: boolean;
  defaultOpen?: boolean;
  onOpenChange: (state: boolean) => void;
  zIndex?: "z-10" | "z-20" | "z-30" | "z-40" | "z-50";
}

const modalbgVariants = {
  closed: { opacity: 0, backdropFilter: "blur(0px)" },
  open: { opacity: 1, backdropFilter: "blur(6px)" },
};

const modalVariants = {
  closed: { opacity: 0, scale: 0.9 },
  open: { opacity: 1, scale: 1 },
};

export const Modal: React.FC<ModalProps> = ({
  children,
  open,
  backdrop,
  className,
  onOpenChange,
  zIndex = "z-10",
}) => {
  return (
    <div className={cn(zIndex)}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={modalbgVariants.closed}
            animate={modalbgVariants.open}
            exit={modalbgVariants.closed}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
            className={cn(
              "fixed top-0 left-0 h-svh w-svw",
              zIndex,
              backdrop === "opaque" && "bg-[#00000055]",
            )}
            style={backdrop === "blur" ? undefined : { backdropFilter: "none" }}
          />
        )}
      </AnimatePresence>
      <div
        className={cn(
          "fixed top-0 left-0 h-svh w-svw flex items-center justify-center pointer-events-none",
          zIndex,
        )}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              className={cn(
                "h-fit w-fit rounded-md pointer-events-auto",
                className,
              )}
              onClick={(e) => {
                e.stopPropagation();
              }}
              initial={modalVariants.closed}
              animate={modalVariants.open}
              exit={modalVariants.closed}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
