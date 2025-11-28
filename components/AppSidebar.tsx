import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from './shadcn/Sidebar';
import { Button } from './shadcn/Button';
import { SocketDetails } from '@/utils/sharedTypes/sharedTypes';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { SocketStatusIcon } from './SocketStatusIcon';
import { BookOpen, CircleHelp, Github, Star, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './shadcn/Popover';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip';
import { CloseSocketForm } from './CloseSocketForm';

export function AppSidebar() {
  const { socketState, dispatch } = useSocketContext();

  return (
    <Sidebar collapsible="none">
      <SidebarContent role="navigation" aria-labelledby="ws-heading">
        <SidebarGroup>
          <SidebarGroupLabel>
            <h2 id="ws-heading">WebSocket Connections</h2>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socketState.sockets.map((socket) => (
                <SocketConnectionMenuItem
                  key={socket.id}
                  socket={socket}
                  isSelected={socket.id === socketState.selectedSocket?.id}
                  onSelect={() => {
                    dispatch({
                      type: 'SELECT_SOCKET',
                      payload: { selectedSocketId: socket.id },
                    });
                  }}
                ></SocketConnectionMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <AppSidebarFooter />
    </Sidebar>
  );
}

function AppSidebarFooter() {
  return (
    <SidebarFooter className="flex-row">
      <div className="flex items-center gap-1">
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
                  href="https://github.com/Socket-Inspector/Socket-Inspector"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source code on GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Source Code</TooltipContent>
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
                  <Star className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rate Extension</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SidebarFooter>
  );
}

type SocketConnectionMenuItemProps = {
  socket: SocketDetails;
  onSelect: () => any;
  isSelected: boolean;
};

function SocketConnectionMenuItem({ socket, isSelected, onSelect }: SocketConnectionMenuItemProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isSelected}
        onClick={() => {
          onSelect();
        }}
      >
        <SocketStatusIcon socketStatus={socket.status}></SocketStatusIcon>
        <span>{socket.url}</span>
      </SidebarMenuButton>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipProvider>
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <SidebarMenuAction className="hover:bg-primary/13 dark:hover:bg-primary/20 data-[state=open]:bg-primary/10 dark:data-[state=open]:bg-primary/13">
                  <X className="h-4 w-4"></X>
                  <span className="sr-only">Close Connection</span>
                </SidebarMenuAction>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Close Connection</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent side="right" align="start" className="w-72">
          <CloseSocketForm
            socketId={socket.id}
            onSubmit={() => {
              setIsPopoverOpen(false);
            }}
          ></CloseSocketForm>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  );
}
