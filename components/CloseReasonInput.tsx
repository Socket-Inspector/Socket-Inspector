import { Field, FieldDescription, FieldLabel } from './shadcn/Field';
import { Input } from './shadcn/Input';

export function CloseReasonInput() {
  return (
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" type="text" placeholder="Max Leiter" />
      <FieldDescription>add close reason description here if needed</FieldDescription>
    </Field>
  );
}
