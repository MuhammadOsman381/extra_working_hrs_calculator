"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WorkDayForm } from "@/src/components/forms/work-day-form";

export function AddWorkDayModal({
  open,
  normalWorkingHours,
  onClose,
  onSaved,
}: {
  open: boolean;
  normalWorkingHours: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-record-title"
        >
          <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-3xl">
            <WorkDayForm normalWorkingHours={normalWorkingHours} onCancel={onClose} onSaved={onSaved} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
