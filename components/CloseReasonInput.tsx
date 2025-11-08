import { Field, FieldDescription, FieldLabel } from './shadcn/Field';
import { Input } from './shadcn/Input';

/**
 * TODO:
 * live character counter?
 * consider the "Input Group" element
 * max length is 123 UTF-8 bytes per the spec
 *  we'll just keep it to 123 characters for now
 */

export type CloseReasonInputProps = {
  value: string;
  onChange: (newValue: string) => void;
};
export function CloseReasonInput({ value, onChange }: CloseReasonInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor="close-reason-input">Close Reason</FieldLabel>
      <Input
        id="close-reason-input"
        type="text"
        placeholder="max 180 or something?"
        maxLength={123}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      ></Input>
      <FieldDescription>add close reason description here if needed</FieldDescription>
    </Field>
  );
}
