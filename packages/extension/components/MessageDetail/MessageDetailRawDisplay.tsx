export type MessageDetailRawDisplayProps = {
  rawText: string;
};
export function MessageDetailRawDisplay({ rawText }: MessageDetailRawDisplayProps) {
  return <pre className="m-4 mt-1 font-mono text-xs break-all whitespace-pre-wrap">{rawText}</pre>;
}
