import { browser } from '#imports';
import { AppIcon } from '@/components/SocketInspectorIcon';
import { Separator } from '@/components/shadcn/Separator';
import { ExternalLinkFooter } from '@/components/ExternalLinkFooter';

import { createLogger } from '@/utils/customLogger.ts';
const logger = createLogger('POPUP');

const extensionId = browser.runtime.id;

export default function App() {
  return (
    <main className="flex w-[250px] flex-col items-center p-4">
      <div className="ml-2 flex items-center gap-2 self-start">
        <AppIcon className="h-9 w-9"></AppIcon>
        <h1 className="text-base font-semibold">Socket Inspector</h1>
      </div>
      <div className="mt-2 flex w-full flex-col items-center">
        <p className="text-muted-foreground mt-2 text-center text-xs">
          To use Socket Inspector, open Chrome DevTools and look for the Socket Inspector tab
        </p>
      </div>
      <Separator className="my-3" />
      <ExternalLinkFooter></ExternalLinkFooter>
    </main>
  );
}
