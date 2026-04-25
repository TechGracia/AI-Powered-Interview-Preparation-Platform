import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ScoreChart({ history = [] }) {

  // ✅ Safe data mapping
  const data = history.map((item, index) => ({
    name: new Date(item.date).toLocaleDateString(),
    score: Number(item.score) || 0,
    index,
  }));

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl mt-8">

      {/* TITLE */}
      <h2 className="text-lg font-semibold mb-4 text-white">
        📈 Score Progress
      </h2>

      {/* EMPTY STATE */}
      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available yet
        </div>
      ) : (

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={data}>

            {/* GRID */}
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
            />

            {/* X AXIS */}
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            {/* Y AXIS */}
            <YAxis
              domain={[0, 100]}
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            {/* TOOLTIP */}
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
              labelStyle={{ color: "#e5e7eb" }}
              cursor={{ stroke: "#8b5cf6", strokeWidth: 1 }}
            />

            {/* LINE */}
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#gradient)"
              strokeWidth={3}
              dot={{ r: 4, fill: "#a855f7" }}
              activeDot={{
                r: 6,
                stroke: "#fff",
                strokeWidth: 2,
                fill: "#ec4899",
              }}
              isAnimationActive={true}
            />

            {/* GRADIENT */}
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

          </LineChart>

        </ResponsiveContainer>
      )}

    </div>
  );
}

export default ScoreChart;