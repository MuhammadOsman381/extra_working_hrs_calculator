"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WorkDayForm } from "@/src/components/forms/work-day-form";
import type { ExtraHoursSettings } from "@/src/features/work-days/calculations/time-calculations";

export function AddWorkDayModal({
  open,
  normalWorkingHours,
  extraHoursSettings,
  onClose,
  onSaved,
}: {
  open: boolean;
  normalWorkingHours: number;
  extraHoursSettings: ExtraHoursSettings;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-record-title"
        >
          <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="my-4 min-h-0 w-full max-w-3xl">
            <WorkDayForm normalWorkingHours={normalWorkingHours} extraHoursSettings={extraHoursSettings} onCancel={onClose} onSaved={onSaved} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
