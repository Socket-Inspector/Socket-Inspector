'use client';

import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { processJsonPayload, processTextPayload } from '@/utils/payloadProcessors';
import { cn } from '@/utils/cn';
import { querySelectedSocketDetails } from '@/hooks/useSocketState/queries';
import { monaco } from '@/entrypoints/devtools-panel/monaco-small';
import { Braces } from 'lucide-react';
import { useDevtoolsTheme } from '@/hooks/useDevtoolsTheme';
import { RadioGroup, RadioGroupItem } from './shadcn/RadioGroup';
import { Button } from './shadcn/Button';
import { Label } from './shadcn/Label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip';
import { MessageComposerFormData } from '@/hooks/useSocketState/stateTypes';

const getInitialFormValues = (): MessageComposerFormData => ({
  destination: 'client',
  payloadType: 'json',
  payload: '',
});

export function MessageComposer() {
  const theme = useDevtoolsTheme();
  const { socketState, dispatch, sendPacket } = useSocketContext();
  const [formValues, setFormValues] = useState<MessageComposerFormData>(getInitialFormValues());
  const [formError, setFormError] = useState<string | null>(null);

  // using a ref here to avoid closure issues in the <Editor> onMount fn
  const formatButtonDisabled = useRef(formValues.payloadType === 'raw');
  formatButtonDisabled.current = formValues.payloadType === 'raw';

  const payloadTypeRadioGroup = useRef<HTMLDivElement>(null);
  const formatButton = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const submitButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // clear form errors when user switches sockets
    setFormError(null);
  }, [socketState.selectedSocket?.id]);

  useEffect(() => {
    if (socketState.selectedSocket?.composerPrefill) {
      setFormValues(socketState.selectedSocket.composerPrefill);
      dispatch({ type: 'CLEAR_MESSAGE_COMPOSER_PREFILL' });
      setFormError(null);
    }
  }, [socketState.selectedSocket?.composerPrefill, dispatch]);

  if (!socketState.selectedSocket) {
    return null;
  }

  const onSubmit = () => {
    const selectedSocketDetails = querySelectedSocketDetails(socketState);

    if (!selectedSocketDetails) {
      return;
    }

    const socketId = selectedSocketDetails.id;

    if (selectedSocketDetails.status === 'CONNECTING') {
      setFormError('Wait for server to connect before sending message');
      return;
    } else if (selectedSocketDetails.status === 'CLOSED') {
      setFormError('Cannot send a message on a closed socket');
      return;
    }

    const { destination, payloadType, payload } = formValues;

    const processingResult =
      payloadType === 'json' ? processJsonPayload(payload) : processTextPayload(payload);

    if (!processingResult.success) {
      setFormError(processingResult.error);
      return;
    }

    sendPacket({
      type: 'UserInjectedSocketMessagePacket',
      payload: {
        message: { socketId, destination, payload: processingResult.data },
      },
    });

    setFormError(null);
  };

  return (
    <form
      className="@container flex h-full min-h-0 w-full flex-col p-3"
      aria-labelledby="composer-heading"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h2 id="composer-heading" className="mb-4 text-base font-semibold">
        Compose Custom Message
      </h2>

      <div className="mb-5 grid grid-cols-1 gap-4 @sm:grid-cols-2">
        <div className="grid gap-2">
          {/* Using same styles as shadcn <Label> */}
          <h3
            id="destination-heading"
            className={cn(
              'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            )}
          >
            Destination
          </h3>
          <RadioGroup
            className="flex flex-row"
            aria-labelledby="destination-heading"
            orientation="horizontal"
            value={formValues.destination}
            onValueChange={(value) => {
              setFormValues((s) => ({
                ...s,
                destination: value as 'client' | 'server',
              }));
            }}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem id="radio-destination-client" value="client" />
              <Label htmlFor="radio-destination-client">Client</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem id="radio-destination-server" value="server" />
              <Label htmlFor="radio-destination-server">Server</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          {/* Using same styles as shadcn <Label> */}
          <h3
            id="payload-type-heading"
            className={cn(
              'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            )}
          >
            Payload Type
          </h3>
          <RadioGroup
            className="flex flex-row"
            aria-labelledby="payload-type-heading"
            orientation="horizontal"
            ref={payloadTypeRadioGroup}
            value={formValues.payloadType}
            onValueChange={(value) => {
              setFormValues((s) => ({
                ...s,
                payloadType: value as 'json' | 'raw',
              }));
              setFormError(null);
            }}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="json" id="radio-payload-json" />
              <Label htmlFor="radio-payload-json">JSON</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="raw" id="radio-payload-raw" />
              <Label htmlFor="radio-payload-raw">Text</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* note: setting min-w-0 resolved a bug where the editor would get clipped on the right side when resizing the panel */}
      <div
        className="border-input dark:bg-input/30 relative max-h-70 min-h-0 w-full min-w-0 flex-1 rounded-md border bg-transparent px-1 py-1 shadow-xs outline-none"
        tabIndex={-1}
      >
        <FormatButton
          formatButtonRef={formatButton}
          disabled={formatButtonDisabled.current}
          tooltipText={formatButtonDisabled.current ? 'Cannot format raw text' : 'Format JSON'}
          onClick={() => {
            editorRef.current?.getAction('editor.action.formatDocument')?.run();
          }}
        ></FormatButton>
        <Editor
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          height="100%"
          width="100%"
          language={formValues.payloadType === 'json' ? 'json' : 'plaintext'}
          options={{
            ariaLabel: 'Payload Editor',
            minimap: { enabled: false },
            automaticLayout: true,
            fontSize: 12,
            wordWrap: 'on',
            wrappingIndent: 'same',
            ariaRequired: true,
          }}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            editor.addCommand(monaco.KeyCode.Escape, () => {
              submitButton.current?.focus();
            });
            editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Escape, () => {
              if (formatButtonDisabled.current) {
                payloadTypeRadioGroup.current?.focus();
              } else {
                formatButton.current?.focus();
              }
            });
          }}
          value={formValues.payload}
          onChange={(value) => {
            setFormValues((s) => ({ ...s, payload: value ?? '' }));
          }}
        ></Editor>
      </div>

      <p
        id="composer-error"
        className="text-destructive-foreground text-sm"
        role="alert"
        aria-atomic="true"
      >
        {formError ?? ''}
      </p>

      <Button
        className="mt-3 cursor-pointer focus-visible:ring-[4px] focus-visible:ring-offset-2"
        type="submit"
        ref={submitButton}
      >
        Send Message
      </Button>
    </form>
  );
}

type FormatButtonProps = {
  formatButtonRef: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  tooltipText: string;
  onClick: () => void;
};

function FormatButton({ formatButtonRef, disabled, tooltipText, onClick }: FormatButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              'absolute -top-10 right-0 z-10 cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            ref={formatButtonRef}
            type="button"
            aria-label="Format payload"
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            variant="ghost"
            size="icon"
            onClick={() => {
              if (disabled) {
                return;
              }
              onClick();
            }}
          >
            <Braces className="size-4"></Braces>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" collisionPadding={{ right: 5 }}>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
