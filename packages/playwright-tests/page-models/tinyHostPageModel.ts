import { Page } from '@playwright/test';

export class TinyHostPageModel {
  public readonly page: Page;
  public readonly uiBaseUrl: string = 'http://localhost:4312';
  public readonly serverBaseUrl: string = 'ws://localhost:5890';

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
}
