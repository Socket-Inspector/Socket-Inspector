import { useState } from 'react';
import { Label } from '../shadcn/Label';
import { RadioGroup, RadioGroupItem } from '../shadcn/RadioGroup';
import { MessageDetailActions } from './MessageDetailActions';
import { MessageDetailRawDisplay } from './MessageDetailRawDisplay';
import { createLogger } from '@/utils/customLogger';
import { getSocketIOPacketDescription, IOProtocolParse } from '@/utils/socketIOHelpers';

const logger = createLogger('DEVTOOLS');

export type MessageDetailSocketIOProps = {
  rawText: string;
  parseResult: Exclude<IOProtocolParse, { lastSuccess: 'NONE' }>;
  onCopyToClipboardClicked: () => void;
  onCopyToComposerClicked: () => void;
};

export function MessageDetailSocketIO({
  rawText,
  parseResult,
  onCopyToClipboardClicked,
  onCopyToComposerClicked,
}: MessageDetailSocketIOProps) {
  const [selectedFormat, setSelectedFormat] = useState<'SOCKET_IO' | 'TEXT'>('SOCKET_IO');

  return (
    <>
      <div className="flex items-center justify-between border-b px-2">
        <RadioGroup
          className="flex flex-row gap-3"
          orientation="horizontal"
          value={selectedFormat}
          onValueChange={(newValue: string) => {
            if (newValue !== 'SOCKET_IO' && newValue !== 'TEXT') {
              throw new Error(`Invalid detail format: ${newValue}`);
            }
            setSelectedFormat(newValue);
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
      {selectedFormat === 'SOCKET_IO' ? (
        <MessageDetailSocketIODisplay parseResult={parseResult}></MessageDetailSocketIODisplay>
      ) : (
        <MessageDetailRawDisplay rawText={rawText}></MessageDetailRawDisplay>
      )}
    </>
  );
}

type MessageDetailSocketIODisplayProps = {
  parseResult: Exclude<IOProtocolParse, { lastSuccess: 'NONE' }>;
};
function MessageDetailSocketIODisplay({ parseResult }: MessageDetailSocketIODisplayProps) {
  const engineIOParse = parseResult.parseResults[0];
  const socketIOParse = parseResult.parseResults[1];
  const socketIOEventParse = parseResult.parseResults[2];

  const engineIOTemplate = <pre>Engine IO packet type: {engineIOParse.type}</pre>;

  const socketIOTemplate = socketIOParse ? (
    <>
      <pre>Socket IO packet namespace: {socketIOParse.nsp}</pre>
      <pre>Socket IO packet type: {getSocketIOPacketDescription(socketIOParse.type)}</pre>
    </>
  ) : null;

  const socketIOMessageTemplate = socketIOEventParse ? (
    <>
      <pre>Socket IO eventName: {socketIOEventParse.eventName}</pre>
      <pre>Socket IO event args: {JSON.stringify(socketIOEventParse.eventArgs)}</pre>
    </>
  ) : null;

  return (
    <div className="m-4">
      {engineIOTemplate}
      <>
        {socketIOTemplate}
        {socketIOMessageTemplate}
      </>
    </div>
  );
}
