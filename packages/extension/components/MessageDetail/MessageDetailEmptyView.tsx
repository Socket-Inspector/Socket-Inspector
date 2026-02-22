export type MessageDetailEmptyViewProps = {
  headline: string;
  helperText: string;
};

export function MessageDetailEmptyView({ headline, helperText }: MessageDetailEmptyViewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted-foreground text-sm font-medium">{headline}</p>
        <p className="text-muted-foreground max-w-xs text-xs">{helperText}</p>
      </div>
    </div>
  );
}
