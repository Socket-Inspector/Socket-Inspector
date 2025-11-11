import { Button } from '@/components/ui/button';
import { useSocket } from './useSocket';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import {
  ClientMessage,
  EchoRequest,
  StartMessageStreamRequest,
  ServerClosureRequest,
  StopMessageStreamRequest,
} from './clientMessageTypes';

const SERVER_PORT = 6844;
const SOCKET_URL = `ws://localhost:${SERVER_PORT}`;

export default function App() {
  const { readyState, messages, closeInfo, sendMessage, closeSocket, reconnectSocket } =
    useSocket(SOCKET_URL);

  const [echoInputText, setEchoInputText] = useState('');

  const latestEchoResponse =
    messages
      .slice()
      .reverse()
      .find((m) => m.type === 'EchoResponse')?.payload.message ?? null;

  if (!readyState) {
    return <main className="p-5"></main>;
  }

  return (
    <main className="p-5">
      <section>
        <p className="mb-2">
          Ready State:{' '}
          <span
            data-testid="ready-state-display"
            className="ml-2 rounded bg-blue-100 px-2 py-1 font-mono font-normal text-blue-800"
          >
            {readyState ?? ''}
          </span>
        </p>
        {readyState === 'CLOSED' && closeInfo && (
          <p className="mb-2">
            Close Code:{' '}
            <span
              data-testid="close-code-display"
              className="ml-2 rounded bg-red-100 px-2 py-1 font-mono font-normal text-red-800"
            >
              {closeInfo.code}
            </span>
            {closeInfo.reason && (
              <>
                {' '}
                | Close Reason:{' '}
                <span
                  data-testid="close-reason-display"
                  className="ml-2 rounded bg-red-100 px-2 py-1 font-mono font-normal text-red-800"
                >
                  {closeInfo.reason}
                </span>
              </>
            )}
          </p>
        )}
        <div className="flex flex-row gap-x-2">
          <Button
            className="cursor-pointer"
            disabled={readyState === 'CLOSED' || readyState === 'CLOSING'}
            onClick={() => closeSocket()}
          >
            Trigger Client Disconnect
          </Button>
          <Button
            className="cursor-pointer"
            disabled={readyState === 'CLOSED' || readyState === 'CLOSING'}
            onClick={() => {
              const message: ServerClosureRequest = {
                type: 'ServerClosureRequest',
                payload: undefined,
              };
              sendMessage(message);
            }}
          >
            Trigger Server Disconnect
          </Button>
          <Button
            className="cursor-pointer"
            disabled={readyState !== 'CLOSED'}
            onClick={() => reconnectSocket()}
          >
            Reconnect to server
          </Button>
        </div>
      </section>
      <Separator className="my-4"></Separator>
      <section className="mb-4 flex w-md flex-col gap-y-2">
        <div className="flex flex-row gap-x-2">
          <input
            data-testid="echo-input"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            type="text"
            value={echoInputText}
            onChange={(e) => setEchoInputText(e.target.value)}
            placeholder="Enter message for server to echo"
          ></input>
          <Button
            className="cursor-pointer"
            disabled={readyState !== 'OPEN'}
            onClick={() => {
              const message: EchoRequest = {
                type: 'EchoRequest',
                payload: {
                  message: echoInputText,
                },
              };
              sendMessage(message);
            }}
          >
            Send Echo Message
          </Button>
        </div>
        <p>
          Most recent echo response:
          {latestEchoResponse !== null && (
            <span
              data-testid="echo-response-display"
              className="ml-2 rounded bg-blue-100 px-2 py-1 font-mono text-blue-800"
            >
              {latestEchoResponse}
            </span>
          )}
        </p>
      </section>
      <Separator className="my-4"></Separator>
      <section>
        <Button
          className="cursor-pointer"
          onClick={() => {
            new WebSocket(`${SOCKET_URL}?triggerHandshakeError=true`);
          }}
        >
          Trigger Handshake Error
        </Button>
      </section>
      <Separator className="my-4"></Separator>
      <MessageStreamComponent sendMessage={sendMessage}></MessageStreamComponent>
    </main>
  );
}

type MessageStreamComponentProps = {
  sendMessage: (message: ClientMessage) => void;
};

function MessageStreamComponent({ sendMessage }: MessageStreamComponentProps) {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <section>
      <Button
        className="cursor-pointer"
        onClick={() => {
          if (isStreaming) {
            const message: StopMessageStreamRequest = {
              type: 'StopMessageStreamRequest',
              payload: undefined,
            };
            sendMessage(message);
            setIsStreaming(false);
          } else {
            const message: StartMessageStreamRequest = {
              type: 'StartMessageStreamRequest',
              payload: undefined,
            };
            sendMessage(message);
            setIsStreaming(true);
          }
        }}
      >
        {isStreaming ? 'Stop Message Stream' : 'Start Message Stream'}
      </Button>
    </section>
  );
}
