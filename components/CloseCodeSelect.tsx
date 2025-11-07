import { Field, FieldDescription, FieldLabel } from './shadcn/Field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shadcn/Select';

// TODO: should this be a shared type and should close items be exposed in shared service of
//       some sort?
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

// TODO: make styling cooler (e.g. supporting text for the label)
/**
 * close code sources:
 * https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
 * https://www.iana.org/assignments/websocket/websocket.xhtml#close-code-number
 * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code#value
 *  TODO: 1012, 1013, 1014 from MDN?
 *
 * consider making Zod schemas more specific to only allow these codes?
 */
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
};

// TODO: make styling cooler (e.g. supporting text for the label of each code)
//       is id/htmlfor needed?
export function CloseCodeSelect({ value, onChange }: CloseCodeSelectProps) {
  return (
    <Field>
      <FieldLabel>Close Code</FieldLabel>
      <Select value={value} onValueChange={(value) => onChange(value as CloseCode)}>
        <SelectTrigger className="text-xs">
          <SelectValue placeholder="1000"></SelectValue>
        </SelectTrigger>
        <SelectContent className="text-xs" side="bottom">
          {closeCodeItems.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.code} ({item.label})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>add close code description if needed</FieldDescription>
    </Field>
  );
}
