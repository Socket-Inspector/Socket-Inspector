import { CloseCodeSelect } from './CloseCodeSelect';
import { Button } from './shadcn/Button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './shadcn/Dialog';

export type CloseSocketFormResult = {
  code?: number;
  reason?: string;
};

export type CloseSocketFormProps = {
  onSubmit: (packet: CloseSocketFormResult) => void;
};

export function CloseSocketForm({ onSubmit }: CloseSocketFormProps) {
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
