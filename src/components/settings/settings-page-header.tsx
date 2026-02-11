import type { LucideIcon } from "lucide-react";

interface SettingsPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function SettingsPageHeader({ icon: Icon, title, description }: SettingsPageHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nok-blue/10">
        <Icon className="h-5 w-5 text-nok-blue" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-nok-navy">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
