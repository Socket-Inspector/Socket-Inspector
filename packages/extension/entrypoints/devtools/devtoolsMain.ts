import { browser } from '#imports';
import { getExtensionEnabledStorage } from '@/utils/storageHelpers';

getExtensionEnabledStorage()
  .then((extensionEnabled) => {
    if (extensionEnabled) {
      browser.devtools.panels.create('Socket Inspector', '', 'devtools-panel.html');
    }
  })
  .catch(() => {});
