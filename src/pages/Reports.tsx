import { contacts } from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
} from "recharts";
import { Send, MessageCircle, Phone, CheckCircle } from "lucide-react";

const stats = [
  { label: "Total Outreach", value: "47", sub: "This month", icon: Send },
  { label: "Response Rate", value: "27%", sub: "13 replies", icon: MessageCircle },
  { label: "Calls Booked", value: "5", sub: "This month", icon: Phone },
  { label: "Revenue Closed", value: "$3,200", sub: "2 deals", icon: CheckCircle },
];

const funnelData = [
  { name: "Outreach", value: 47, fill: "hsl(216, 73%, 60%)" },
  { name: "Replies", value: 13, fill: "hsl(258, 58%, 66%)" },
  { name: "Calls", value: 5, fill: "hsl(11, 76%, 60%)" },
  { name: "Proposals", value: 3, fill: "hsl(37, 88%, 44%)" },
  { name: "Closed", value: 2, fill: "hsl(160, 84%, 30%)" },
];

const channelData = [
  { name: "LinkedIn", value: 22, fill: "hsl(210, 83%, 40%)" },
  { name: "WhatsApp", value: 12, fill: "hsl(142, 70%, 49%)" },
  { name: "Email", value: 8, fill: "hsl(220, 9%, 46%)" },
  { name: "Instagram", value: 5, fill: "hsl(340, 75%, 54%)" },
];

const serviceData = [
  { name: "AI Audit", count: contacts.filter((c) => c.serviceInterest === "audit").length },
  { name: "AI Training", count: contacts.filter((c) => c.serviceInterest === "training").length },
  { name: "Custom Systems", count: contacts.filter((c) => c.serviceInterest === "custom").length },
  { name: "TBD", count: contacts.filter((c) => c.serviceInterest === "tbd").length },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-6 relative">
            <stat.icon className="absolute top-5 right-5 h-5 w-5 text-muted-foreground/40" />
            <p className="stat-number">{stat.value}</p>
            <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pipeline Funnel */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="section-title mb-4">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Performance */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="section-title mb-4">Outreach by Channel</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {channelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {channelData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                <span className="text-xs text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Interest Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="section-title mb-4">Service Interest Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={serviceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(11, 76%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
