import { test } from '../fixtures';
import { DevtoolsPanelModel } from '../page-models/devtoolsPanelModel';
import { HostPageModel } from '../page-models/hostPageModel';

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

  await devtoolsPanelModel.clickSocketCloseButton();
});
