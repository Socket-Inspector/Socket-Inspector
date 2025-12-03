import { Button } from './shadcn/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip';
import { BookOpen, CircleHelp, Heart } from 'lucide-react';

export function ExternalLinkFooter() {
  return (
    <>
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
    </>
  );
}
