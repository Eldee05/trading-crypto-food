import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";
import { Toaster as Sonner, toast } from "sonner";
import { useFormContext } from "react-hook-form";

export { toast };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

// Timeframe aggregation utility
export function aggregateCandles(
  rawData: CandleData[],
  factor: number,
): CandleData[] {
  if (factor <= 1 || rawData.length === 0) return rawData;

  const aggregated: CandleData[] = [];
  for (let i = 0; i < rawData.length; i += factor) {
    const chunk = rawData.slice(i, i + factor);
    if (chunk.length === 0) continue;

    aggregated.push({
      time: chunk[0].time,
      timestamp: chunk[0].timestamp,
      open: chunk[0].open,
      close: chunk[chunk.length - 1].close,
      high: Math.max(...chunk.map((c) => c.high)),
      low: Math.min(...chunk.map((c) => c.low)),
      volume: chunk.reduce((sum, c) => sum + c.volume, 0),
    });
  }
  return aggregated;
}

export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent/60 data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted/60 hover:text-foreground",
        outline:
          "border border-input bg-transparent hover:bg-accent/20 hover:text-accent-foreground data-[state=on]:border-accent",
        soft: "bg-transparent hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background/50 px-4 py-2 text-sm font-medium transition-all hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent/50 focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/60 data-[state=open]:bg-accent/60",
);

type FormFieldContextValue = {
  name: string;
};

type FormItemContextValue = {
  id: string;
};

export const FormFieldContext =
  React.createContext<FormFieldContextValue | null>(null);

export const FormItemContext = React.createContext<FormItemContextValue | null>(
  null,
);

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};
