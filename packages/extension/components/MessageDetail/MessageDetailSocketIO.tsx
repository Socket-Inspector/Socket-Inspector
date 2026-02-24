import { useState } from 'react';
import { Label } from '../shadcn/Label';
import { RadioGroup, RadioGroupItem } from '../shadcn/RadioGroup';
import { MessageDetailActions } from './MessageDetailActions';
import { MessageDetailRawDisplay } from './MessageDetailRawDisplay';
import { createLogger } from '@/utils/customLogger';

type MessageFormat = 'SOCKET_IO' | 'TEXT';

const logger = createLogger('DEVTOOLS');

export type MessageDetailSocketIOProps = {
  rawText: string;
  onCopyToClipboardClicked: () => void;
  onCopyToComposerClicked: () => void;
};

export function MessageDetailSocketIO({
  rawText,
  onCopyToClipboardClicked,
  onCopyToComposerClicked,
}: MessageDetailSocketIOProps) {
  const [messageFormat, setMessageFormat] = useState<MessageFormat>('SOCKET_IO');

  logger(rawText);

  return (
    <>
      <div className="flex items-center justify-between border-b px-2">
        <RadioGroup
          className="flex flex-row gap-3"
          orientation="horizontal"
          value={messageFormat}
          onValueChange={(newValue: string) => {
            if (newValue !== 'SOCKET_IO' && newValue !== 'TEXT') {
              throw new Error(`Invalid detail format: ${newValue}`);
            }
            setMessageFormat(newValue);
          }}
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="SOCKET_IO" id="radio-format-socket-io" />
            <Label htmlFor="radio-format-socket-io" className="text-xs">
              Socket.IO
            </Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="TEXT" id="radio-format-text" />
            <Label htmlFor="radio-format-text" className="text-xs">
              Text
            </Label>
          </div>
        </RadioGroup>
        <MessageDetailActions
          onCopyToClipboardClicked={onCopyToClipboardClicked}
          onCopyToComposerClicked={onCopyToComposerClicked}
        ></MessageDetailActions>
      </div>
      {messageFormat === 'SOCKET_IO' ? (
        <MessageDetailSocketIODisplay></MessageDetailSocketIODisplay>
      ) : (
        <MessageDetailRawDisplay rawText="TEST"></MessageDetailRawDisplay>
      )}
    </>
  );
}

function MessageDetailSocketIODisplay() {
  return <div>HELLO I AM SOCKET IO</div>;
}
