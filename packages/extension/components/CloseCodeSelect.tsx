import { Field, FieldLabel } from './shadcn/Field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shadcn/Select';

export type CloseCode =
  | '1000'
  | '1001'
  | '1002'
  | '1003'
  | '1007'
  | '1008'
  | '1009'
  | '1010'
  | '1011';

export type CloseCodeItem = {
  code: CloseCode;
  label: string;
};

const closeCodeItems: CloseCodeItem[] = [
  { code: '1000', label: 'Normal Closure' },
  { code: '1001', label: 'Going Away' },
  { code: '1002', label: 'Protocol Error' },
  { code: '1003', label: 'Unsupported Data' },
  { code: '1007', label: 'Invalid Frame Payload Data' },
  { code: '1008', label: 'Policy Violation' },
  { code: '1009', label: 'Message Too Big' },
  { code: '1011', label: 'Internal Error' },
];

export type CloseCodeSelectProps = {
  value: CloseCode;
  onChange: (newValue: CloseCode) => void;
  disabled?: boolean;
};

export function CloseCodeSelect({ value, onChange, disabled }: CloseCodeSelectProps) {
  return (
    <Field>
      <FieldLabel>Close Code</FieldLabel>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as CloseCode)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="1000"></SelectValue>
        </SelectTrigger>
        <SelectContent side="bottom">
          {closeCodeItems.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.code} <span className="text-muted-foreground">{item.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
