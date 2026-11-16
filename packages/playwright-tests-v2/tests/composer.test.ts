import { test } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel } from '../page-models/sidebarPageModel';

test('it can send a message to the server', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([]);

  const toServer = JSON.stringify({ from: 'composer', to: 'server' });
  await devtoolsPanel.selectComposerDestination('Server');
  await devtoolsPanel.selectComposerPayloadType('JSON');
  await devtoolsPanel.enterComposerPayload(toServer);
  await devtoolsPanel.submitComposerMessage();

  await connection.server.expectMessages([toServer]);
  await connection.client.expectMessagesToStay([]);
  await devtoolsPanel.assertTableMessages([{ text: toServer, direction: 'outgoing' }]);

  await connection.server.send('pong');
  await connection.client.expectMessages(['pong']);
  await devtoolsPanel.assertTableMessages([
    { text: toServer, direction: 'outgoing' },
    { text: 'pong', direction: 'incoming' },
  ]);
});

test('it can send a message to the client', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([]);

  const toClient = JSON.stringify({ from: 'composer', to: 'client' });
  await devtoolsPanel.selectComposerDestination('Client');
  await devtoolsPanel.selectComposerPayloadType('JSON');
  await devtoolsPanel.enterComposerPayload(toClient);
  await devtoolsPanel.submitComposerMessage();

  await connection.client.expectMessages([toClient]);
  await connection.server.expectMessagesToStay([]);
  await devtoolsPanel.assertTableMessages([{ text: toClient, direction: 'incoming' }]);
});

test('it shows an error if payload is empty', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Connected' });
  await devtoolsPanel.assertNoComposerErrors();

  await devtoolsPanel.selectComposerDestination('Server');
  await devtoolsPanel.selectComposerPayloadType('JSON');
  await devtoolsPanel.submitComposerMessage();
  await devtoolsPanel.assertComposerError('Payload must not be empty');
  await devtoolsPanel.assertTableMessages([]);

  await devtoolsPanel.selectComposerPayloadType('Text');
  await devtoolsPanel.assertNoComposerErrors();
  await devtoolsPanel.submitComposerMessage();
  await devtoolsPanel.assertComposerError('Payload must not be empty');
  await devtoolsPanel.assertTableMessages([]);
});

test('correcting an empty payload error allows the message to be sent', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Connected' });

  await devtoolsPanel.selectComposerDestination('Client');
  await devtoolsPanel.selectComposerPayloadType('JSON');
  await devtoolsPanel.submitComposerMessage();
  await devtoolsPanel.assertComposerError('Payload must not be empty');
  await devtoolsPanel.assertTableMessages([]);

  const toClient = JSON.stringify({ from: 'composer', to: 'client' });
  await devtoolsPanel.enterComposerPayload(toClient);
  await devtoolsPanel.submitComposerMessage();
  await devtoolsPanel.assertNoComposerErrors();

  await connection.client.expectMessages([toClient]);
  await devtoolsPanel.assertTableMessages([{ text: toClient, direction: 'incoming' }]);
});

test('it can still send a message when the websocket is paused', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Connected' });

  await connection.client.send('baseline ping');
  await connection.server.expectMessages(['baseline ping']);
  await connection.server.send('baseline pong');
  await connection.client.expectMessages(['baseline pong']);

  await devtoolsPanel.clearTableMessages();
  await devtoolsPanel.assertTableMessages([]);
  await devtoolsPanel.togglePauseCapture();

  const toServer = JSON.stringify({ from: 'composer', to: 'server' });
  await devtoolsPanel.selectComposerDestination('Server');
  await devtoolsPanel.selectComposerPayloadType('JSON');
  await devtoolsPanel.enterComposerPayload(toServer);
  await devtoolsPanel.submitComposerMessage();

  await connection.server.expectMessages(['baseline ping', toServer]);
  await devtoolsPanel.assertTableMessages([{ text: toServer, direction: 'outgoing' }]);

  await connection.server.send('blocked pong');
  await connection.client.expectMessagesToStay(['baseline pong']);

  const toClient = JSON.stringify({ from: 'composer', to: 'client' });
  await devtoolsPanel.selectComposerDestination('Client');
  await devtoolsPanel.clearComposerPayload();
  await devtoolsPanel.enterComposerPayload(toClient);
  await devtoolsPanel.submitComposerMessage();

  await connection.client.expectMessages(['baseline pong', toClient]);
  await devtoolsPanel.assertTableMessages([
    { text: toServer, direction: 'outgoing' },
    { text: toClient, direction: 'incoming' },
  ]);
});

test('it shows an error when sending invalid json', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Connected' });
  await devtoolsPanel.assertNoComposerErrors();

  await devtoolsPanel.selectComposerDestination('Server');
  await devtoolsPanel.selectComposerPayloadType('JSON');
  await devtoolsPanel.enterComposerPayload('{from:composer"');
  await devtoolsPanel.submitComposerMessage();

  await devtoolsPanel.assertComposerError('Payload must be valid JSON');
  await connection.server.expectMessagesToStay([]);
  await devtoolsPanel.assertTableMessages([]);
});

test('it shows an error when sending a message on a closed socket', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await connection.client.close();
  await connection.server.expectClosed();

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Disconnected' });
  await devtoolsPanel.assertNoComposerErrors();

  await devtoolsPanel.selectComposerDestination('Server');
  await devtoolsPanel.selectComposerPayloadType('JSON');
  await devtoolsPanel.enterComposerPayload(JSON.stringify({ from: 'composer', to: 'server' }));
  await devtoolsPanel.submitComposerMessage();

  await devtoolsPanel.assertComposerError('Cannot send a message on a closed socket');
  await connection.server.expectMessagesToStay([]);
  await devtoolsPanel.assertTableMessages([]);
});
