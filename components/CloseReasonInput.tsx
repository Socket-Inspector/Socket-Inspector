import { Field, FieldDescription, FieldLabel } from './shadcn/Field';
import { Input } from './shadcn/Input';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './shadcn/InputGroup';

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
  const maxLength = 123;
  return (
    <Field>
      <FieldLabel htmlFor="close-reason-input">Close Reason</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="close-reason-input"
          type="text"
          placeholder="Enter close reason (optional)"
          maxLength={maxLength}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-xs tabular-nums">
            {value.length} / {maxLength}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>
        Optional UTF-8 text describing why the connection is being closed
      </FieldDescription>
    </Field>
  );
}
