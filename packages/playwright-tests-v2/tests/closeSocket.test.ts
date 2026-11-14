import { test } from '../fixtures';
import { CloseSocketPopupModel } from '../page-models/closeSocketPopupModel';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel } from '../page-models/sidebarPageModel';
import { assertVisible } from '../playwrightHelpers';

test('it can close an open socket', async ({ page, harness, devtoolsPanelUrl }) => {
  const devtoolsPanel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebar = new SidebarPageModel(page, devtoolsPanelUrl);
  const closeSocketPopup = new CloseSocketPopupModel(page, devtoolsPanelUrl);
  await devtoolsPanel.loadDevtoolsPanel();

  const hostPage = await harness.openHostPage();
  const connection = hostPage.connection;

  await devtoolsPanel.bringToFront();
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Connected' }]);

  await sidebar.clickSocketCloseButton();
  await assertVisible(closeSocketPopup.locators.header);
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Connected' }]);
  await closeSocketPopup.locators.submitButton.click();

  await connection.client.expectClosed();
  await connection.server.expectClosed();
  await sidebar.assertSidebarSockets([{ url: connection.url, status: 'Disconnected' }]);
});
