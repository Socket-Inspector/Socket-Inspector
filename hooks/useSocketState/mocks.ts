import { SocketState } from './stateTypes';

/**
 * These mocks are not used in prod. They are used to populate
 * the UI with data for taking screenshots.
 */

export const getMockChatAppState = (): SocketState => {
  const mock: SocketState = {
    sockets: [
      {
        id: 'TOTALLY_MOCKED',
        url: 'ws://localhost:4002/',
        status: 'OPEN',
        isPaused: false,
      },
      {
        id: 'FOCUSED_MOCK_SOCKET',
        url: 'ws://localhost:6844/',
        status: 'OPEN',
        isPaused: false,
      },
    ],
    socketMessages: {
      FOCUSED_MOCK_SOCKET: [
        {
          id: 'MOCK_MESSAGE_PRE_4`',
          timestampISO: '2025-09-14T16:09:11.164Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_joined","sender":"emmanuel"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_PRE_1`',
          timestampISO: '2025-09-14T16:10:12.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_joined","sender":"fumio"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_PRE_2`',
          timestampISO: '2025-09-14T17:11:42.644Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_joined","sender":"satya"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_FOR_COMPOSER`',
          timestampISO: '2025-09-14T17:12:41.814Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: getMockComposerPayload(),
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_PRE_3`',
          timestampISO: '2025-09-14T17:12:42.844Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_joined","sender":"bola"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_1`',
          timestampISO: '2025-09-14T19:58:42.844Z',
          endpoints: { source: 'client', destination: 'server' },
          payload: '{"type":"user_joined","sender":"alice"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_2',
          timestampISO: '2025-09-14T19:50:01.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_joined","sender":"bob"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_A',
          timestampISO: '2025-09-14T19:52:01.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_joined","sender":"dave"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_B',
          timestampISO: '2025-09-14T19:52:02.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"message","sender":"dave","text":"Hey team!"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_3',
          timestampISO: '2025-09-14T21:12:01.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"message","sender":"bob","text":"Hello everyone!"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_4',
          timestampISO: '2025-09-14T21:34:01.144Z',
          endpoints: { source: 'chrome_extension', destination: 'client' },
          payload: '{"type":"message","sender":"Mock User","text":"Mock Message"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_G',
          timestampISO: '2025-09-14T21:35:01.144Z',
          endpoints: { source: 'chrome_extension', destination: 'server' },
          payload: '{"type":"message","sender":"alice","text":"Mock Message from Alice"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_6',
          timestampISO: '2025-09-14T21:38:01.144Z',
          endpoints: { source: 'client', destination: 'server' },
          payload: '{"type":"message","sender":"alice","text":"Real Message from Alice"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_8',
          timestampISO: '2025-09-14T21:38:33.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_left","sender":"dave"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_9',
          timestampISO: '2025-09-14T21:43:33.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_left","sender":"bob"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_10',
          timestampISO: '2025-09-14T21:45:33.144Z',
          endpoints: { source: 'server', destination: 'client' },
          payload: '{"type":"user_left","sender":"emmanuel"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
        {
          id: 'MOCK_MESSAGE_15',
          timestampISO: '2025-09-14T21:47:33.144Z',
          endpoints: { source: 'chrome_extension', destination: 'server' },
          payload: '{"type":"user_left","sender":"alice"}',
          socketDetails: {
            id: 'FOCUSED_MOCK_SOCKET',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
      ],
    },
    selectedSocket: {
      id: 'FOCUSED_MOCK_SOCKET',
      selectedMessageId: 'ea8b3aa3-2659-4339-8f4e-9a4768e755c2',
    },
  };
  return mock;
};

const getMockComposerPayload = () => {
  const message = {
    type: 'chat_message',
    metadata: {
      correlationId: 'corr_abc123xyz789',
      source: 'WebApp_v2.1.0',
      serverTimestamp: 1726523327987,
    },
    payload: {
      messageId: 'msg_1a2b3c4d5e',
      channelId: 'chan_general_discussion',
      timestamp: '2025-09-16T20:30:00Z',
      isEdited: true,
      replyingToMessageId: null,
      sender: {
        userId: 'user_a8b7c6d5',
        username: 'Alex',
        isModerator: true,
        badges: ['early-adopter', 'beta-tester'],
      },
      content: {
        text: 'Hey @Casey, check out this design file. What do you think? 👍',
      },
      mentions: [
        {
          userId: 'user_f4e3d2c1',
          username: 'Casey',
        },
      ],
      attachments: [
        {
          type: 'file',
          filename: 'WebApp-Redesign-V2',
          sizeBytes: 4780234,
        },
      ],
      reactions: [
        {
          emoji: '👀',
          count: 2,
          users: ['user_f4e3d2c1', 'user_g9h8i7j6'],
        },
        {
          emoji: '🔥',
          count: 1,
          users: ['user_f4e3d2c1'],
        },
      ],
    },
  };
  return JSON.stringify(message);
};
