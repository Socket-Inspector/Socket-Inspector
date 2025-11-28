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
import { SocketDetails } from '@/utils/sharedTypes/sharedTypes';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { SocketStatusIcon } from './SocketStatusIcon';
import { BookOpen, Github, X } from 'lucide-react';
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://socketinspector.com/docs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View documentation"
              >
                <BookOpen />
                <span>Docs</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://github.com/Socket-Inspector/Socket-Inspector"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source code on GitHub"
              >
                <Github />
                <span>GitHub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
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
