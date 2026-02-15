import { cn } from '@/utils/cn';
import { RadioGroup, RadioGroupItem } from './shadcn/RadioGroup';
import { Button } from './shadcn/Button';
import { Label } from './shadcn/Label';

export function MessageComposerSocketIO() {
  return (
    <form
      className="@container flex h-full min-h-0 w-full flex-col p-3"
      aria-labelledby="composer-heading"
    >
      <h2 id="composer-heading" className="mb-4 text-base font-semibold">
        Socket.IO Test
      </h2>

      <div className="mb-5 grid grid-cols-1 gap-4 @sm:grid-cols-2">
        <div className="grid gap-2">
          <h3
            id="destination-heading"
            className={cn(
              'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            )}
          >
            Destination
          </h3>
          <RadioGroup
            className="flex flex-row"
            aria-labelledby="destination-heading"
            orientation="horizontal"
            value="client"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem id="radio-destination-client" value="client" />
              <Label htmlFor="radio-destination-client">Client</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem id="radio-destination-server" value="server" />
              <Label htmlFor="radio-destination-server">Server</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <h3
            id="payload-type-heading"
            className={cn(
              'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            )}
          >
            Payload Type
          </h3>
          <RadioGroup
            className="flex flex-row"
            aria-labelledby="payload-type-heading"
            orientation="horizontal"
            value="socket-io"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="socket-io" id="radio-payload-json" />
              <Label htmlFor="radio-payload-json">Socket.IO</Label>
            </div>

            <div className="flex items-center gap-3">
              <RadioGroupItem value="raw" id="radio-payload-raw" />
              <Label htmlFor="radio-payload-raw">Text</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div
        className="border-input dark:bg-input/30 relative max-h-70 min-h-0 w-full min-w-0 flex-1 rounded-md border bg-transparent px-1 py-1 shadow-xs outline-none"
        tabIndex={-1}
      >
        <p>Editor here</p>
      </div>

      <Button
        className="mt-3 cursor-pointer focus-visible:ring-4 focus-visible:ring-offset-2"
        type="submit"
      >
        Send Message
      </Button>
    </form>
  );
}