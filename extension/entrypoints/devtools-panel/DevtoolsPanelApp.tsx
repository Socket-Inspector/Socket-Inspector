import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/shadcn/Sidebar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/Resizable';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { EmptySocketSelection } from '@/components/EmptySocketSelection';
import { MessageTable } from '@/components/MessageTable';
import { MessageDetail } from '@/components/MessageDetail';
import { MessageComposer } from '@/components/MessageComposer';

export default function DevtoolsPanelApp() {
  const breakpoint = useBreakpoint();
  const layout: AppPanelsProps['layout'] = ['lg', 'xl', '2xl'].includes(breakpoint)
    ? 'three_column'
    : 'two_column';

  const sidebarStyle = {
    '--sidebar-width': '100%',
    '--sidebar-width-mobile': '100%',
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="h-screen w-screen">
        <AppPanels layout={layout}></AppPanels>
      </div>
    </SidebarProvider>
  );
}

type AppPanelsProps = {
  layout: 'two_column' | 'three_column';
};
function AppPanels({ layout }: AppPanelsProps) {
  const { socketState } = useSocketContext();

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel id="sidebar-panel" order={1} defaultSize={20} minSize={2}>
        <AppSidebar></AppSidebar>
      </ResizablePanel>
      <ResizableHandle></ResizableHandle>
      {socketState.selectedSocket ? (
        <>
          <ResizablePanel
            id="content-panel"
            order={2}
            defaultSize={layout === 'three_column' ? 50 : 80}
            minSize={2}
          >
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                id="table-panel"
                order={1}
                defaultSize={layout === 'three_column' ? 70 : 43}
                minSize={2}
              >
                <MessageTable></MessageTable>
              </ResizablePanel>
              <ResizableHandle></ResizableHandle>
              <ResizablePanel
                id="detail-panel"
                order={2}
                defaultSize={layout === 'three_column' ? 30 : 14}
                minSize={2}
              >
                <MessageDetail></MessageDetail>
              </ResizablePanel>
              {layout === 'two_column' && (
                <>
                  <ResizableHandle></ResizableHandle>
                  <ResizablePanel id="composer-panel-bottom" order={3} defaultSize={43} minSize={2}>
                    <MessageComposer></MessageComposer>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
          {layout === 'three_column' && (
            <>
              <ResizableHandle></ResizableHandle>
              <ResizablePanel id="composer-panel-right" order={3} defaultSize={30} minSize={2}>
                <MessageComposer></MessageComposer>
              </ResizablePanel>
            </>
          )}
        </>
      ) : (
        <ResizablePanel id="content-panel" order={2} defaultSize={80} minSize={2}>
          <EmptySocketSelection hasSockets={socketState.sockets.length > 0}></EmptySocketSelection>
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
