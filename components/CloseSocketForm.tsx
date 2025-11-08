import { useState } from 'react';
import { CloseCode, CloseCodeSelect } from './CloseCodeSelect';
import { Button } from './shadcn/Button';
import { CloseReasonInput } from './CloseReasonInput';
import { FieldGroup } from './shadcn/Field';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { CloseConnectionPacket } from '@/utils/sharedTypes/sharedTypes';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './shadcn/Dialog';

type CloseSocketFormState = {
  code: CloseCode;
  reason: string;
};

export type CloseSocketFormProps = {
  socketId: string;
  onSubmit: () => void;
};
export function CloseSocketForm({ socketId, onSubmit }: CloseSocketFormProps) {
  const { sendPacket } = useSocketContext();

  const [formState, setFormState] = useState<CloseSocketFormState>({
    code: '1000',
    reason: '',
  });

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const packet: CloseConnectionPacket = {
            type: 'CloseConnectionPacket',
            payload: {
              socketId,
              code: parseInt(formState.code),
            },
          };
          if (formState.reason) {
            packet.payload.reason = formState.reason;
          }
          sendPacket(packet);
          onSubmit();
        }}
      >
        <DialogHeader>
          <DialogTitle>Close Connection</DialogTitle>
          <DialogDescription>
            Sends a close frame to the client with the specified close code and optional close
            reason.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 mb-5 w-full max-w-md">
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
          <Button className="cursor-pointer" type="submit">
            Send Close Frame
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
