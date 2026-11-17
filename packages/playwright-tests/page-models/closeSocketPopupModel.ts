import { expect, type Page } from '@playwright/test';

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
      closeCodeSelect: popup.getByRole('combobox'),
      reasonInput: popup.getByRole('textbox', { name: 'Close Reason' }),
      submitButton: popup.getByRole('button', { name: 'Close Connection', exact: true }),
    };
  }

  public async selectCloseCode(code: string) {
    await this.locators.closeCodeSelect.click();
    await this.page.getByRole('option', { name: code }).click();
    await expect(this.locators.closeCodeSelect).toContainText(code);
  }

  public async enterCloseReason(reason: string) {
    await this.locators.reasonInput.fill(reason);
  }
}
