import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './shadcn/Sidebar';
import { SocketDetails } from '@/utils/sharedTypes/sharedTypes';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { SocketStatusIcon } from './SocketStatusIcon';

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
    </SidebarMenuItem>
  );
}
