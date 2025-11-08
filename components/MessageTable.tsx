import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from './shadcn/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './shadcn/Table';
import { processJsonPayload } from '@/utils/payloadProcessors';
import { SocketMessage } from '@/utils/sharedTypes/sharedTypes';
import { Badge } from './shadcn/Badge';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './shadcn/ContextMenu';
import {
  querySelectedSocketMessages,
  querySelectedSocketDetails,
} from '@/hooks/useSocketState/queries';
import { TableActions, MessageFilterOption } from './MessageTableActions';
import { MessageDirectionIcon } from './MessageDirectionIcon';

const TABLE_HEADER_HEIGHT = 32;
const TABLE_BODY_ROW_HEIGHT = 25;

export function MessageTable() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { socketState, dispatch, sendPacket } = useSocketContext();
  const [searchText, setSearchText] = useState('');
  const [filterValue, setFilterValue] = useState<MessageFilterOption>('all');

  const selectedMessageId = socketState.selectedSocket?.selectedMessageId;

  const selectedSocketDetails = querySelectedSocketDetails(socketState);
  const isPaused = selectedSocketDetails?.isPaused ?? false;
  const selectedSocketId = selectedSocketDetails?.id;

  const selectedSocketMessages = querySelectedSocketMessages(socketState);
  const filteredMessages = selectedSocketMessages
    .filter((message) => message.payload.toLowerCase().includes(searchText.toLowerCase()))
    .filter(
      (message) =>
        filterValue === 'all' ||
        (filterValue === 'received' && message.endpoints.destination === 'client') ||
        (filterValue === 'sent' && message.endpoints.destination === 'server'),
    );

  const rowVirtualizer = useVirtualizer({
    count: filteredMessages.length,
    getScrollElement: () => {
      // If ScrollArea internals change, this selector may break; verify on upgrades.
      return containerRef.current?.querySelector('[data-slot="scroll-area-viewport"]') ?? null;
    },
    paddingStart: TABLE_HEADER_HEIGHT,
    scrollPaddingStart: TABLE_HEADER_HEIGHT,
    estimateSize: () => TABLE_BODY_ROW_HEIGHT,
    overscan: 10,
    getItemKey: (index) => filteredMessages[index].id,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const selectMessage = (messageId: string) => {
    dispatch({
      type: 'SELECT_SOCKET_MESSAGE',
      payload: { selectedMessageId: messageId },
    });
  };

  const selectNextMessage = () => {
    if (filteredMessages.length === 0) {
      return;
    }

    if (!socketState?.selectedSocket?.selectedMessageId) {
      // If no message is selected yet, select the first message
      selectMessage(filteredMessages[0].id);
      return;
    }

    const currentIndex = filteredMessages.findIndex((message) => message.id === selectedMessageId);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= filteredMessages.length) {
      return;
    }

    rowVirtualizer.scrollToIndex(nextIndex);
    selectMessage(filteredMessages[nextIndex].id);
  };

  const selectPreviousMessage = () => {
    if (filteredMessages.length === 0) {
      return;
    }

    if (!socketState?.selectedSocket?.selectedMessageId) {
      return;
    }

    const currentIndex = filteredMessages.findIndex((message) => message.id === selectedMessageId);

    if (currentIndex === -1) {
      return;
    }

    const previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      return;
    }

    rowVirtualizer.scrollToIndex(previousIndex);
    selectMessage(filteredMessages[previousIndex].id);
  };

  const getPayloadPreviewId = (messageId: SocketMessage['id']) => `msg-${messageId}-preview`;

  const getActiveDescendant = () => {
    if (!selectedMessageId || virtualItems.length === 0) {
      return undefined;
    }

    /**
     * The selected index should always be mounted because we
     * scroll the table when a new index is selected. We also
     * clear the selected index when filtering the messages or
     * changing the selected socket.
     *
     * However, we'll be extra-safe and ensure the selected
     * index is mounted.
     */
    const isSelectedIndexMounted = virtualItems.some((item) => {
      const messageId = filteredMessages[item.index].id;
      return messageId === selectedMessageId;
    });

    return isSelectedIndexMounted ? `cell-${selectedMessageId}-c1` : undefined;
  };

  const prefillComposer = (message: SocketMessage) => {
    const validJSON = processJsonPayload(message.payload).success;
    dispatch({
      type: 'PREFILL_MESSAGE_COMPOSER',
      payload: {
        composerPrefill: {
          destination: message.endpoints.destination,
          payloadType: validJSON ? 'json' : 'raw',
          payload: message.payload,
        },
      },
    });
  };

  // scroll table when custom message arrives
  useEffect(() => {
    const unseenCustomMessageId = socketState.selectedSocket?.unseenCustomMessageId;
    if (!unseenCustomMessageId) {
      return;
    }
    const scrollIndex = filteredMessages.findLastIndex((m) => m.id === unseenCustomMessageId);
    if (scrollIndex > -1) {
      rowVirtualizer.scrollToIndex(scrollIndex);
    }
    dispatch({ type: 'CLEAR_UNSEEN_CUSTOM_MESSAGE_ID_ACTION' });
  }, [
    socketState.selectedSocket?.unseenCustomMessageId,
    filteredMessages,
    rowVirtualizer,
    dispatch,
  ]);

  return (
    <main className="flex h-full w-full flex-col" aria-labelledby="websocket-messages-heading">
      <h1 id="websocket-messages-heading" className="sr-only">
        WebSocket Messages
      </h1>
      <TableActions
        searchText={searchText}
        filterValue={filterValue}
        isPaused={isPaused}
        onClear={() => {
          dispatch({ type: 'CLEAR_SELECTED_SOCKET_MESSAGES' });
        }}
        onFilterChange={(value) => {
          setFilterValue(value);
          dispatch({ type: 'CLEAR_SELECTED_MESSAGE_ID' });
        }}
        onSearchChange={(value) => {
          setSearchText(value);
          dispatch({ type: 'CLEAR_SELECTED_MESSAGE_ID' });
        }}
        onPauseToggle={() => {
          if (!selectedSocketId) {
            return;
          }
          if (isPaused) {
            sendPacket({ type: 'ResumeSocketPacket', payload: { socketId: selectedSocketId } });
          } else {
            sendPacket({ type: 'PauseSocketPacket', payload: { socketId: selectedSocketId } });
          }
        }}
      ></TableActions>
      <div ref={containerRef} className="flex min-h-0 w-full flex-1">
        <ScrollArea className="min-h-0 w-full flex-1">
          <Table
            className="table-fixed"
            role="grid"
            tabIndex={0}
            aria-label="Captured Messages"
            aria-colcount={2}
            aria-rowcount={filteredMessages.length + 1}
            aria-multiselectable={false}
            aria-activedescendant={getActiveDescendant()}
            data-testid="message-table"
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectPreviousMessage();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectNextMessage();
              }
            }}
          >
            <TableHeader role="rowgroup">
              <TableRow role="row" aria-rowindex={1}>
                <TableHead role="columnheader" aria-colindex={1} className="h-8 px-2 py-1 text-xs">
                  Data
                </TableHead>
                <TableHead
                  role="columnheader"
                  aria-colindex={2}
                  className="h-8 w-25 px-2 py-1 text-xs"
                >
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody role="rowgroup">
              {/* Top spacer */}
              {virtualItems.length > 0 && (
                <TableRow aria-hidden role="presentation">
                  <TableCell
                    colSpan={2}
                    className="border-0 p-0"
                    style={{
                      height: Math.max(0, virtualItems[0].start - TABLE_HEADER_HEIGHT),
                    }}
                  ></TableCell>
                </TableRow>
              )}

              {/* Virtual rows */}
              {virtualItems.map((virtualRow) => {
                const message = filteredMessages[virtualRow.index];
                return (
                  <ContextMenu key={virtualRow.key}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className="cursor-pointer"
                        id={`row-${message.id}`}
                        role="row"
                        aria-rowindex={virtualRow.index + 2}
                        aria-selected={message.id === selectedMessageId}
                        data-index={virtualRow.index}
                        data-state={message.id === selectedMessageId ? 'selected' : undefined}
                        onClick={() => {
                          selectMessage(message.id);
                        }}
                      >
                        <TableCell
                          id={`cell-${message.id}-c1`}
                          role="gridcell"
                          aria-colindex={1}
                          className="flex items-center space-x-2 px-2 py-1 text-xs"
                        >
                          <MessageDirectionIcon
                            direction={message.endpoints.destination === 'server' ? 'up' : 'down'}
                          ></MessageDirectionIcon>
                          {message.endpoints.source === 'chrome_extension' && (
                            <Badge
                              variant="outline"
                              className="h-[15px] border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-600 dark:bg-orange-950 dark:text-orange-300"
                            >
                              Custom
                            </Badge>
                          )}
                          <span
                            className="min-w-0 flex-1 truncate"
                            id={getPayloadPreviewId(message.id)}
                          >
                            {payloadPreview(message.payload)}
                          </span>
                        </TableCell>
                        <TableCell
                          role="gridcell"
                          aria-colindex={2}
                          className="px-2 py-1 text-xs tabular-nums"
                        >
                          {formatTimestamp(message.timestampISO)}
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onSelect={() => {
                          prefillComposer(message);
                        }}
                      >
                        Copy to Message Composer
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}

              {/* Bottom spacer */}
              {virtualItems.length > 0 && (
                <TableRow aria-hidden role="presentation">
                  <TableCell
                    colSpan={2}
                    className="border-0 p-0"
                    style={{
                      height:
                        rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end,
                    }}
                  ></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </main>
  );
}

function formatTimestamp(timestampISO: string): string {
  const date = new Date(timestampISO);
  return date.toLocaleTimeString(undefined, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

/**
 * This prevents enormous strings from being inserted into
 * the DOM (even if the tailwind truncate class is used,
 * the hidden part of the string will still be stored in
 * the DOM)
 */
function payloadPreview(payload: string): string {
  const PREVIEW_MAX = 4000;
  return payload.length > PREVIEW_MAX ? `${payload.slice(0, PREVIEW_MAX)}…` : payload;
}
