import { MessageDetailActions } from "./MessageDetailActions";
import { MessageDetailRawDisplay } from "./MessageDetailRawDisplay";

export type MessageDetailSocketIOProps = {
  rawText: string;
};

// TODO: not sure whether to make this pure or not
export function MessageDetailSocketIO({ rawText }: MessageDetailSocketIOProps) {
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
