import { useState } from 'react';
import { CloseCode, CloseCodeSelect } from './CloseCodeSelect';
import { Button } from './shadcn/Button';
import { CloseReasonInput } from './CloseReasonInput';
import { FieldGroup } from './shadcn/Field';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { CloseConnectionPacket } from '@/utils/sharedTypes/sharedTypes';

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
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Close Connection</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Simulate a close frame sent from the server to the client
          </p>
        </div>
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
        <Button className="w-full cursor-pointer" type="submit">
          Send Close Frame
        </Button>
      </div>
    </form>
  );
}
