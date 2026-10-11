import type { ServiceWorkerConnector } from '@/utils/serviceWorkerMessaging';
import type { Packet } from '@/utils/sharedTypes/sharedTypes';
import { getInitialState, reducer } from './reducer';
import type { SocketState, ReducerAction } from './stateTypes';
import { createContext, type ReactNode, useContext, useEffect, useReducer } from 'react';

export type SocketContext = {
  socketState: SocketState;
  dispatch: React.Dispatch<ReducerAction>;
  sendPacket: (packet: Packet) => void;
};
const SocketStateContext = createContext<SocketContext | null>(null);

export type SocketStateProviderProps = {
  serviceWorkerConnector: ServiceWorkerConnector;
  children: ReactNode;
};

export function SocketStateProvider({
  serviceWorkerConnector,
  children,
}: SocketStateProviderProps) {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  const sendPacket = (packet: Packet) => {
    serviceWorkerConnector.sendPacket(packet);
  };

  useEffect(() => {
    serviceWorkerConnector.subscribe((packet: Packet) => {
      dispatch(packet);
    });
  }, [serviceWorkerConnector]);

  return (
    <SocketStateContext.Provider value={{ socketState: state, dispatch, sendPacket }}>
      {children}
    </SocketStateContext.Provider>
  );
}

export function useSocketContext(): SocketContext {
  const context = useContext(SocketStateContext);
  if (context === null) {
    throw new Error('useSocketContext must be used within a SocketStateProvider');
  }
  return context;
}
