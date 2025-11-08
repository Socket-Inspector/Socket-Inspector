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
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { querySelectedSocketDetails } from '@/hooks/useSocketState/queries';
import { CloseConnectionPacket } from '@/utils/sharedTypes/sharedTypes';

/**
 * TODO:
 *  should make this component stateful (read state from context)
 *    allows us to show success message when socket is closed
 *
 * this seems to be keeping its state when opening/closing it
 *
 *
 * TODO:
 *  what if socket is closed? should button just be disabled?
 *  how to make it clear close reason is optional
 *  consider horizontal orientation for fields?
 *
 * consider using the new <Field> component:
 * https://ui.shadcn.com/docs/components/field
 */

type CloseSocketFormState = {
  code: CloseCode;
  reason: string;
};

export type CloseSocketFormProps = {
  onSubmit: () => void;
};
export function CloseSocketForm({ onSubmit }: CloseSocketFormProps) {
  const { socketState, dispatch, sendPacket } = useSocketContext();

  const [formState, setFormState] = useState<CloseSocketFormState>({
    code: '1000',
    reason: '',
  });

  const selectedSocketDetails = querySelectedSocketDetails(socketState);
  if (!selectedSocketDetails) {
    return null;
  }

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log('formState on submit: ', formState);
          const packet: CloseConnectionPacket = {
            type: 'CloseConnectionPacket',
            payload: {
              socketId: selectedSocketDetails.id,
              code: parseInt(formState.code),
            },
          };
          if (formState.reason) {
            packet.payload.reason = formState.reason;
          }
          sendPacket(packet);
          console.log('constructed this packet: ', packet);
          onSubmit();
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
