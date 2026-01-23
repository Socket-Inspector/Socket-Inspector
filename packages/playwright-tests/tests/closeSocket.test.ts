import { test } from '../fixtures';
import { CloseSocketPopupModel } from '../page-models/closeSocketPopupModel';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { SidebarPageModel } from '../page-models/sidebarPageModel';
import { HostPageModel } from '../page-models/hostPageModel';
import { assertVisible } from '../playwrightHelpers';

test('it can select an open socket from the sidebar', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const sidebarPageModel = new SidebarPageModel(page, devtoolsPanelUrl);
  const closeSocketModel = new CloseSocketPopupModel(page, devtoolsPanelUrl);
  
  await devtoolsPanelModel.loadDevtoolsPanel();
  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();

  await sidebarPageModel.clickSocketCloseButton();
  await assertVisible(closeSocketModel.locators.header);

  await sidebarPageModel.assertSidebarSockets([
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Connected',
    },
  ]);
  await hostPageModel.assertReadyState('OPEN');

  await closeSocketModel.locators.submitButton.click();

  await hostPageModel.assertReadyState('CLOSED');
  await sidebarPageModel.assertSidebarSockets([
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Disconnected',
    },
  ]);
});
