"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";

export function ExcelExportButton({ month }: { month: string }) {
  const [exporting, setExporting] = useState(false);

  function download() {
    setExporting(true);
    window.open(`/api/export?month=${month}`, "_self");
    window.setTimeout(() => setExporting(false), 1200);
  }

  return (
    <Button variant="ghost" className="h-12 px-4" onClick={download} disabled={exporting} icon={<Download size={24} strokeWidth={1.7} />}>
      {exporting ? "Exporting..." : "Export Excel"}
    </Button>
  );
}
