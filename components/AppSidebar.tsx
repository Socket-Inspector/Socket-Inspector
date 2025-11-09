import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from './shadcn/Sidebar';
import { SocketDetails } from '@/utils/sharedTypes/sharedTypes';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { SocketStatusIcon } from './SocketStatusIcon';
import { CircleX } from 'lucide-react';
import { Dialog, DialogTrigger } from './shadcn/Dialog';
import { useState } from 'react';
import { CloseSocketForm } from './CloseSocketForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip';

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
    </Sidebar>
  );
}

type SocketConnectionMenuItemProps = {
  socket: SocketDetails;
  onSelect: () => any;
  isSelected: boolean;
};

function SocketConnectionMenuItem({ socket, isSelected, onSelect }: SocketConnectionMenuItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TooltipProvider>
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <SidebarMenuAction className="hover:bg-primary/13 dark:hover:bg-primary/20 data-[state=open]:bg-primary/10 dark:data-[state=open]:bg-primary/13">
                  <CircleX className="h-4 w-4"></CircleX>
                  <span className="sr-only">Close Connection</span>
                </SidebarMenuAction>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Close Connection</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <CloseSocketForm
          socketId={socket.id}
          onSubmit={() => {
            setIsDialogOpen(false);
          }}
        ></CloseSocketForm>
      </Dialog>
    </SidebarMenuItem>
  );
}
