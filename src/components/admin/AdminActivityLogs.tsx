import { useActivityLogs } from "@/hooks/useBlog";

export default function AdminActivityLogs() {
  const { data: logs, isLoading } = useActivityLogs();

  if (isLoading) return <p className="text-muted-foreground font-mono text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-lg font-bold text-foreground">Activity Logs ({logs?.length || 0})</h2>
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
              {logs?.map((l) => (
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
              {logs?.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground font-mono text-sm">No activity yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
