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

export type CloseSocketFormValue = {
  code: CloseCode;
  reason?: string;
};

export type CloseSocketFormResult = {
  code: number;
  reason?: string;
};

export type CloseSocketFormProps = {
  onSubmit: (packet: CloseSocketFormResult) => void;
};

export function CloseSocketForm({ onSubmit }: CloseSocketFormProps) {
  const formValue = useState<CloseSocketFormValue>({
    code: '1000',
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Socket</DialogTitle>
          {/* explain that close code/close reason will be sent to client? */}
          <DialogDescription>Add description here if needed</DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-md">
          <FieldGroup>
            <CloseCodeSelect></CloseCodeSelect>
            <CloseReasonInput></CloseReasonInput>
          </FieldGroup>
        </div>
        <DialogFooter>
          <Button type="submit">Close Socket</Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
}
