import { Field, FieldDescription, FieldLabel } from './shadcn/Field';
import { Input } from './shadcn/Input';

export function CloseReasonInput() {
  return (
    <Field>
      <FieldLabel htmlFor="close-reason-input">Close Reason</FieldLabel>
      <Input id="close-reason-input" type="text" placeholder="max 180 or something?" />
      <FieldDescription>add close reason description here if needed</FieldDescription>
    </Field>
  );
}
