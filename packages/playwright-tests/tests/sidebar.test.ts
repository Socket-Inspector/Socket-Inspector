import { test } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel } from '../page-models/sidebarPageModel';
import { assertVisible } from '../playwrightHelpers';

test('it can select an open socket from the sidebar', async ({
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

  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Connected' }]);
  await devtoolsPanel.assertTableMessages([]);
  await assertVisible(devtoolsPanel.locators.noMessagesCapturedText);
});

test('it can select a socket closed by the client from the sidebar', async ({
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
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Disconnected' }]);
});

test('it can select a socket closed by the server from the sidebar', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await connection.server.close({ code: 4000, reason: 'server shutting down' });
  await connection.client.expectClosed({ code: 4000, reason: 'server shutting down' });

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Disconnected' });
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Disconnected' }]);
});

// TODO: @mswjs/interceptors drops the client's close code, so the server receives 1005
test.skip('it can select a socket closed by the client with a code and no reason', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await connection.client.close({ code: 4000 });
  // TODO: fails here: the server receives code 1005 instead of 4000
  await connection.server.expectClosed({ code: 4000, reason: '' });

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Disconnected' });
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Disconnected' }]);
});

test('it can select a socket closed by the server with a code and no reason', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await connection.server.close({ code: 4000 });
  await connection.client.expectClosed({ code: 4000, reason: '' });

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: connection.url, status: 'Disconnected' });
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Disconnected' }]);
});

test('closing a socket from the client and opening a new one', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();

  const initialConnection = hostPage.connection;
  await initialConnection.client.send('old_ping');
  await initialConnection.server.expectMessages(['old_ping']);
  await initialConnection.server.send('old_pong');
  await initialConnection.client.expectMessages(['old_pong']);

  await devtoolsPanel.bringToFront();

  await sidebar.clickSocketLink({ url: initialConnection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([
    { text: 'old_ping', direction: 'outgoing' },
    { text: 'old_pong', direction: 'incoming' },
  ]);

  await initialConnection.client.close();
  await initialConnection.server.expectClosed();
  await sidebar.assertSidebarSockets([{ url: initialConnection.url, status: 'Disconnected' }]);

  const newConnection = await hostPage.addConnection();
  await newConnection.client.send('new_ping');
  await newConnection.server.expectMessages(['new_ping']);
  await newConnection.server.send('new_pong');
  await newConnection.client.expectMessages(['new_pong']);

  await sidebar.assertSidebarSockets([
    { url: initialConnection.url, status: 'Disconnected' },
    { url: newConnection.url, status: 'Connected' },
  ]);
  await devtoolsPanel.assertTableMessages([
    { text: 'old_ping', direction: 'outgoing' },
    { text: 'old_pong', direction: 'incoming' },
  ]);

  await sidebar.clickSocketLink({ url: newConnection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([
    { text: 'new_ping', direction: 'outgoing' },
    { text: 'new_pong', direction: 'incoming' },
  ]);
});

test('closing a socket from the server and opening a new one', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const initialConnection = hostPage.connection;

  await initialConnection.client.send('old_ping');
  await initialConnection.server.expectMessages(['old_ping']);
  await initialConnection.server.send('old_pong');
  await initialConnection.client.expectMessages(['old_pong']);

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: initialConnection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([
    { text: 'old_ping', direction: 'outgoing' },
    { text: 'old_pong', direction: 'incoming' },
  ]);

  await initialConnection.server.close({ code: 4000, reason: 'server_shutting_down' });
  await initialConnection.client.expectClosed({ code: 4000, reason: 'server_shutting_down' });
  await sidebar.assertSidebarSockets([{ url: initialConnection.url, status: 'Disconnected' }]);

  const newConnection = await hostPage.addConnection();
  await newConnection.client.send('new_ping');
  await newConnection.server.expectMessages(['new_ping']);
  await newConnection.server.send('new_pong');
  await newConnection.client.expectMessages(['new_pong']);

  await sidebar.assertSidebarSockets([
    { url: initialConnection.url, status: 'Disconnected' },
    { url: newConnection.url, status: 'Connected' },
  ]);
  await devtoolsPanel.assertTableMessages([
    { text: 'old_ping', direction: 'outgoing' },
    { text: 'old_pong', direction: 'incoming' },
  ]);

  await sidebar.clickSocketLink({ url: newConnection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([
    { text: 'new_ping', direction: 'outgoing' },
    { text: 'new_pong', direction: 'incoming' },
  ]);
});

test('it clears the old connections when host page is refreshed', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const initialConnection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.assertSidebarSockets([{ url: initialConnection.url, status: 'Connected' }]);

  await hostPage.refreshPage();
  const newConnection = hostPage.connection;

  await initialConnection.server.expectClosed();
  await sidebar.assertSidebarSockets([{ url: newConnection.url, status: 'Connected' }]);
});
