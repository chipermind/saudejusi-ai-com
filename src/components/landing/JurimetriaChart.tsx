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
  { tipo: "Bariátrica", proc: 78 },
  { tipo: "OPME (próteses e órteses)", proc: 82 },
  { tipo: "Home care e internação domiciliar", proc: 71 },
  { tipo: "Off-label / oncológico", proc: 84 },
  { tipo: "ABA / saúde mental", proc: 86 },
  { tipo: "Urgência / emergência", proc: 91 },
];

export function JurimetriaChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="caption">Reversão na via administrativa</p>
          <h3 className="mt-1 text-base font-semibold text-text-primary">
            Reversão de negativa na via administrativa — por categoria
          </h3>
        </div>
        <span className="font-mono text-xs text-text-tertiary">n = 8.412 NIPs · 12 meses</span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 32 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="tipo"
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={170}
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
            formatter={(v: number) => [`${v}%`, "Reversão"]}
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
