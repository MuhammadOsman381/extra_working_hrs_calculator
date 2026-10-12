"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WorkDayForm } from "@/src/components/forms/work-day-form";
import type { ExtraHoursSettings } from "@/src/features/work-days/calculations/time-calculations";
import type { WorkDayRecord } from "@/src/features/work-days/types";

export function EditWorkDayModal({
  record,
  normalWorkingHours,
  extraHoursSettings,
  onClose,
  onSaved,
}: {
  record: WorkDayRecord | null;
  normalWorkingHours: number;
  extraHoursSettings: ExtraHoursSettings;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  return (
    <AnimatePresence>
      {record ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.96, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            className="my-4 min-h-0 w-full max-w-3xl"
          >
            <WorkDayForm key={record.id} record={record} normalWorkingHours={normalWorkingHours} extraHoursSettings={extraHoursSettings} onCancel={onClose} onSaved={onSaved} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
