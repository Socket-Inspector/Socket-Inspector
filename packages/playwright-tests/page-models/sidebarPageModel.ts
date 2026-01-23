import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures';

export type SidebarSocket = {
  url: string;
  status: 'Connecting' | 'Connected' | 'Disconnected';
};

export class SidebarPageModel {
  public readonly page: Page;
  public readonly devtoolsPanelUrl: string;
  public readonly locators;

  constructor(page: Page, devtoolsPanelUrl: string) {
    this.page = page;
    this.devtoolsPanelUrl = devtoolsPanelUrl;
    this.locators = this.getStaticLocators();
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
    };
  }
}
