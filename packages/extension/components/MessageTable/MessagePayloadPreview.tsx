import { SocketMessage } from '@/utils/sharedTypes/sharedTypes';

export type MessagePayloadPreviewProps = {
  messageId: SocketMessage['id'];
  payload: string;
};

export function MessagePayloadPreview({ messageId, payload }: MessagePayloadPreviewProps) {
  return (
    <span
      className="min-w-0 flex-1 truncate"
      id={`msg-${messageId}-preview`}
    >
      {truncatePayload(payload)}
    </span>
  );
}

const PREVIEW_MAX = 4000;

/**
 * This prevents enormous strings from being inserted into
 * the DOM (even if the tailwind truncate class is used,
 * the hidden part of the string will still be stored in
 * the DOM)
 */
function truncatePayload(payload: string): string {
  return payload.length > PREVIEW_MAX ? `${payload.slice(0, PREVIEW_MAX)}…` : payload;
}
