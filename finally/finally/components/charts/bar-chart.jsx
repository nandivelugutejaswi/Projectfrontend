"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function CustomBarChart({ data, title }) {
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
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
          <YAxis stroke="rgba(255,255,255,0.7)" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#00C49F" animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
