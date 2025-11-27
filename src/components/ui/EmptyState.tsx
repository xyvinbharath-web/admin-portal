"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, onActionClick, icon }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-slate-50">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {icon ?? <Inbox className="h-6 w-6" />}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs text-slate-500 max-w-md">{description}</p>
          ) : null}
        </div>
        {actionLabel ? (
          <Button size="sm" onClick={onActionClick} className="mt-2">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
