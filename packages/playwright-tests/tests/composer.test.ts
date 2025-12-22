import { test } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { HostPageModel } from '../page-models/hostPageModel';

test('it can send an echo message to the server', async ({ page, context, devtoolsPanelUrl }) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertTableMessages([]);

  await devtoolsPanelModel.selectComposerDestination('Server');
  await devtoolsPanelModel.selectComposerPayloadType('JSON');
  await devtoolsPanelModel.enterComposerPayload(
    JSON.stringify({
      type: 'EchoRequest',
      payload: { message: 'CHROME' },
    }),
  );
  await devtoolsPanelModel.submitComposerMessage();

  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"CHROME"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"CHROME"}}`,
      direction: 'incoming',
    },
  ]);

  await hostPageModel.bringToFront();
  await hostPageModel.assertEchoResponse('CHROME');
});

test('it can send an echo message to the client', async ({ page, context, devtoolsPanelUrl }) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertTableMessages([]);

  await devtoolsPanelModel.selectComposerDestination('Client');
  await devtoolsPanelModel.selectComposerPayloadType('JSON');
  await devtoolsPanelModel.enterComposerPayload(
    JSON.stringify({
      type: 'EchoResponse',
      payload: { message: 'CHROME_CLIENT_ONLY' },
    }),
  );
  await devtoolsPanelModel.submitComposerMessage();

  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoResponse","payload":{"message":"CHROME_CLIENT_ONLY"}}`,
      direction: 'incoming',
    },
  ]);

  await hostPageModel.bringToFront();
  await hostPageModel.assertEchoResponse('CHROME_CLIENT_ONLY');
});

test('it shows an error if payload is empty', async ({ page, context, devtoolsPanelUrl }) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertNoComposerErrors();

  // JSON payload
  await devtoolsPanelModel.selectComposerDestination('Server');
  await devtoolsPanelModel.selectComposerPayloadType('JSON');
  await devtoolsPanelModel.submitComposerMessage();
  await devtoolsPanelModel.assertComposerError('Payload must not be empty');
  await devtoolsPanelModel.assertTableMessages([]);

  // Text payload
  await devtoolsPanelModel.selectComposerPayloadType('Text');
  await devtoolsPanelModel.assertNoComposerErrors();
  await devtoolsPanelModel.submitComposerMessage();
  await devtoolsPanelModel.assertComposerError('Payload must not be empty');
  await devtoolsPanelModel.assertTableMessages([]);
});

test('correcting an empty payload error allows the message to be sent', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.selectComposerPayloadType('JSON');
  await devtoolsPanelModel.submitComposerMessage();
  await devtoolsPanelModel.assertComposerError('Payload must not be empty');
  await devtoolsPanelModel.assertTableMessages([]);

  await devtoolsPanelModel.enterComposerPayload(
    JSON.stringify({
      type: 'EchoResponse',
      payload: { message: 'CHROME_CLIENT_ONLY' },
    }),
  );
  await devtoolsPanelModel.submitComposerMessage();
  await devtoolsPanelModel.assertNoComposerErrors();
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoResponse","payload":{"message":"CHROME_CLIENT_ONLY"}}`,
      direction: 'incoming',
    },
  ]);
});

test('it can still send a message when the websocket is paused', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  // Open the devtools panel and select the socket
  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  // Establish a baseline server echo so we can assert it doesn't change while paused
  await hostPageModel.bringToFront();
  await hostPageModel.sendEchoMessage('BASELINE');
  await hostPageModel.assertEchoResponse('BASELINE');

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clearTableMessages();
  await devtoolsPanelModel.assertTableMessages([]);

  await devtoolsPanelModel.togglePauseCapture();

  // While paused, send a message to the SERVER via the composer
  await devtoolsPanelModel.selectComposerDestination('Server');
  await devtoolsPanelModel.selectComposerPayloadType('JSON');
  await devtoolsPanelModel.enterComposerPayload(
    JSON.stringify({ type: 'EchoRequest', payload: { message: 'EXT_SERVER' } }),
  );
  await devtoolsPanelModel.submitComposerMessage();

  // Outgoing extension-injected request should appear in the table
  await devtoolsPanelModel.assertTableMessages([
    { text: `{"type":"EchoRequest","payload":{"message":"EXT_SERVER"}}`, direction: 'outgoing' },
  ]);

  // The server's response should be blocked while paused; host page should remain on BASELINE
  await page.waitForTimeout(300);
  await hostPageModel.bringToFront();
  await hostPageModel.assertEchoResponse('BASELINE');

  // While still paused, send a message to the CLIENT via the composer
  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.selectComposerDestination('Client');
  await devtoolsPanelModel.selectComposerPayloadType('JSON');
  await devtoolsPanelModel.clearComposerPayload();
  await devtoolsPanelModel.enterComposerPayload(
    JSON.stringify({ type: 'EchoResponse', payload: { message: 'EXT_CLIENT' } }),
  );
  await devtoolsPanelModel.submitComposerMessage();

  // Incoming extension-injected message to client should appear in the table even while paused
  await devtoolsPanelModel.assertTableMessages([
    { text: `{"type":"EchoRequest","payload":{"message":"EXT_SERVER"}}`, direction: 'outgoing' },
    { text: `{"type":"EchoResponse","payload":{"message":"EXT_CLIENT"}}`, direction: 'incoming' },
  ]);

  // Host page should update to EXT_CLIENT because we injected directly to client
  await hostPageModel.bringToFront();
  await hostPageModel.assertEchoResponse('EXT_CLIENT');
});

test('it shows an error when sending invalid json', async ({ page, context, devtoolsPanelUrl }) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertNoComposerErrors();

  // Select JSON payload type
  await devtoolsPanelModel.selectComposerDestination('Server');
  await devtoolsPanelModel.selectComposerPayloadType('JSON');

  // Enter invalid JSON (missing closing brace)
  await devtoolsPanelModel.enterComposerPayload('{type:EchoRequest"');
  await devtoolsPanelModel.submitComposerMessage();
  await devtoolsPanelModel.assertComposerError('Payload must be valid JSON');
  await devtoolsPanelModel.assertTableMessages([]);
});

// test.skip("it shows an error when trying to send a message on a closed socket", async ({
//   page,
//   context,
//   devtoolsPanelUrl,
// }) => {});
