import { Field, FieldLabel } from './shadcn/Field';
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
      <FieldLabel className="justify-between" htmlFor="close-reason-input">
        <span>Close Reason</span>
        <span className="text-muted-foreground text-xs">optional</span>
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="close-reason-input"
          type="text"
          placeholder="Optional close reason"
          maxLength={maxLength}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-muted-foreground text-xs">
            {value.length} / {maxLength}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      {/* <FieldDescription>
        Optional UTF-8 text describing why the connection is being closed
      </FieldDescription> */}
    </Field>
  );
}
