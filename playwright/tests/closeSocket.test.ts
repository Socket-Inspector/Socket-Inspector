import { test } from '../fixtures';
import { CloseSocketPopupModel } from '../page-models/closeSocketPopupModel';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { HostPageModel } from '../page-models/hostPageModel';
import { assertVisible } from '../playwrightHelpers';

test('it can select an open socket from the sidebar', async ({
  page,
  context,
  devtoolsPanelUrl,
}) => {
  const devtoolsPanelModel = new DevtoolsPanelModel(page, devtoolsPanelUrl);
  const closeSocketModel = new CloseSocketPopupModel(page, devtoolsPanelUrl);
  await devtoolsPanelModel.loadDevtoolsPanel();
  const hostPage = await context.newPage();
  const hostPageModel = new HostPageModel(hostPage);
  await hostPageModel.navigateToHostPage();

  await devtoolsPanelModel.bringToFront();

  await devtoolsPanelModel.clickSocketCloseButton();
  await assertVisible(closeSocketModel.locators.header);

  await devtoolsPanelModel.assertSidebarSockets([
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Connected',
    },
  ]);
  await hostPageModel.assertReadyState('OPEN');

  await closeSocketModel.locators.submitButton.click();

  await hostPageModel.assertReadyState('CLOSED');
  await devtoolsPanelModel.assertSidebarSockets([
    {
      url: hostPageModel.serverBaseUrl,
      status: 'Disconnected',
    },
  ]);
});
