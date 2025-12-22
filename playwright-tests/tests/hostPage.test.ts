import { test } from '../fixtures';
import { HostPageModel } from '../page-models/hostPageModel';

test('Can send an echo message', async ({ page }) => {
  const hostPageModel = new HostPageModel(page);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.assertReadyState('OPEN');
  await hostPageModel.sendEchoMessage('HI');
  await hostPageModel.assertEchoResponse('HI');
  await hostPageModel.assertReadyState('OPEN');
});

test('Renders the most recent echo message', async ({ page }) => {
  const hostPageModel = new HostPageModel(page);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.assertReadyState('OPEN');
  await hostPageModel.sendEchoMessage('1');
  await hostPageModel.assertEchoResponse('1');
  await hostPageModel.sendEchoMessage('2');
  await hostPageModel.assertEchoResponse('2');
  await hostPageModel.assertReadyState('OPEN');
});

test('Can disconnect from the client side', async ({ page }) => {
  const hostPageModel = new HostPageModel(page);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.assertReadyState('OPEN');
  await hostPageModel.disconnectClient();
  await hostPageModel.assertReadyState('CLOSED');
  await hostPageModel.reconnectToServer();
  await hostPageModel.assertReadyState('OPEN');
});

test('Can disconnect from the server side', async ({ page }) => {
  const hostPageModel = new HostPageModel(page);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.assertReadyState('OPEN');
  await hostPageModel.disconnectServer();
  await hostPageModel.assertReadyState('CLOSED');
  await hostPageModel.reconnectToServer();
  await hostPageModel.assertReadyState('OPEN');
});

test('Can send an echo message after reconnecting', async ({ page }) => {
  const hostPageModel = new HostPageModel(page);
  await hostPageModel.navigateToHostPage();
  await hostPageModel.assertReadyState('OPEN');
  await hostPageModel.disconnectClient();
  await hostPageModel.reconnectToServer();
  await hostPageModel.sendEchoMessage('A Great Message');
});
