import { test } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel } from '../page-models/sidebarPageModel';

test('using the pause function', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const { client, server, url } = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.clickSocketLink({ url, status: 'Connected' });

  await client.send('ping 1');
  await server.expectMessages(['ping 1']);
  await server.send('pong 1');
  await client.expectMessages(['pong 1']);

  await devtoolsPanel.assertTableMessages([
    { text: 'ping 1', direction: 'outgoing' },
    { text: 'pong 1', direction: 'incoming' },
  ]);

  await devtoolsPanel.clearTableMessages();
  await devtoolsPanel.assertTableMessages([]);

  await devtoolsPanel.togglePauseCapture();
  await client.send('ping 2');
  await server.send('pong 2');

  await server.expectMessagesToStay(['ping 1']);
  await client.expectMessagesToStay(['pong 1']);
  await devtoolsPanel.assertTableMessages([]);

  await devtoolsPanel.togglePauseCapture();
  await client.send('ping 3');
  await server.expectMessages(['ping 1', 'ping 3']);
  await server.send('pong 3');
  await client.expectMessages(['pong 1', 'pong 3']);

  await devtoolsPanel.assertTableMessages([
    { text: 'ping 3', direction: 'outgoing' },
    { text: 'pong 3', direction: 'incoming' },
  ]);
});
