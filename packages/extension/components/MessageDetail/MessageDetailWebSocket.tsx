import { MessageDetailActions } from './MessageDetailActions';
import { MessageDetailRawDisplay } from './MessageDetailRawDisplay';

export type MessageDetailWebSocketProps = {
  rawText: string;
};

// TODO: not sure whether to make this pure or not
export function MessageDetailWebSocket({ rawText }: MessageDetailWebSocketProps) {
  return (
    <div className="flex items-center justify-end px-2">
      <MessageDetailActions
        onCopyToClipboardClicked={() => {
          // TODO:
        }}
        onCopyToComposerClicked={() => {
          // TODO:
        }}
      ></MessageDetailActions>
      <MessageDetailRawDisplay rawText={rawText}></MessageDetailRawDisplay>
    </div>
  );
}
