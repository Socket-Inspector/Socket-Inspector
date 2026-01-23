import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures';

export type TableMessage = {
  direction: 'outgoing' | 'incoming';
  text: string;
};

export class DevtoolsPanelModel {
  public readonly page: Page;
  public readonly devtoolsPanelUrl: string;
  public readonly locators;

  constructor(page: Page, devtoolsPanelUrl: string) {
    this.page = page;
    this.devtoolsPanelUrl = devtoolsPanelUrl;
    this.locators = this.getStaticLocators();
  }

  public async loadDevtoolsPanel() {
    await this.page.goto(this.devtoolsPanelUrl);
  }

  public async bringToFront() {
    await this.page.bringToFront();
  }

  public async clearTableMessages() {
    await this.page
      .getByRole('button', {
        name: 'Clear messages from table',
      })
      .click();
  }

  public async togglePauseCapture() {
    const button = this.page.getByRole('button', {
      name: /Allow non-custom messages|Block non-custom messages/,
    });
    const isPaused = (await button.getAttribute('aria-label')) === 'Allow non-custom messages';
    await button.click();

    // Wait for the round-trip to complete (UI updates when SocketDetailsPacket returns)
    const expectedLabel = isPaused ? 'Block non-custom messages' : 'Allow non-custom messages';
    await expect(button).toHaveAttribute('aria-label', expectedLabel);
  }

  public async selectDirectionFilter(filterOption: 'All' | 'Sent' | 'Received') {
    await this.page.getByRole('combobox', { name: 'Filter messages' }).click();
    await this.page.waitForTimeout(50);
    await this.page.getByRole('option', { name: filterOption }).click({ force: true });
  }

  public async enterSearchText(text: string) {
    await this.page.getByRole('searchbox', { name: 'Search Messages' }).click();
    await this.page.getByRole('searchbox', { name: 'Search Messages' }).fill(text);
  }

  public async clearSearchText() {
    await this.enterSearchText('');
  }

  public locateTableMessage({ text, direction }: TableMessage): Locator {
    return this.locators.messageTableLocator.getByRole('row').filter({
      hasText: text,
      has: this.page.getByRole('img', { name: direction }),
    });
  }

  public async assertTableMessages(queries: Array<TableMessage>) {
    // Exclude virtualizer spacer rows (they render with aria-hidden="true")
    const rowLocators = this.locators.messageTableLocator.locator(
      'tbody tr:not([aria-hidden="true"])',
    );

    await expect(rowLocators).toHaveCount(queries.length);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const rowLocator = rowLocators.nth(i);
      const directionLocator = rowLocator.getByRole('img', {
        name: query.direction,
      });

      await expect(rowLocator).toContainText(query.text);
      await expect(directionLocator).toBeVisible();
    }
  }

  public async selectComposerDestination(destination: 'Client' | 'Server') {
    await this.page.getByRole('radio', { name: destination }).click();
  }

  public async selectComposerPayloadType(payloadType: 'JSON' | 'Text') {
    await this.page.getByRole('radio', { name: payloadType }).click();
  }

  public async enterComposerPayload(payload: string) {
    await this.page.getByRole('textbox', { name: 'Payload Editor' }).fill(payload);
  }

  public async clearComposerPayload() {
    await this.enterComposerPayload('');
    const editor = this.page.getByRole('textbox', { name: 'Payload Editor' });
    await editor.focus();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Backspace');
  }

  public async submitComposerMessage() {
    await this.page.getByRole('button', { name: 'Send Message' }).click();
  }

  public async assertComposerError(errorText: string) {
    await expect(
      this.locators.composerErrorLocator.filter({
        hasText: errorText,
      }),
    ).toBeVisible();
  }

  public async assertNoComposerErrors() {
    await expect(this.locators.composerErrorLocator).toHaveText('');
  }

  private getStaticLocators() {
    return {
      noMessagesCapturedText: this.page.getByText('No messages captured', {
        exact: true,
      }),
      selectMessageText: this.page.getByText('Select a message', {
        exact: true,
      }),
      messageComposerHeader: this.page.getByRole('heading', {
        name: 'Compose Message',
      }),
      messageTableLocator: this.page.getByTestId('message-table'),
      clearAllMessagesLocator: this.page.getByRole('button', {
        name: 'Clear all messages',
      }),
      pauseToggleButton: this.page.getByRole('button', {
        name: /Pause Message Capture|Resume Message Capture/,
      }),
      composerErrorLocator: this.page.locator('#composer-error'),
    };
  }
}
