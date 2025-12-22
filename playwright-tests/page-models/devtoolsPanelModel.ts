import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures';

export type SidebarSocket = {
  url: string;
  status: 'Connecting' | 'Connected' | 'Disconnected';
};

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

  public locateSocketLink(socket: SidebarSocket, index: number = 0): Locator {
    return this.locators.sidebarNav
      .getByRole('button', {
        name: socket.url,
      })
      .filter({
        has: this.page.getByRole('img', { name: socket.status }),
      })
      .nth(index);
  }

  public async clickSocketLink(socket: SidebarSocket, index: number = 0) {
    const locator = this.locateSocketLink(socket, index);
    await locator.click();
  }

  public async assertSidebarSockets(queries: Array<SidebarSocket>) {
    const linkLocators = this.locators.sidebarNav
      .getByRole('button')
      .filter({ has: this.page.getByRole('img', { name: /Connecting|Connected|Disconnected/ }) });

    await expect(linkLocators).toHaveCount(queries.length);

    for (let i = 0; i < queries.length; i++) {
      const { url, status } = queries[i];
      const linkLocator = linkLocators.nth(i);

      await expect(linkLocator, `Sidebar socket #${i + 1} should have url: "${url}"`).toContainText(
        url,
      );

      await expect(
        linkLocator.getByRole('img', { name: status, exact: true }),
        `Sidebar socket #${i + 1} should show status "${status}"`,
      ).toBeVisible();
    }
  }

  public async clickSocketCloseButton(index: number = 0) {
    await this.page.getByRole('button', { name: 'Close Connection' }).nth(index).click();
  }

  public async clearTableMessages() {
    await this.page
      .getByRole('button', {
        name: 'Clear messages from table',
      })
      .click();
  }

  public async togglePauseCapture() {
    await this.page
      .getByRole('button', {
        name: /Allow non-custom messages|Block non-custom messages/,
      })
      .click();
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
      sidebarHeader: this.page.getByText('WebSocket Connections', {
        exact: true,
      }),
      sidebarNav: this.page.getByRole('navigation', {
        name: 'WebSocket Connections',
      }),
      noWebsocketsText: this.page.getByText('Currently recording WebSocket activity', {
        exact: true,
      }),
      selectWebsocketText: this.page.getByText('Select a WebSocket', {
        exact: true,
      }),
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
