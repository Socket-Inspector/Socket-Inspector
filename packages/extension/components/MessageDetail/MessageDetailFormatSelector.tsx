import { Label } from '../shadcn/Label';
import { RadioGroup, RadioGroupItem } from '../shadcn/RadioGroup';

export type MessageDetailFormat = 'SOCKET_IO' | 'TEXT';

export type MessageDetailFormatSelectorProps = {
  value: MessageDetailFormat;
  onChange: (format: MessageDetailFormat) => void;
};

export function MessageDetailFormatSelector({ value, onChange }: MessageDetailFormatSelectorProps) {
  return (
    <RadioGroup
      className="flex flex-row gap-3"
      orientation="horizontal"
      value={value}
      onValueChange={(newValue: string) => {
        if (newValue !== 'SOCKET_IO' && newValue !== 'TEXT') {
          throw new Error(`Invalid detail format: ${newValue}`);
        }
        onChange(newValue);
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
  );
}