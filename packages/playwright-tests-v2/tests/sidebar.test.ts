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
  const { url } = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Connected' });

  await sidebar.assertSidebarSockets([{ url, status: 'Connected' }]);
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
  const { client, server, url } = hostPage.connection;

  await client.close();
  await server.expectClosed();

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Disconnected' });
  await sidebar.assertSidebarSockets([{ url, status: 'Disconnected' }]);
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
  const { client, server, url } = hostPage.connection;

  await server.close({ code: 4000, reason: 'server shutting down' });
  await client.expectClosed({ code: 4000, reason: 'server shutting down' });

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Disconnected' });
  await sidebar.assertSidebarSockets([{ url, status: 'Disconnected' }]);
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
  const oldConnection = hostPage.connection;

  await oldConnection.client.send('old_ping');
  await oldConnection.server.expectMessages(['old_ping']);
  await oldConnection.server.send('old_pong');
  await oldConnection.client.expectMessages(['old_pong']);

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: oldConnection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([
    { text: 'old_ping', direction: 'outgoing' },
    { text: 'old_pong', direction: 'incoming' },
  ]);

  await oldConnection.client.close();
  await oldConnection.server.expectClosed();
  await sidebar.assertSidebarSockets([{ url: oldConnection.url, status: 'Disconnected' }]);

  const newConnection = await hostPage.connect();
  await newConnection.client.send('new_ping');
  await newConnection.server.expectMessages(['new_ping']);
  await newConnection.server.send('new_pong');
  await newConnection.client.expectMessages(['new_pong']);

  await sidebar.assertSidebarSockets([
    { url: oldConnection.url, status: 'Disconnected' },
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
  const oldConnection = hostPage.connection;

  await oldConnection.client.send('old_ping');
  await oldConnection.server.expectMessages(['old_ping']);
  await oldConnection.server.send('old_pong');
  await oldConnection.client.expectMessages(['old_pong']);

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url: oldConnection.url, status: 'Connected' });
  await devtoolsPanel.assertTableMessages([
    { text: 'old_ping', direction: 'outgoing' },
    { text: 'old_pong', direction: 'incoming' },
  ]);

  await oldConnection.server.close({ code: 4000, reason: 'server_shutting_down' });
  await oldConnection.client.expectClosed({ code: 4000, reason: 'server_shutting_down' });
  await sidebar.assertSidebarSockets([{ url: oldConnection.url, status: 'Disconnected' }]);

  const newConnection = await hostPage.connect();
  await newConnection.client.send('new_ping');
  await newConnection.server.expectMessages(['new_ping']);
  await newConnection.server.send('new_pong');
  await newConnection.client.expectMessages(['new_pong']);

  await sidebar.assertSidebarSockets([
    { url: oldConnection.url, status: 'Disconnected' },
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
  const oldConnection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.assertSidebarSockets([{ url: oldConnection.url, status: 'Connected' }]);

  await hostPage.reload();
  const newConnection = hostPage.connection;

  await oldConnection.server.expectClosed();
  await sidebar.assertSidebarSockets([{ url: newConnection.url, status: 'Connected' }]);
});
