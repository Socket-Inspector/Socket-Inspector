import { describe, expect, it } from 'vitest';
import { ReducerAction, SelectSocketAction, SocketState } from '../useSocketState/stateTypes';
import { getInitialState, reducer } from '../useSocketState/reducer';
import { SocketDetailsPacket, SocketMessagePacket } from '@/utils/sharedTypes/sharedTypes';
import { querySelectedSocketMessages } from '../useSocketState/queries';

describe('reducer', () => {
  describe('SocketDetailsPacket', () => {
    it('CONNECTING to CONNECTED', () => {
      const initialState: SocketState = getInitialState();

      // Socket is CONNECTING
      const connectingAction: ReducerAction = {
        type: 'SocketDetailsPacket',
        payload: {
          socket: {
            id: '0cd8ad1a-33d0-4974-b57b-3148370b8c8e',
            url: 'ws://localhost:6844/',
            status: 'CONNECTING',
            isPaused: false,
          },
        },
      };

      const connectingState = reducer(initialState, connectingAction);

      expect(connectingState).toEqual({
        sockets: [
          {
            id: '0cd8ad1a-33d0-4974-b57b-3148370b8c8e',
            url: 'ws://localhost:6844/',
            status: 'CONNECTING',
            isPaused: false,
          },
        ],
        socketMessages: {},
      });

      // Socket is CONNECTED
      const connectedAction: ReducerAction = {
        type: 'SocketDetailsPacket',
        payload: {
          socket: {
            id: '0cd8ad1a-33d0-4974-b57b-3148370b8c8e',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
      };

      const connectedState = reducer(connectingState, connectedAction);

      expect(connectedState).toEqual({
        sockets: [
          {
            id: '0cd8ad1a-33d0-4974-b57b-3148370b8c8e',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {},
      });
    });
    it('CONNECTED to CLOSED', () => {
      const connectedState: SocketState = {
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
              timestampISO: '2025-08-30T20:41:19.076Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      };

      const closedPacket: SocketDetailsPacket = {
        type: 'SocketDetailsPacket',
        payload: {
          socket: {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'CLOSED',
            isPaused: false,
          },
        },
      };

      expect(reducer(connectedState, closedPacket)).toEqual({
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'CLOSED',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
              timestampISO: '2025-08-30T20:41:19.076Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      });
    });
    it('socket connects when there is a CLOSED socket with the same URL', () => {
      const startState: SocketState = {
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'CLOSED',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
              timestampISO: '2025-08-30T20:41:19.076Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      };

      const connectingPacket: SocketDetailsPacket = {
        type: 'SocketDetailsPacket',
        payload: {
          socket: {
            id: '661d82ca-23d2-4d1b-b069-be5ff140db1f',
            url: 'ws://localhost:6844/',
            status: 'CONNECTING',
            isPaused: false,
          },
        },
      };

      expect(reducer(startState, connectingPacket)).toEqual({
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'CLOSED',
            isPaused: false,
          },
          {
            id: '661d82ca-23d2-4d1b-b069-be5ff140db1f',
            url: 'ws://localhost:6844/',
            status: 'CONNECTING',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
              timestampISO: '2025-08-30T20:41:19.076Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      });
    });
  });

  describe('SELECT_SOCKET', () => {
    it('can select initial socket', () => {
      const state: SocketState = {
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {},
      };

      const action: SelectSocketAction = {
        type: 'SELECT_SOCKET',
        payload: { selectedSocketId: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      };

      expect(reducer(state, action)).toEqual({
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {},
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      });
    });
    it('can change the selected socket', () => {
      const state: SocketState = {
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'CLOSED',
            isPaused: false,
          },
          {
            id: '661d82ca-23d2-4d1b-b069-be5ff140db1f',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
              timestampISO: '2025-08-30T20:41:19.076Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      };
      const selectNextSocket: SelectSocketAction = {
        type: 'SELECT_SOCKET',
        payload: { selectedSocketId: '661d82ca-23d2-4d1b-b069-be5ff140db1f' },
      };
      expect(reducer(state, selectNextSocket)).toEqual({
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'CLOSED',
            isPaused: false,
          },
          {
            id: '661d82ca-23d2-4d1b-b069-be5ff140db1f',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
              timestampISO: '2025-08-30T20:41:19.076Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '661d82ca-23d2-4d1b-b069-be5ff140db1f' },
      });
    });
  });

  describe('SocketMessagePacket', () => {
    it('two messages arrive in a row', () => {
      const state0: SocketState = {
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {},
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      };

      // first message arrives
      const firstMessageAction: SocketMessagePacket = {
        type: 'SocketMessagePacket',
        payload: {
          socket: {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
          message: {
            id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
            timestampISO: '2025-08-30T20:41:19.061Z',
            endpoints: { source: 'client', destination: 'server' },
            payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
            socketDetails: {
              id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
              url: 'ws://localhost:6844/',
              status: 'OPEN',
              isPaused: false,
            },
          },
        },
      };

      const state1 = reducer(state0, firstMessageAction);

      expect(state1).toEqual({
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      });

      // second message arrives
      const secondMessageAction: SocketMessagePacket = {
        type: 'SocketMessagePacket',
        payload: {
          socket: {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
          message: {
            id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
            timestampISO: '2025-08-30T20:41:19.076Z',
            endpoints: { source: 'server', destination: 'client' },
            payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
            socketDetails: {
              id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
              url: 'ws://localhost:6844/',
              status: 'OPEN',
              isPaused: false,
            },
          },
        },
      };

      const state2 = reducer(state1, secondMessageAction);

      expect(state2).toEqual({
        sockets: [
          {
            id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {
          '4a2e45fc-c3d9-4429-8194-e7be165c9d3c': [
            {
              id: 'c882f18c-8f07-4e21-9681-00d5308dce7a',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'ad9f580b-f93f-47d8-8ee8-3cd4943314bd',
              timestampISO: '2025-08-30T20:41:19.076Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: '{"type":"EchoResponse","payload":{"message":"fr"}}',
              socketDetails: {
                id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: '4a2e45fc-c3d9-4429-8194-e7be165c9d3c' },
      });
    });

    it('ignores duplicate messages with the same ID', () => {
      const initialState: SocketState = {
        sockets: [
          {
            id: 'TEST_SOCKET_ID',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {
          TEST_SOCKET_ID: [
            {
              id: 'ORIGINAL_MESSAGE_ID',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"original"}}',
              socketDetails: {
                id: 'TEST_SOCKET_ID',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: 'TEST_SOCKET_ID' },
      };

      const duplicateMessageAction: SocketMessagePacket = {
        type: 'SocketMessagePacket',
        payload: {
          socket: {
            id: 'TEST_SOCKET_ID',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
          message: {
            id: 'ORIGINAL_MESSAGE_ID', // Same ID as existing message
            timestampISO: '2025-08-30T20:41:20.000Z',
            endpoints: { source: 'client', destination: 'server' },
            payload: '{"type":"EchoRequest","payload":{"message":"duplicate"}}',
            socketDetails: {
              id: 'TEST_SOCKET_ID',
              url: 'ws://localhost:6844/',
              status: 'OPEN',
              isPaused: false,
            },
          },
        },
      };

      const resultState = reducer(initialState, duplicateMessageAction);

      expect(resultState).toEqual(initialState);
    });

    /**
     * TODO:
     * is this basically the invariant for real devtools?:
     *  only ever show a socket if the devtools were open when the socket connected
     */
    describe('if a socket message arrives on a socket that is not stored in the sockets field', () => {
      /**
       * This covers the scenario where
       * 1. host page connects to a websocket
       * 2. devtools panel opens (i.e. panel not open when socket connects)
       * 3. message arrives on the websocket
       *
       * In this scenario, we will NOT show the websocket or the message, which
       * keeps parity with chrome devtools
       */
      it('the socket is not added to socketMessages but the message is stored', () => {
        const startingState: SocketState = { sockets: [], socketMessages: {} };
        const action: ReducerAction = {
          type: 'SocketMessagePacket',
          payload: {
            socket: {
              id: 'TEST_SOCKET_ID',
              url: 'ws://localhost:6844/',
              status: 'OPEN',
              isPaused: false,
            },
            message: {
              id: 'TEST_MESSAGE_ID',
              timestampISO: '2025-08-30T21:55:05.802Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: '{"type":"EchoRequest","payload":{"message":"hi"}}',
              socketDetails: {
                id: 'TEST_SOCKET_ID',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          },
        };

        const nextState = reducer(startingState, action);

        expect(nextState.sockets.length).toBe(0);
        // TODO: make sure we won't ever need the missed messages before uncommenting these assertions
        //       e.g. we should write a unit test for querySelectedSocketMessages()
        //            and other queries for that matter
        // expect(Object.keys(nextState.socketMessages).length).toBe(0);
        // expect(nextState).toEqual(startingState);
      });
    });
  });

  describe('CLEAR_SELECTED_SOCKET_MESSAGES', () => {
    it("clears all of the selected socket's messages", () => {
      const SOCKET_ID = 'SOCKET_1';
      const OTHER_SOCKET_ID = 'SOCKET_2';

      const startState: SocketState = {
        sockets: [
          { id: SOCKET_ID, url: 'ws://localhost:1234/', status: 'OPEN', isPaused: false },
          { id: OTHER_SOCKET_ID, url: 'ws://localhost:5678/', status: 'OPEN', isPaused: false },
        ],
        socketMessages: {
          [SOCKET_ID]: [
            {
              id: 'MSG_1',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: 'm1',
              socketDetails: {
                id: SOCKET_ID,
                url: 'ws://localhost:1234/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
          [OTHER_SOCKET_ID]: [
            {
              id: 'MSG_2',
              timestampISO: '2025-08-30T20:41:20.000Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: 'm2',
              socketDetails: {
                id: OTHER_SOCKET_ID,
                url: 'ws://localhost:5678/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: SOCKET_ID },
      };

      const action: ReducerAction = { type: 'CLEAR_SELECTED_SOCKET_MESSAGES' };
      const nextState = reducer(startState, action);

      expect(nextState.socketMessages[SOCKET_ID]).toEqual([]);
      // ensure other sockets are unaffected
      expect(nextState.socketMessages[OTHER_SOCKET_ID]).toEqual(
        startState.socketMessages[OTHER_SOCKET_ID],
      );
    });

    it('clears the selectedMessageId if it exists', () => {
      const SOCKET_ID = 'SOCKET_1';

      const startState: SocketState = {
        sockets: [{ id: SOCKET_ID, url: 'ws://localhost:1234/', status: 'OPEN', isPaused: false }],
        socketMessages: {
          [SOCKET_ID]: [
            {
              id: 'MSG_1',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: 'm1',
              socketDetails: {
                id: SOCKET_ID,
                url: 'ws://localhost:1234/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: SOCKET_ID, selectedMessageId: 'MSG_1' },
      };

      const action: ReducerAction = { type: 'CLEAR_SELECTED_SOCKET_MESSAGES' };
      const nextState = reducer(startState, action);

      expect(nextState.selectedSocket!.selectedMessageId).toBeUndefined();
    });

    it('does not mutate the previous state', () => {
      const SOCKET_ID = 'SOCKET_1';

      const startState: SocketState = {
        sockets: [{ id: SOCKET_ID, url: 'ws://localhost:1234/', status: 'OPEN', isPaused: false }],
        socketMessages: {
          [SOCKET_ID]: [
            {
              id: 'MSG_1',
              timestampISO: '2025-08-30T20:41:19.061Z',
              endpoints: { source: 'client', destination: 'server' },
              payload: 'm1',
              socketDetails: {
                id: SOCKET_ID,
                url: 'ws://localhost:1234/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: SOCKET_ID, selectedMessageId: 'MSG_1' },
      };

      const action: ReducerAction = { type: 'CLEAR_SELECTED_SOCKET_MESSAGES' };
      const startStateSelectedMessageId = startState.selectedSocket?.selectedMessageId;
      reducer(startState, action);

      expect(startState.selectedSocket?.selectedMessageId).toBe(startStateSelectedMessageId);
    });
  });

  describe('autoscroll', () => {
    it('sets unseenCustomMessageId if a custom message arrives on the selected socket', () => {
      const startState: SocketState = {
        sockets: [
          {
            id: 'AN_EXCELLENT_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        ],
        socketMessages: {
          AN_EXCELLENT_SOCKET: [
            {
              id: 'FIRST_MESSAGE_ID',
              timestampISO: '2025-09-26T01:12:58.810Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: 'message: 16',
              socketDetails: {
                id: 'AN_EXCELLENT_SOCKET',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
            {
              id: 'SECOND_MESSAGE_ID',
              timestampISO: '2025-09-26T01:12:58.821Z',
              endpoints: { source: 'server', destination: 'client' },
              payload: 'message: 17',
              socketDetails: {
                id: 'AN_EXCELLENT_SOCKET',
                url: 'ws://localhost:6844/',
                status: 'OPEN',
                isPaused: false,
              },
            },
          ],
        },
        selectedSocket: { id: 'AN_EXCELLENT_SOCKET' },
      };

      const customMessageAction: SocketMessagePacket = {
        type: 'SocketMessagePacket',
        payload: {
          socket: {
            id: 'AN_EXCELLENT_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
          message: {
            id: 'CUSTOM_MESSAGE_ID',
            timestampISO: '2025-09-26T01:13:30.907Z',
            endpoints: { source: 'chrome_extension', destination: 'client' },
            payload: 'CUSTOM_MESSAGE',
            socketDetails: {
              id: 'AN_EXCELLENT_SOCKET',
              url: 'ws://localhost:6844/',
              status: 'OPEN',
              isPaused: false,
            },
          },
        },
      };

      // custom message arrives
      const nextState = reducer(startState, customMessageAction);
      expect(nextState.selectedSocket).toEqual({
        id: 'AN_EXCELLENT_SOCKET',
        unseenCustomMessageId: 'CUSTOM_MESSAGE_ID',
      });
      const messageIds = querySelectedSocketMessages(nextState).map((m) => m.id);
      expect(messageIds).toEqual(['FIRST_MESSAGE_ID', 'SECOND_MESSAGE_ID', 'CUSTOM_MESSAGE_ID']);

      // message table dispatches CLEAR_UNSEEN_CUSTOM_MESSAGE_ID_ACTION
      const finalState = reducer(nextState, { type: 'CLEAR_UNSEEN_CUSTOM_MESSAGE_ID_ACTION' });
      expect(finalState.selectedSocket).toEqual({
        id: 'AN_EXCELLENT_SOCKET',
        unseenCustomMessageId: undefined,
      });
    });
  });
});
