import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

const data = [
  { tipo: "Bariátrica", proc: 92 },
  { tipo: "OPME", proc: 88 },
  { tipo: "Home care", proc: 81 },
  { tipo: "Off-label", proc: 74 },
  { tipo: "ABA / autismo", proc: 89 },
  { tipo: "Oncológico", proc: 95 },
];

export function JurimetriaChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="caption">Procedência por categoria</p>
          <h3 className="mt-1 text-base font-semibold text-text-primary">
            Reversão judicial — últimos 12 meses
          </h3>
        </div>
        <span className="font-mono text-xs text-text-tertiary">n = 8.412 casos</span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 32 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="tipo"
            stroke="var(--text-tertiary)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-elevated)" }}
            contentStyle={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--text-primary)" }}
            formatter={(v: number) => [`${v}%`, "Procedência"]}
          />
          <Bar dataKey="proc" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((_, i) => (
              <Cell key={i} fill="var(--primary)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
