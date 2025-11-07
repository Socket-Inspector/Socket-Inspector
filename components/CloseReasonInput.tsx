import { Field, FieldDescription, FieldLabel } from './shadcn/Field';
import { Input } from './shadcn/Input';

/**
 * TODO:
 * live character counter?
 * consider the "Input Group" element
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
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      ></Input>
      <FieldDescription>add close reason description here if needed</FieldDescription>
    </Field>
  );
}
