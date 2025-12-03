import { useEffect, useState } from 'react';
import { Label } from '@/components/shadcn/Label';
import { Switch } from '@/components/shadcn/Switch';
import { AppIcon } from '@/components/SocketInspectorIcon';
import {
  getExtensionEnabledStorage,
  setExtensionEnabledStorage,
  watchExtensionEnabledStorage,
} from '@/utils/storageHelpers';
import { Separator } from '@/components/shadcn/Separator';
import { Button } from '@/components/shadcn/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/Tooltip';
import { BookOpen, CircleHelp, Heart } from 'lucide-react';

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
      <Separator className="my-3" />
      <PopupFooter />
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

function PopupFooter() {
  return (
    <div className="flex items-center justify-center gap-1">
      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <a
                href="https://socketinspector.com/docs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View documentation"
              >
                <BookOpen className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Docs</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <a
                href="https://github.com/Socket-Inspector/Socket-Inspector#support"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get support or report issues"
              >
                <CircleHelp className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Support</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <a
                href="https://chromewebstore.google.com/detail/socket-inspector/kecipkncnnofappfmapgmfailmnbaoaf/reviews"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Rate this extension"
              >
                <Heart className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rate Extension</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
