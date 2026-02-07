import { test } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel, SidebarSocket } from '../page-models/sidebarPageModel';
import { HostPageModel } from '../page-models/hostPageModel';
import { TinyHostPageModel } from '../page-models/tinyHostPageModel';
import { assertVisible } from '../playwrightHelpers';

test('it can select an open socket from the sidebar', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebarPageModel = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();
  await sidebarPageModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await sidebarPageModel.assertSidebarSockets([
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
  const sidebarPageModel = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await hostPageModel.disconnectClient();

  await devtoolsPanelModel.bringToFront();
  await sidebarPageModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Disconnected',
  });

  await sidebarPageModel.assertSidebarSockets([
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Disconnected',
    },
  ]);
});

test('it clears the old connections when host page is refreshed', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebarPageModel = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  const expectedSockets: Array<SidebarSocket> = [
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Connected',
    },
  ];

  await devtoolsPanelModel.bringToFront();
  await sidebarPageModel.assertSidebarSockets(expectedSockets);

  await hostPage.reload();

  await devtoolsPanelModel.bringToFront();
  // old socket was cleared, so there should only be one socket in sidebar
  await sidebarPageModel.assertSidebarSockets(expectedSockets);
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

test('it clears the old connections when tiny app host page is refreshed', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebarPageModel = new SidebarPageModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new TinyHostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  const expectedSockets: Array<SidebarSocket> = [
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Connected',
    },
  ];

  await devtoolsPanelModel.bringToFront();
  await sidebarPageModel.assertSidebarSockets(expectedSockets);

  await hostPage.reload();

  await devtoolsPanelModel.bringToFront();
  // old socket was cleared, so there should only be one socket in sidebar
  await sidebarPageModel.assertSidebarSockets(expectedSockets);
});

// test.skip('socket error', async ({ page, context, devtoolsPanelUrl }) => {
// test that socket shows as closed (or maybe doesn't show at all if error is during handshake?)
// });
