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

/**
 * TODO:
 *  what if socket is closed? should button just be disabled?
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
        <CloseCodeSelect></CloseCodeSelect>
        <DialogFooter>
          <Button type="submit">Close Socket</Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
}
