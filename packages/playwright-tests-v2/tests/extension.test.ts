import { test, expect } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel } from '../page-models/sidebarPageModel';
import { assertVisible } from '../playwrightHelpers';

test("if page has no websockets, then 'No WebSockets Detected' text displays", async ({
  page,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  await expect(sidebar.locators.sidebarHeader).toBeVisible();
  await expect(sidebar.locators.noWebsocketsText).toBeVisible();
});

test("if page has websockets, but none are selected, then 'Select a WebSocket' text displays", async ({
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
  await expect(sidebar.locators.sidebarHeader).toBeVisible();
  await expect(sidebar.locators.selectWebsocketText).toBeVisible();
  await expect(sidebar.locateSocketLink({ url, status: 'Connected' })).toBeVisible();
});

test('table can capture messages from host page', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const { client, server, url } = hostPage.connection;

  await client.send('ping');
  await server.expectMessages(['ping']);
  await server.send('pong');
  await client.expectMessages(['pong']);

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Connected' });

  await devtoolsPanel.assertTableMessages([
    { text: 'ping', direction: 'outgoing' },
    { text: 'pong', direction: 'incoming' },
  ]);
  await assertVisible(devtoolsPanel.locators.selectMessageText);
});

test('clearing the table messages', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const { client, server, url } = hostPage.connection;

  await client.send('ping');
  await server.expectMessages(['ping']);
  await server.send('pong');
  await client.expectMessages(['pong']);

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Connected' });

  await devtoolsPanel.assertTableMessages([
    { text: 'ping', direction: 'outgoing' },
    { text: 'pong', direction: 'incoming' },
  ]);

  await devtoolsPanel.clearTableMessages();
  await devtoolsPanel.assertTableMessages([]);
  await assertVisible(devtoolsPanel.locators.noMessagesCapturedText);
});

test('using the direction dropdown', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const { client, server, url } = hostPage.connection;

  await client.send('ping');
  await server.expectMessages(['ping']);
  await server.send('pong');
  await client.expectMessages(['pong']);

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Connected' });

  await devtoolsPanel.assertTableMessages([
    { text: 'ping', direction: 'outgoing' },
    { text: 'pong', direction: 'incoming' },
  ]);

  await devtoolsPanel.selectDirectionFilter('Sent');
  await devtoolsPanel.assertTableMessages([{ text: 'ping', direction: 'outgoing' }]);

  await devtoolsPanel.selectDirectionFilter('Received');
  await devtoolsPanel.assertTableMessages([{ text: 'pong', direction: 'incoming' }]);

  await devtoolsPanel.selectDirectionFilter('All');
  await devtoolsPanel.assertTableMessages([
    { text: 'ping', direction: 'outgoing' },
    { text: 'pong', direction: 'incoming' },
  ]);
});

test('using the searchbox', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const { client, server, url } = hostPage.connection;

  await client.send('ping');
  await server.expectMessages(['ping']);
  await server.send('pong');
  await client.expectMessages(['pong']);

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Connected' });

  await devtoolsPanel.assertTableMessages([
    { text: 'ping', direction: 'outgoing' },
    { text: 'pong', direction: 'incoming' },
  ]);

  await devtoolsPanel.enterSearchText('ping');
  await devtoolsPanel.assertTableMessages([{ text: 'ping', direction: 'outgoing' }]);

  await devtoolsPanel.enterSearchText('pong');
  await devtoolsPanel.assertTableMessages([{ text: 'pong', direction: 'incoming' }]);

  await devtoolsPanel.clearSearchText();
  await devtoolsPanel.assertTableMessages([
    { text: 'ping', direction: 'outgoing' },
    { text: 'pong', direction: 'incoming' },
  ]);
});
