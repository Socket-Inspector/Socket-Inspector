import { storage } from '#imports';

export const EXTENSION_ENABLED_KEY = 'local:EXTENSION_ENABLED';

export const getExtensionEnabledStorage = async () => {
  try {
    const extensionEnabled = await storage.getItem<boolean>(EXTENSION_ENABLED_KEY);
    if (extensionEnabled === null) {
      // EXTENSION_ENABLED is not in storage, assume extension is enabled
      return true;
    }
    return extensionEnabled;
  } catch {
    return true;
  }
};

export const setExtensionEnabledStorage = async (extensionEnabled: boolean) => {
  try {
    await storage.setItem(EXTENSION_ENABLED_KEY, extensionEnabled);
  } catch {}
};

export const watchExtensionEnabledStorage = (onChange: (extensionEnabled: boolean) => void) => {
  return storage.watch<boolean>(EXTENSION_ENABLED_KEY, (enabled, _) => {
    if (enabled === null) {
      // EXTENSION_ENABLED is not in storage, assume extension is enabled
      onChange(true);
      return;
    }
    onChange(enabled);
  });
};
