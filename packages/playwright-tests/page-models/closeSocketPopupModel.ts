import { Page } from '@playwright/test';

export class CloseSocketPopupModel {
  public readonly page: Page;
  public readonly devtoolsPanelUrl: string;
  public readonly locators;

  constructor(page: Page, devtoolsPanelUrl: string) {
    this.page = page;
    this.devtoolsPanelUrl = devtoolsPanelUrl;
    this.locators = this.getStaticLocators();
  }

  private getStaticLocators() {
    return {
      header: this.page.getByRole('heading', { name: 'Close Connection' }),
      submitButton: this.page.getByRole('button', { name: 'Send Close Frame' }),
    };
  }
}
