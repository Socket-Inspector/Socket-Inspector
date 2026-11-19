import { test } from '../fixtures';
import { CloseSocketPopupModel } from '../page-models/closeSocketPopupModel';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel } from '../page-models/sidebarPageModel';
import { assertVisible } from '../playwrightHelpers';

test('the close panel closes both the client and server', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  const closeSocketPopup = new CloseSocketPopupModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  await devtoolsPanel.bringToFront();

  const connection = hostPage.connection;

  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Connected' }]);

  await sidebar.clickSocketCloseButton(connection.url);
  await assertVisible(closeSocketPopup.locators.header);
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Connected' }]);
  await closeSocketPopup.locators.submitButton.click();

  await connection.client.expectClosed({ code: 1000, reason: '' });
  await connection.server.expectClosed({ code: 1005, reason: '' });
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Disconnected' }]);
});

test('the close panel sends the selected close code and reason to the client', async ({
  page,
  harness,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  const closeSocketPopup = new CloseSocketPopupModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  await devtoolsPanel.bringToFront();

  const connection = hostPage.connection;

  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Connected' }]);

  await sidebar.clickSocketCloseButton(connection.url);
  await assertVisible(closeSocketPopup.locators.header);
  await closeSocketPopup.selectCloseCode('1008');
  await closeSocketPopup.enterCloseReason('Session ended');
  await closeSocketPopup.locators.submitButton.click();

  await connection.client.expectClosed({ code: 1008, reason: 'Session ended' });
  await connection.server.expectClosed({ code: 1005, reason: '' });
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Disconnected' }]);
});
