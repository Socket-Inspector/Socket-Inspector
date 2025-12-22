import { test, expect } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { HostPageModel } from '../page-models/hostPageModel';
import { assertVisible } from '../playwrightHelpers';

test("if page has no websockets, then 'No WebSockets Detected' text displays", async ({
  page,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();
  await expect(devtoolsPanelModel.locators.sidebarHeader).toBeVisible();
  await expect(devtoolsPanelModel.locators.noWebsocketsText).toBeVisible();
});

test("if page has websockets, but none are selected, then 'Select a WebSocket' text displays", async ({
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
  await expect(devtoolsPanelModel.locators.sidebarHeader).toBeVisible();
  await expect(devtoolsPanelModel.locators.selectWebsocketText).toBeVisible();
  await expect(
    devtoolsPanelModel.locateSocketLink({
      url: hostPageModel.serverBaseUrl,
      status: 'Connected',
    }),
  ).toBeVisible();
  await expect(
    devtoolsPanelModel.locateSocketLink({
      url: hostPageModel.serverBaseUrl,
      status: 'Connected',
    }),
  ).toBeVisible();
});

test('table can capture echo message from host page', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);

  await hostPageModel.navigateToHostPage();
  await hostPageModel.sendEchoMessage('HELLO');

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);
  await assertVisible(devtoolsPanelModel.locators.selectMessageText);
});

test('clearing the table messages', async ({ page, context, devtoolsPanelUrl }) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.sendEchoMessage('HELLO');

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);

  await devtoolsPanelModel.clearTableMessages();
  await devtoolsPanelModel.assertTableMessages([]);
  await assertVisible(devtoolsPanelModel.locators.noMessagesCapturedText);
});

test('using the direction dropdown', async ({ page, context, devtoolsPanelUrl }) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.sendEchoMessage('HELLO');

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);

  await devtoolsPanelModel.selectDirectionFilter('Sent');
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
  ]);

  await devtoolsPanelModel.selectDirectionFilter('Received');
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);

  await devtoolsPanelModel.selectDirectionFilter('All');
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);
});

test('using the searchbox', async ({ page, context, devtoolsPanelUrl }) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();

  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.sendEchoMessage('HELLO');

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.clickSocketLink({
    url: hostPageModel.serverBaseUrl,
    status: 'Connected',
  });

  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);

  await devtoolsPanelModel.enterSearchText('EchoRequest');
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
  ]);

  await devtoolsPanelModel.enterSearchText('EchoResponse');
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);

  await devtoolsPanelModel.clearSearchText();
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"HELLO"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"HELLO"}}`,
      direction: 'incoming',
    },
  ]);
});

test('using the pause function', async ({ page, context, devtoolsPanelUrl }) => {
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

  // 1. Send initial echo message (should appear)
  await hostPageModel.bringToFront();
  await hostPageModel.sendEchoMessage('ONE');
  await hostPageModel.assertEchoResponse('ONE');

  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"ONE"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"ONE"}}`,
      direction: 'incoming',
    },
  ]);

  // 2. Clear the table
  await devtoolsPanelModel.clearTableMessages();
  await devtoolsPanelModel.assertTableMessages([]);

  // 3. Pause capture
  await devtoolsPanelModel.togglePauseCapture();

  // 4. Send second echo message while paused (should be blocked)
  await hostPageModel.bringToFront();
  await hostPageModel.sendEchoMessage('TWO');

  // Assert host page does NOT receive SECOND echo
  const echoResponseDisplay = hostPage.getByTestId('echo-response-display');
  await page.waitForTimeout(300);
  await expect(echoResponseDisplay).toHaveText('ONE');

  // Assert devtools table stays empty while paused
  await devtoolsPanelModel.bringToFront();
  const tableRowsWhilePaused = devtoolsPanelModel.locators.messageTableLocator.locator('tbody tr');
  await expect(tableRowsWhilePaused).toHaveCount(0, { timeout: 250 });

  // 5. Resume capture
  await devtoolsPanelModel.togglePauseCapture();

  // 6. Send third echo message after resuming (should appear)
  await hostPageModel.bringToFront();
  await hostPageModel.sendEchoMessage('THREE');
  await hostPageModel.assertEchoResponse('THREE');

  // 7. Devtools should show only the THIRD message pair after resume
  await devtoolsPanelModel.bringToFront();
  await devtoolsPanelModel.assertTableMessages([
    {
      text: `{"type":"EchoRequest","payload":{"message":"THREE"}}`,
      direction: 'outgoing',
    },
    {
      text: `{"type":"EchoResponse","payload":{"message":"THREE"}}`,
      direction: 'incoming',
    },
  ]);
});

// TODO: need to have a test for simply selecting a mesage before this one tbh
// test.skip('If there is a selected message, and a filter is changed, then the selected message is cleared', async ({
//   page,
//   context,
//   devtoolsPanelUrl,
// }) => {});

// test.skip('service worker disconnect', async ({ page, context, devtoolsPanelUrl }) => {
// need test scenario for when content script wakes it up
// need another test for when devtools wakes it up
// });
