import './index.css';
import type { ClientMessage, ServerMessage } from './clientMessageTypes';

const SERVER_PORT = import.meta.env.VITE_BUN_SERVER_PORT ?? '6844';
const SOCKET_URL = `ws://localhost:${SERVER_PORT}`;

type ReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

type CloseInfo = { code: number; reason: string };

const readyStateToString = (readyState: number): ReadyState => {
  if (readyState === WebSocket.CONNECTING) {
    return 'CONNECTING';
  } else if (readyState === WebSocket.OPEN) {
    return 'OPEN';
  } else if (readyState === WebSocket.CLOSING) {
    return 'CLOSING';
  } else {
    return 'CLOSED';
  }
};

const getElement = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const elements = {
  readyState: getElement('ready-state'),
  closeInfo: getElement('close-info'),
  closeCode: getElement('close-code'),
  closeReasonGroup: getElement('close-reason-group'),
  closeReason: getElement('close-reason'),
  clientDisconnect: getElement<HTMLButtonElement>('client-disconnect'),
  serverDisconnect: getElement<HTMLButtonElement>('server-disconnect'),
  reconnect: getElement<HTMLButtonElement>('reconnect'),
  echoInput: getElement<HTMLInputElement>('echo-input'),
  sendEcho: getElement<HTMLButtonElement>('send-echo'),
  echoResponse: getElement('echo-response'),
  handshakeError: getElement<HTMLButtonElement>('handshake-error'),
  messageStream: getElement<HTMLButtonElement>('message-stream'),
};

let socket: WebSocket;
let readyState: ReadyState = 'CONNECTING';
let closeInfo: CloseInfo | null = null;
let latestEchoResponse: string | null = null;
let isStreaming = false;

const render = () => {
  elements.readyState.textContent = readyState;
  elements.readyState.dataset.state = readyState;

  const showCloseInfo = readyState === 'CLOSED' && closeInfo !== null;
  elements.closeInfo.hidden = !showCloseInfo;
  elements.closeCode.textContent = closeInfo ? String(closeInfo.code) : '';
  elements.closeReasonGroup.hidden = !closeInfo?.reason;
  elements.closeReason.textContent = closeInfo?.reason ?? '';

  const closedOrClosing = readyState === 'CLOSED' || readyState === 'CLOSING';
  elements.clientDisconnect.disabled = closedOrClosing;
  elements.serverDisconnect.disabled = closedOrClosing;
  elements.reconnect.disabled = readyState !== 'CLOSED';
  elements.sendEcho.disabled = readyState !== 'OPEN';

  elements.echoResponse.hidden = latestEchoResponse === null;
  elements.echoResponse.textContent = latestEchoResponse ?? '';

  elements.messageStream.textContent = isStreaming ? 'Stop Message Stream' : 'Start Message Stream';
};

const connectSocket = () => {
  latestEchoResponse = null;
  closeInfo = null;

  socket = new WebSocket(SOCKET_URL);
  readyState = readyStateToString(socket.readyState);

  socket.onopen = () => {
    readyState = readyStateToString(socket.readyState);
    render();
  };

  socket.onclose = (e) => {
    closeInfo = { code: e.code, reason: e.reason };
    readyState = readyStateToString(socket.readyState);
    render();
  };

  socket.onmessage = (event: MessageEvent) => {
    try {
      const parsedMessage = JSON.parse(event.data) as ServerMessage;
      if (parsedMessage.type === 'EchoResponse') {
        latestEchoResponse = parsedMessage.payload.message;
        render();
      }
    } catch {
      // message is plain string message
    }
  };

  render();
};

const sendMessage = (message: ClientMessage) => {
  socket.send(JSON.stringify(message));
};

elements.clientDisconnect.addEventListener('click', () => {
  socket.close();
});

elements.serverDisconnect.addEventListener('click', () => {
  sendMessage({ type: 'ServerClosureRequest', payload: undefined });
});

elements.reconnect.addEventListener('click', () => {
  if (readyState !== 'CLOSED') {
    return;
  }
  connectSocket();
});

elements.sendEcho.addEventListener('click', () => {
  sendMessage({ type: 'EchoRequest', payload: { message: elements.echoInput.value } });
});

elements.handshakeError.addEventListener('click', () => {
  new WebSocket(`${SOCKET_URL}?triggerHandshakeError=true`);
});

elements.messageStream.addEventListener('click', () => {
  sendMessage({
    type: isStreaming ? 'StopMessageStreamRequest' : 'StartMessageStreamRequest',
    payload: undefined,
  });
  isStreaming = !isStreaming;
  render();
});

connectSocket();
