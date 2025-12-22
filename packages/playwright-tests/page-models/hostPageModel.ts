import { Page } from '@playwright/test';
import { expect } from '../fixtures';

export class HostPageModel {
  public readonly page: Page;
  public readonly uiBaseUrl: string = 'http://localhost:4173';
  public readonly serverBaseUrl: string = 'ws://localhost:6844';

  constructor(page: Page) {
    this.page = page;
  }
  async bringToFront() {
    await this.page.bringToFront();
  }
  async navigateToHostPage() {
    await this.page.goto(this.uiBaseUrl);
  }
  public async refreshPage() {
    await this.page.reload();
  }
  public async assertReadyState(readyState: string) {
    const readyStateDisplay = this.page.getByTestId('ready-state-display');
    await expect(readyStateDisplay).toHaveText(readyState);
  }
  public async disconnectClient() {
    await this.page.getByRole('button', { name: 'Trigger Client Disconnect' }).click();
  }
  public async disconnectServer() {
    await this.page.getByRole('button', { name: 'Trigger Server Disconnect' }).click();
  }
  public async reconnectToServer() {
    await this.page.getByRole('button', { name: 'Reconnect to server' }).click();
  }
  public async typeEchoMessage(message: string) {
    await this.page.getByTestId('echo-input').click();
    await this.page.getByTestId('echo-input').fill(message);
  }
  public async submitEchoMessage() {
    await this.page.getByRole('button', { name: 'Send Echo Message' }).click();
  }
  public async sendEchoMessage(message: string) {
    await this.typeEchoMessage(message);
    await this.submitEchoMessage();
  }
  public async assertEchoResponse(echoResponse: string) {
    const echoResponseDisplay = this.page.getByTestId('echo-response-display');
    await expect(echoResponseDisplay).toHaveText(echoResponse);
  }
}
