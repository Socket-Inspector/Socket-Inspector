import { useState } from 'react';
import { CloseCode, CloseCodeSelect } from './CloseCodeSelect';
import { Button } from './shadcn/Button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './shadcn/Dialog';
import { CloseReasonInput } from './CloseReasonInput';
import { FieldGroup } from './shadcn/Field';

/**
 * TODO:
 *  what if socket is closed? should button just be disabled?
 *  how to make it clear close reason is optional
 *  consider horizontal orientation for fields?
 *
 * consider using the new <Field> component:
 * https://ui.shadcn.com/docs/components/field
 */

export type CloseSocketFormState = {
  code: CloseCode;
  reason: string;
};

export type CloseSocketFormResult = {
  code: number;
  reason?: string;
};

export type CloseSocketFormProps = {
  onSubmit: (packet: CloseSocketFormResult) => void;
};

export function CloseSocketForm({ onSubmit }: CloseSocketFormProps) {
  const [formState, setFormState] = useState<CloseSocketFormState>({
    code: '1000',
    reason: '',
  });

  console.log('formState on render: ', formState);

  // TODO: styling issue with putting form inside the dialog content?

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          console.log('inside onSubmit');
          e.preventDefault();
          console.log('formState on submit: ', formState);
        }}
      >
        <DialogHeader>
          <DialogTitle>Close Connection</DialogTitle>
          {/* TODO: explain that close code/close reason will be sent to client? */}
          <DialogDescription>Add description here if needed</DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-md">
          <FieldGroup>
            <CloseCodeSelect
              value={formState.code}
              onChange={(value) => {
                setFormState({ ...formState, code: value });
              }}
            ></CloseCodeSelect>
            <CloseReasonInput
              value={formState.reason}
              onChange={(value) => {
                setFormState({ ...formState, reason: value });
              }}
            ></CloseReasonInput>
          </FieldGroup>
        </div>
        <DialogFooter>
          <Button type="submit">Close Socket</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
