import { useEffect, useState } from 'react';
import { Label } from '@/components/shadcn/Label';
import { Switch } from '@/components/shadcn/Switch';
import { AppIcon } from '@/components/SocketInspectorIcon';
import {
  getExtensionEnabledStorage,
  setExtensionEnabledStorage,
  watchExtensionEnabledStorage,
} from '@/utils/storageHelpers';

type ExtensionEnabledResult =
  | {
      loaded: false;
      value: null;
    }
  | {
      loaded: true;
      value: boolean;
    };

export default function App() {
  const [extensionEnabledResult, setExtensionEnabledResult] = useState<ExtensionEnabledResult>({
    loaded: false,
    value: null,
  });

  useEffect(() => {
    const onMount = async () => {
      try {
        const extensionEnabled = await getExtensionEnabledStorage();
        setExtensionEnabledResult({
          loaded: true,
          value: extensionEnabled,
        });
      } catch {}
    };

    onMount();
  }, []);

  return (
    <main className="flex w-[250px] flex-col items-center p-4">
      <div className="ml-2 flex items-center gap-2 self-start">
        <AppIcon className="h-9 w-9"></AppIcon>
        <h1 className="text-base font-semibold">Socket Inspector</h1>
      </div>
      {extensionEnabledResult.loaded && (
        <PopupContents extensionEnabledInitialValue={extensionEnabledResult.value}></PopupContents>
      )}
    </main>
  );
}

type PopupContentsProps = {
  extensionEnabledInitialValue: boolean;
};
export function PopupContents({ extensionEnabledInitialValue }: PopupContentsProps) {
  const [extensionEnabled, setExtensionEnabled] = useState(extensionEnabledInitialValue);

  useEffect(() => {
    const unwatch = watchExtensionEnabledStorage((enabled) => {
      setExtensionEnabled(enabled);
    });

    return () => {
      unwatch();
    };
  }, [extensionEnabledInitialValue]);

  return (
    <div className="mt-5 flex w-full flex-col items-center">
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="enable-switch" className="text-sm">
          {extensionEnabled ? 'Enabled' : 'Disabled'}
        </Label>
        <Switch
          id="enable-switch"
          checked={extensionEnabled}
          className="scale-125 cursor-pointer data-[state=checked]:bg-green-500"
          onCheckedChange={async (checked) => {
            setExtensionEnabledStorage(checked);
          }}
        ></Switch>
      </div>
      <p className="text-muted-foreground mt-2 text-center text-xs">
        To use this extension, open the DevTools and look for the Socket Inspector tab
      </p>
    </div>
  );
}
