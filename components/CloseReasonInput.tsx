import { Field, FieldLabel } from './shadcn/Field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './shadcn/InputGroup';

export type CloseReasonInputProps = {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
};

export function CloseReasonInput({ value, onChange, disabled }: CloseReasonInputProps) {
  const maxLength = 123;
  return (
    <Field>
      <FieldLabel htmlFor="close-reason-input">
        <span>Close Reason</span>
        <span className="text-muted-foreground text-xs">(optional)</span>
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="close-reason-input"
          type="text"
          placeholder="optional close reason"
          maxLength={maxLength}
          value={value}
          disabled={disabled}
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
    </Field>
  );
}
