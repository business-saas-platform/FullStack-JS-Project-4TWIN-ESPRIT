import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
}

export function FeatureCard({ icon: Icon, title, description, colorClass }: FeatureCardProps) {
  return (
    <Card className={`border-2 hover:${colorClass} transition-colors`}>
      <CardHeader>
        <div className={`h-12 w-12 ${colorClass.replace('border-', 'bg-').replace('-200', '-100')} rounded-lg flex items-center justify-center mb-4`}>
          <Icon className={`h-6 w-6 ${colorClass.replace('border-', 'text-').replace('-200', '-600')}`} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}