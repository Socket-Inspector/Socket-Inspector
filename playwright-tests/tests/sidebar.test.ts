import { test } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { HostPageModel } from '../page-models/hostPageModel';
import { assertVisible } from '../playwrightHelpers';

test('it can select an open socket from the sidebar', async ({
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

  await devtoolsPanelModel.assertSidebarSockets([
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Connected',
    },
  ]);
  await devtoolsPanelModel.assertTableMessages([]);
  await assertVisible(devtoolsPanelModel.locators.noMessagesCapturedText);
});

// TODO: similar test for closing from server
test('it can select a closed socket from the sidebar', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await hostPageModel.disconnectClient();

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Disconnected',
  });

  await devtoolsPanelModel.assertSidebarSockets([
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Disconnected',
    },
  ]);
});

// test.skip('closing a socket and reopening it', async ({ page, context, devtoolsPanelUrl }) => {
/**
 * open host page (which opens socket)
 * send messages on the open socket
 * validate open socket messages
 * close socket (write separate test for client side)
 * validate the open and closed sockets are visible
 * send messages on the open socket
 * validate the closed socket did not receive the messges
 * validate the open socket DID receive the messages
 */
// });

// test.skip('socket error', async ({ page, context, devtoolsPanelUrl }) => {
// test that socket shows as closed (or maybe doesn't show at all if error is during handshake?)
// });
