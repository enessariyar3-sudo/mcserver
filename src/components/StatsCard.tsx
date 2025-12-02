import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export const StatsCard = ({ title, value, description, icon: Icon, trend }: StatsCardProps) => (
  <Card className="hover:scale-105 hover:shadow-glow cursor-pointer group">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold group-hover:text-primary transition-colors">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {trend && (
        <div className="flex items-center space-x-2 mt-2">
          <Badge variant={trend.isPositive ? "default" : "destructive"} className="group-hover:scale-105 transition-transform">
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Badge>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </CardContent>
  </Card>
);