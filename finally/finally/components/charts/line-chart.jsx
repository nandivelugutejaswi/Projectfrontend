"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function CustomLineChart({ data, title }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-3 rounded-lg border border-border/50">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">${payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
          <YAxis stroke="rgba(255,255,255,0.7)" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0088FE"
            strokeWidth={3}
            dot={{ fill: "#0088FE", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: "#0088FE", strokeWidth: 2 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
