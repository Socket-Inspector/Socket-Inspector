export type EmptySocketSelectionProps = {
  hasSockets: boolean;
};

export function EmptySocketSelection({ hasSockets }: EmptySocketSelectionProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-lg font-medium">
          {hasSockets ? 'Select a WebSocket' : 'Currently recording WebSocket activity'}
        </h2>

        <p className="text-muted-foreground max-w-xs text-sm">
          {hasSockets
            ? 'Pick a connection from the left sidebar'
            : 'Reload the page or perform an action that opens a WebSocket—any connections will appear here automatically'}
        </p>
      </div>
    </div>
  );
}
