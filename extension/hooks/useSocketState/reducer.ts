import { SocketDetailsPacket, SocketMessagePacket } from '@/utils/sharedTypes/sharedTypes';
import {
  ReducerAction,
  SelectSocketAction,
  SelectSocketMessageAction,
  ClearSelectedMessageIdAction,
  ClearSelectedSocketMessagesAction,
  PrefillMessageComposerAction,
  ClearMessageComposerPrefillAction,
  SocketState,
  ClearUnseenCustomMessageIdAction,
} from './stateTypes';

export const getInitialState = (): SocketState => {
  return {
    sockets: [],
    socketMessages: {},
  };
};

export const reducer = (prevState: SocketState, action: ReducerAction): SocketState => {
  if (action.type === 'SocketDetailsPacket') {
    return applySocketDetailsPacket(prevState, action);
  } else if (action.type === 'SocketMessagePacket') {
    return applySocketMessagePacket(prevState, action);
  } else if (action.type === 'ClearDevtoolsStatePacket') {
    return getInitialState();
  } else if (action.type === 'SELECT_SOCKET') {
    return applySelectSocketAction(prevState, action);
  } else if (action.type === 'SELECT_SOCKET_MESSAGE') {
    return applySelectSocketMessageAction(prevState, action);
  } else if (action.type === 'CLEAR_SELECTED_MESSAGE_ID') {
    return applyClearSelectedMessageIdAction(prevState, action);
  } else if (action.type === 'CLEAR_SELECTED_SOCKET_MESSAGES') {
    return applyClearSelectedSocketMessagesAction(prevState, action);
  } else if (action.type === 'PREFILL_MESSAGE_COMPOSER') {
    return applyPrefillMessageComposerAction(prevState, action);
  } else if (action.type === 'CLEAR_MESSAGE_COMPOSER_PREFILL') {
    return applyClearMessageComposerPrefillAction(prevState, action);
  } else if (action.type === 'CLEAR_UNSEEN_CUSTOM_MESSAGE_ID_ACTION') {
    return applyClearUnseenCustomMessageIdAction(prevState, action);
  }
  return prevState;
};

const applySocketDetailsPacket = (
  prevState: SocketState,
  packet: SocketDetailsPacket,
): SocketState => {
  const { socket } = packet.payload;
  const existingSocket = prevState.sockets.some((s) => s.id === socket.id);
  if (existingSocket) {
    return {
      ...prevState,
      sockets: prevState.sockets.map((s) => (s.id === socket.id ? socket : s)),
    };
  } else {
    return { ...prevState, sockets: [...prevState.sockets, socket] };
  }
};

const applySocketMessagePacket = (
  prevState: SocketState,
  packet: SocketMessagePacket,
): SocketState => {
  const { socket, message } = packet.payload;

  const updatedSocketMessages = { ...prevState.socketMessages };
  if (socket.id in updatedSocketMessages) {
    const isDuplicate = updatedSocketMessages[socket.id].some((m) => m.id === message.id);
    if (isDuplicate) {
      return prevState;
    }
    updatedSocketMessages[socket.id] = [...updatedSocketMessages[socket.id], message];
  } else {
    updatedSocketMessages[socket.id] = [message];
  }

  const customMessageOnSelectedSocket =
    message.endpoints.source === 'chrome_extension' &&
    prevState.selectedSocket &&
    prevState.selectedSocket.id === socket.id;

  if (customMessageOnSelectedSocket) {
    // trigger MessageTable scroll so that user can see the
    // custom message
    return {
      ...prevState,
      socketMessages: updatedSocketMessages,
      selectedSocket: { ...prevState.selectedSocket!, unseenCustomMessageId: message.id },
    };
  }

  return { ...prevState, socketMessages: updatedSocketMessages };
};

const applySelectSocketAction = (
  prevState: SocketState,
  action: SelectSocketAction,
): SocketState => {
  return {
    ...prevState,
    selectedSocket: { id: action.payload.selectedSocketId },
  };
};

const applySelectSocketMessageAction = (
  prevState: SocketState,
  action: SelectSocketMessageAction,
): SocketState => {
  if (!prevState.selectedSocket) {
    throw new Error('Tried to call SELECT_SOCKET_MESSAGE when no socket is selected');
  }
  return {
    ...prevState,
    selectedSocket: {
      id: prevState.selectedSocket.id,
      selectedMessageId: action.payload.selectedMessageId,
    },
  };
};

const applyClearSelectedMessageIdAction = (
  prevState: SocketState,
  _action: ClearSelectedMessageIdAction,
): SocketState => {
  if (!prevState.selectedSocket) {
    return prevState;
  }
  return {
    ...prevState,
    selectedSocket: {
      ...prevState.selectedSocket,
      selectedMessageId: undefined,
    },
  };
};

const applyClearSelectedSocketMessagesAction = (
  prevState: SocketState,
  _action: ClearSelectedSocketMessagesAction,
): SocketState => {
  const selectedSocketId = prevState.selectedSocket?.id;
  if (!selectedSocketId) {
    throw new Error('Tried to call CLEAR_SELECTED_SOCKET_MESSAGES when no socket is selected');
  }

  return {
    ...prevState,
    socketMessages: {
      ...prevState.socketMessages,
      [selectedSocketId]: [],
    },
    selectedSocket: prevState.selectedSocket
      ? { ...prevState.selectedSocket, selectedMessageId: undefined }
      : undefined,
  };
};

const applyPrefillMessageComposerAction = (
  prevState: SocketState,
  action: PrefillMessageComposerAction,
): SocketState => {
  if (!prevState.selectedSocket) {
    throw new Error('Tried to call PREFILL_MESSAGE_COMPOSER when no socket is selected');
  }
  const { composerPrefill } = action.payload;
  return {
    ...prevState,
    selectedSocket: { ...prevState.selectedSocket, composerPrefill },
  };
};

const applyClearMessageComposerPrefillAction = (
  prevState: SocketState,
  _action: ClearMessageComposerPrefillAction,
): SocketState => {
  if (!prevState.selectedSocket) {
    throw new Error('Tried to call CLEAR_MESSAGE_COMPOSER_PREFILL when no socket is selected');
  }
  return {
    ...prevState,
    selectedSocket: {
      ...prevState.selectedSocket,
      composerPrefill: undefined,
    },
  };
};

const applyClearUnseenCustomMessageIdAction = (
  prevState: SocketState,
  _action: ClearUnseenCustomMessageIdAction,
): SocketState => {
  if (!prevState.selectedSocket) {
    return prevState;
  }
  return {
    ...prevState,
    selectedSocket: { ...prevState.selectedSocket, unseenCustomMessageId: undefined },
  };
};
