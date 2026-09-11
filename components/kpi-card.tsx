import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  accentColor: string;
  accentBg: string;
}

export function KpiCard({ icon, label, value, trend, trendLabel, accentColor, accentBg }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow bg-card">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: accentColor }} />
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: accentBg }}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
