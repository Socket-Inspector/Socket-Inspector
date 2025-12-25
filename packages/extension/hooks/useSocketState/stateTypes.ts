import { Packet, SocketDetails, SocketMessage } from '@/utils/sharedTypes/sharedTypes';

export type SocketState = {
  sockets: Array<SocketDetails>;
  socketMessages: Record<SocketDetails['id'], Array<SocketMessage>>;
  selectedSocket?: {
    id: string;
    selectedMessageId?: string;
    composerPrefill?: MessageComposerFormData;
    unseenCustomMessageId?: string;
  };
};

export type MessageComposerFormData = {
  destination: 'client' | 'server';
  payloadType: 'raw' | 'json';
  payload: string;
};

export type SelectSocketAction = {
  type: 'SELECT_SOCKET';
  payload: { selectedSocketId: SocketDetails['id'] };
};

export type SelectSocketMessageAction = {
  type: 'SELECT_SOCKET_MESSAGE';
  payload: { selectedMessageId: SocketMessage['id'] };
};

export type ClearSelectedSocketMessagesAction = {
  type: 'CLEAR_SELECTED_SOCKET_MESSAGES';
};

export type ClearSelectedMessageIdAction = {
  type: 'CLEAR_SELECTED_MESSAGE_ID';
};

export type PrefillMessageComposerAction = {
  type: 'PREFILL_MESSAGE_COMPOSER';
  payload: { composerPrefill: MessageComposerFormData };
};

export type ClearMessageComposerPrefillAction = {
  type: 'CLEAR_MESSAGE_COMPOSER_PREFILL';
};

export type ClearUnseenCustomMessageIdAction = {
  type: 'CLEAR_UNSEEN_CUSTOM_MESSAGE_ID_ACTION';
};

export type ReducerAction =
  | SelectSocketAction
  | SelectSocketMessageAction
  | ClearSelectedSocketMessagesAction
  | ClearSelectedMessageIdAction
  | PrefillMessageComposerAction
  | ClearMessageComposerPrefillAction
  | ClearUnseenCustomMessageIdAction
  | Packet;
