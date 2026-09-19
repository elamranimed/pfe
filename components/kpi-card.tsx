import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  accentColor?: string;
  accentBg?: string;
  leftBarGradient?: string;
}

const DEFAULT_BLUE_GRADIENT = 'linear-gradient(180deg, #1a5298 0%, #0d2847 100%)';

export function KpiCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  accentColor = '#1a5298',
  accentBg = 'rgba(26,82,152,0.1)',
  leftBarGradient = DEFAULT_BLUE_GRADIENT,
}: KpiCardProps) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border/60 hover:border-border">
      {/* Blue gradient left accent bar */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl"
        style={{ background: leftBarGradient }}
      />
      {/* Subtle top glow on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.08), transparent)' }}
      />
      <CardContent className="p-5 flex items-start justify-between relative">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: trend >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-[10px] text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl shrink-0 ml-3 transition-transform duration-300 group-hover:scale-110"
          style={{ background: accentBg }}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
