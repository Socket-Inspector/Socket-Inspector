/**** Sent from client ****/
export type ClientMessageGeneric<T, P = undefined> = {
  type: T;
  delay?: number;
  payload: P;
};

export type EchoRequestPayload = { message: string };
export type EchoRequest = ClientMessageGeneric<'EchoRequest', EchoRequestPayload>;

export type ServerClosureRequest = ClientMessageGeneric<'ServerClosureRequest'>;

export type StartMessageStreamRequest = ClientMessageGeneric<'StartMessageStreamRequest'>;
export type StopMessageStreamRequest = ClientMessageGeneric<'StopMessageStreamRequest'>;

export type ClientMessage =
  | EchoRequest
  | ServerClosureRequest
  | StartMessageStreamRequest
  | StopMessageStreamRequest;

/**** Sent from server ****/
export type ServerMessageGeneric<T, P = undefined> = {
  type: T;
  payload: P;
};

export type EchoResponsePayload = { message: string };
export type EchoResponse = ServerMessageGeneric<'EchoResponse', EchoResponsePayload>;

export type ServerMessage = EchoResponse;
