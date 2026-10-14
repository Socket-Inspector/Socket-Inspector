import { useSocket } from './useSocket';
import { useState } from 'react';
import type {
  ClientMessage,
  EchoRequest,
  StartMessageStreamRequest,
  ServerClosureRequest,
  StopMessageStreamRequest,
} from './clientMessageTypes';

const SERVER_PORT = import.meta.env.VITE_BUN_SERVER_PORT ?? '6844';
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
    return <main></main>;
  }

  return (
    <main>
      <h1>Socket Inspector Test App</h1>
      <section>
        <h2>Connection</h2>
        <p>
          Ready State:
          <span data-testid="ready-state-display" data-state={readyState} className="badge">
            {readyState ?? ''}
          </span>
        </p>
        {readyState === 'CLOSED' && closeInfo && (
          <p>
            Close Code:
            <span data-testid="close-code-display" className="badge danger">
              {closeInfo.code}
            </span>
            {closeInfo.reason && (
              <>
                {' '}
                | Close Reason:
                <span data-testid="close-reason-display" className="badge danger">
                  {closeInfo.reason}
                </span>
              </>
            )}
          </p>
        )}
        <div className="row">
          <button
            disabled={readyState === 'CLOSED' || readyState === 'CLOSING'}
            onClick={() => closeSocket()}
          >
            Trigger Client Disconnect
          </button>
          <button
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
          </button>
          <button disabled={readyState !== 'CLOSED'} onClick={() => reconnectSocket()}>
            Reconnect to server
          </button>
        </div>
      </section>
      <hr />
      <section>
        <h2>Echo</h2>
        <div className="row">
          <input
            data-testid="echo-input"
            type="text"
            value={echoInputText}
            onChange={(e) => setEchoInputText(e.target.value)}
            placeholder="Enter message for server to echo"
          ></input>
          <button
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
          </button>
        </div>
        <p>
          Most recent echo response:
          {latestEchoResponse !== null && (
            <span data-testid="echo-response-display" className="badge">
              {latestEchoResponse}
            </span>
          )}
        </p>
      </section>
      <hr />
      <section>
        <h2>Handshake Error</h2>
        <button
          onClick={() => {
            new WebSocket(`${SOCKET_URL}?triggerHandshakeError=true`);
          }}
        >
          Trigger Handshake Error
        </button>
      </section>
      <hr />
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
      <h2>Message Stream</h2>
      <button
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
      </button>
    </section>
  );
}
