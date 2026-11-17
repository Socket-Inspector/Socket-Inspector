import { useState } from 'react';
import { type CloseCode, CloseCodeSelect } from './CloseCodeSelect';
import { Button } from '@socket-inspector/shadcn/Button';
import { CloseReasonInput } from './CloseReasonInput';
import { FieldGroup } from '@socket-inspector/shadcn/Field';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import type { CloseConnectionPacket } from '@/utils/sharedTypes/sharedTypes';

type CloseSocketFormState = {
  code: CloseCode;
  reason: string;
};

export type CloseSocketFormProps = {
  socketId: string;
  headingId: string;
  onSubmit: () => void;
};

export function CloseSocketForm({ socketId, headingId, onSubmit }: CloseSocketFormProps) {
  const { sendPacket, socketState } = useSocketContext();

  const [formState, setFormState] = useState<CloseSocketFormState>({
    code: '1000',
    reason: '',
  });

  const socketDetails = socketState.sockets.find((s) => s.id === socketId);
  const isClosed = socketDetails?.status === 'CLOSED';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isClosed) {
          return;
        }
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
          <h3 id={headingId} className="text-base font-semibold">
            Close Connection
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {isClosed
              ? 'This connection is already closed'
              : 'The client gets your code and reason'}
          </p>
        </div>
        <FieldGroup className="gap-3">
          <CloseCodeSelect
            value={formState.code}
            disabled={isClosed}
            onChange={(value) => {
              setFormState({ ...formState, code: value });
            }}
          ></CloseCodeSelect>
          <CloseReasonInput
            value={formState.reason}
            disabled={isClosed}
            onChange={(value) => {
              setFormState({ ...formState, reason: value });
            }}
          ></CloseReasonInput>
        </FieldGroup>
        <Button className="w-full cursor-pointer" type="submit" disabled={isClosed}>
          {isClosed ? 'Connection Closed' : 'Close Connection'}
        </Button>
      </div>
    </form>
  );
}
