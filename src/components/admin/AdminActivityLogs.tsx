import { useState } from "react";
import { useActivityLogs } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE_SIZE = 20;

export default function AdminActivityLogs() {
  const { data: logs, isLoading } = useActivityLogs();
  const [page, setPage] = useState(1);

  const total = logs?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = logs?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  function handleExportPDF() {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Activity Logs", 14, 15);
    doc.setFontSize(9);
    doc.text(`Exported: ${new Date().toLocaleString()}  |  Total records: ${total}`, 14, 22);

    autoTable(doc, {
      startY: 27,
      head: [["Action", "Type", "IP Address", "Date", "Details"]],
      body: (logs ?? []).map((l) => [
        l.action,
        l.entity_type,
        l.ip_address || "—",
        new Date(l.created_at).toLocaleString(),
        JSON.stringify(l.details),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 4: { cellWidth: 80 } },
    });

    doc.save("activity-logs.pdf");
  }

  if (isLoading) return <p className="text-muted-foreground font-mono text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-mono text-lg font-bold text-foreground">
          Activity Logs ({total})
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-mono text-xs"
          onClick={handleExportPDF}
          disabled={total === 0}
        >
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-mono text-xs text-muted-foreground font-semibold">Action</th>
                <th className="text-left p-3 font-mono text-xs text-muted-foreground font-semibold">Type</th>
                <th className="text-left p-3 font-mono text-xs text-muted-foreground font-semibold">IP</th>
                <th className="text-left p-3 font-mono text-xs text-muted-foreground font-semibold">Date</th>
                <th className="text-left p-3 font-mono text-xs text-muted-foreground font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-mono text-primary font-semibold">{l.action}</td>
                  <td className="p-3 text-card-foreground">{l.entity_type}</td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{l.ip_address || "—"}</td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground text-xs font-mono max-w-[200px] truncate">
                    {JSON.stringify(l.details)}
                  </td>
                </tr>
              ))}
              {total === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground font-mono text-sm">
                    No activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            Page {page} of {totalPages} &mdash; showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
