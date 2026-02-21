import { useState } from 'react';
import { Label } from '../shadcn/Label';
import { RadioGroup, RadioGroupItem } from '../shadcn/RadioGroup';
import { MessageDetailActions } from './MessageDetailActions';

type MessageFormat = 'SOCKET_IO' | 'TEXT';

export function MessageDetailSocketIO() {
  const [format, setFormat] = useState<MessageFormat>('SOCKET_IO');

  return (
    <div className="flex items-center border-b px-2">
      <RadioGroup
        className="flex flex-row gap-3"
        orientation="horizontal"
        value={format}
        onValueChange={(newValue: string) => {
          if (newValue !== 'SOCKET_IO' && newValue !== 'TEXT') {
            throw new Error(`Invalid detail format: ${newValue}`);
          }
          setFormat(newValue);
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
        onCopyToClipboardClicked={() => {
          // TODO:
        }}
        onCopyToComposerClicked={() => {
          // TODO:
        }}
      ></MessageDetailActions>
    </div>
  );
}