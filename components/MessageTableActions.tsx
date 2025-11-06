import { Filter, Ban, Pause, Play, OctagonX } from 'lucide-react';
import { Input } from './shadcn/Input';
import { Button } from './shadcn/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shadcn/Select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip';

export type MessageFilterOption = 'all' | 'sent' | 'received';

export type TableActionsProps = {
  searchText: string;
  filterValue: MessageFilterOption;
  isPaused: boolean;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onFilterChange: (value: MessageFilterOption) => void;
  onPauseToggle: () => void;
  onCloseSocketClick: () => void;
};

export function TableActions({
  searchText,
  filterValue,
  isPaused,
  onSearchChange,
  onClear,
  onFilterChange,
  onPauseToggle,
  onCloseSocketClick,
}: TableActionsProps) {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-10 flex items-center gap-1 border-b px-2 py-1 backdrop-blur">
      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-6 w-6"
              onClick={() => onPauseToggle()}
              aria-label={isPaused ? 'Allow non-custom messages' : 'Block non-custom messages'}
            >
              {isPaused ? <Play className="h-4 w-4"></Play> : <Pause className="h-4 w-4"></Pause>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPaused ? 'Allow non-custom messages' : 'Block non-custom messages'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* TODO: accessibility, etc as in the above button */}
      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-6 w-6"
              onClick={() => onCloseSocketClick()}
              aria-label="TODO: Close Socket"
            >
              <OctagonX></OctagonX>
            </Button>
          </TooltipTrigger>
          <TooltipContent>TODO: add content</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-6 w-6"
              onClick={() => onClear()}
              aria-label="Clear messages from table"
            >
              <Ban className="h-4 w-4"></Ban>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear messages from table</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Select value={filterValue} onValueChange={(v) => onFilterChange(v as MessageFilterOption)}>
        <SelectTrigger className="w-26 text-xs" size="sm" aria-label="Filter messages">
          <SelectValue placeholder="All" />
        </SelectTrigger>

        <SelectContent side="bottom">
          <SelectItem className="text-xs" value="all">
            All
          </SelectItem>
          <SelectItem className="text-xs" value="sent">
            Sent
          </SelectItem>
          <SelectItem className="text-xs" value="received">
            Received
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Filter
          className="text-muted-foreground absolute top-2 left-2 h-3.5 w-3.5"
          aria-hidden="true"
        ></Filter>
        <label htmlFor="message-search" className="sr-only">
          Search Messages
        </label>
        <Input
          id="message-search"
          type="search"
          className="h-7 pr-2 pl-7 text-xs leading-none placeholder:text-xs"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Messages"
        ></Input>
      </div>
    </div>
  );
}
