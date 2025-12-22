import { Locator } from '@playwright/test';
import { expect } from './fixtures';

export async function assertVisible(locator: Locator) {
  await expect(locator).toBeVisible();
}

export async function assertNotVisible(locator: Locator) {
  await expect(locator).not.toBeVisible();
}
