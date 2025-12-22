import { ServerWebSocket, sleep } from 'bun';
import { ClientMessage, EchoRequestPayload, EchoResponse } from './serverMessageTypes';

export const handleClientMessage = async (ws: ServerWebSocket<unknown>, message: ClientMessage) => {
  if (message.delay && message.delay > 0) {
    await sleep(message.delay);
  }
  if (message.type === 'EchoRequest') {
    handleEchoRequest(ws, message.payload);
    return;
  } else if (message.type === 'ServerClosureRequest') {
    handleServerClosureRequest(ws);
    return;
  } else if (message.type === 'StartMessageStreamRequest') {
    handleStartMessageStreamRequest(ws);
  } else if (message.type === 'StopMessageStreamRequest') {
    handleStopMessageStreamRequest(ws);
  }
};

export const handleEchoRequest = async (
  ws: ServerWebSocket<unknown>,
  payload: EchoRequestPayload,
) => {
  const response: EchoResponse = {
    type: 'EchoResponse',
    payload: {
      message: payload.message,
    },
  };
  ws.send(JSON.stringify(response));
};

/**
 * consider taking a 'graceful' param
 * if true, use ws.close();
 * if false, use ws.terminate();
 */
export const handleServerClosureRequest = (ws: ServerWebSocket<unknown>) => {
  ws.close();
};

/**
 * TODO:
 * we should probably clear intervals when server closes
 */
const activeIntervals = new Map<ServerWebSocket<unknown>, NodeJS.Timeout>();

export const handleStartMessageStreamRequest = async (ws: ServerWebSocket<unknown>) => {
  const existingInterval = activeIntervals.get(ws);
  if (existingInterval) {
    clearInterval(existingInterval);
  }

  let sequenceNumber = 1;
  const intervalId = setInterval(() => {
    ws.send(`message: ${sequenceNumber}`);
    sequenceNumber++;
  }, 10);

  activeIntervals.set(ws, intervalId);
};

export const handleStopMessageStreamRequest = async (ws: ServerWebSocket<unknown>) => {
  const intervalId = activeIntervals.get(ws);
  if (intervalId) {
    clearInterval(intervalId);
    activeIntervals.delete(ws);
  }
};
