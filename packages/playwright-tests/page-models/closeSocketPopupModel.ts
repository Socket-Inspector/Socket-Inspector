import type { Page } from '@playwright/test';

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
    const popup = this.page.getByRole('dialog', { name: 'Close Connection' });
    return {
      header: popup.getByRole('heading', { name: 'Close Connection' }),
      submitButton: popup.getByRole('button', { name: 'Close Connection', exact: true }),
    };
  }
}
