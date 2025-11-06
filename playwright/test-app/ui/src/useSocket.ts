import { useState, useEffect, useRef } from 'react';
import { ClientMessage, ServerMessage } from './clientMessageTypes';

export type ReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

const readyStateToString = (readyState: number): ReadyState => {
  if (readyState === WebSocket.CONNECTING) {
    return 'CONNECTING';
  } else if (readyState === WebSocket.OPEN) {
    return 'OPEN';
  } else if (readyState === WebSocket.CLOSING) {
    return 'CLOSING';
  } else if (readyState === WebSocket.CLOSED) {
    return 'CLOSED';
  } else {
    return 'CLOSED';
  }
};

export const useSocket = (url: string) => {
  const [readyState, setReadyState] = useState<ReadyState | null>(null);
  const [messages, setMessages] = useState<ServerMessage[]>([]);

  const socketRef = useRef<WebSocket | null>(null);

  const connectSocket = () => {
    setMessages([]);

    const socket = new WebSocket(url);

    setReadyState(readyStateToString(socket.readyState));

    socket.onopen = () => {
      return setReadyState(readyStateToString(socket.readyState));
    };

    socket.onclose = (e) => {
      console.log('socket onclose: ', e);
      return setReadyState(readyStateToString(socket.readyState));
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const parsedMessage = JSON.parse(event.data) as ServerMessage;
        setMessages((prev) => [...prev, parsedMessage]);
      } catch {
        // message is plain string message
      }
    };

    socket.onerror = () => {
      // console.log("socket error occured: ");
    };

    socketRef.current = socket;

    return () => {
      console.log('closing socket');
      socket.close();
    };
  };

  useEffect(() => {
    /**
     * using setTimeout because the prod build is too fast
     * that is, without setTimeout, the websocket will be constructed
     * before mswjs is injected into the page
     */
    setTimeout(() => {
      return connectSocket();
    }, 55);
  }, [url]);

  const closeSocket = () => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.close();
  };

  const sendMessage = (message: ClientMessage) => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.send(JSON.stringify(message));
  };

  const reconnectSocket = () => {
    if (!socketRef.current) {
      return;
    }
    if (readyState !== 'CLOSED') {
      return;
    }
    connectSocket();
  };

  return {
    readyState,
    messages,
    sendMessage,
    closeSocket,
    reconnectSocket,
  };
};
