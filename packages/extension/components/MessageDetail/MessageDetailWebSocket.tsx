import { MessageDetailActions } from './MessageDetailActions';
import { MessageDetailRawDisplay } from './MessageDetailRawDisplay';

export type MessageDetailWebSocketProps = {
  rawText: string;
  onCopyToClipboardClicked: () => void;
  onCopyToComposerClicked: () => void;
};

// TODO: not sure whether to make this pure or not
export function MessageDetailWebSocket({
  rawText,
  onCopyToClipboardClicked,
  onCopyToComposerClicked,
}: MessageDetailWebSocketProps) {
  return (
    <>
      <div className="flex items-center justify-end px-2">
        <MessageDetailActions
          onCopyToClipboardClicked={onCopyToClipboardClicked}
          onCopyToComposerClicked={onCopyToComposerClicked}
        ></MessageDetailActions>
      </div>
      <MessageDetailRawDisplay rawText={rawText}></MessageDetailRawDisplay>
    </>
  );
}
