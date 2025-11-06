import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shadcn/Select';
import { useState } from 'react';

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
 * sources:
 * https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
 * https://www.iana.org/assignments/websocket/websocket.xhtml#close-code-number
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

// TODO: make styling cooler (e.g. supporting text for the label of each code)
//
export function CloseCodeSelect() {
  const [selectedCode, setSelectedCode] = useState<CloseCode>('1000');
  return (
    <Select value={selectedCode} onValueChange={(value) => setSelectedCode(value as CloseCode)}>
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
  );
}
