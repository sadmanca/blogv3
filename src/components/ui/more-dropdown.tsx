import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Laptop, Book } from 'lucide-react'

export function MoreDropdown() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group px-0 py-0 capitalize text-foreground/60 transition-colors hover:text-foreground/80 hover:cursor-pointer"
          title="More"
        >
          <span>More</span>
          <ChevronDown className="size-4 -ml-1" style={{ marginTop: '2.5px' }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        <DropdownMenuItem asChild>
          <a
            href="/uses"
            target="_self"
            className="flex items-center transition-colors duration-300 ease-in-out hover:decoration-foreground hover:cursor-pointer pr-0"
          >
            <Laptop className="mr-0 size-4" />
            Uses
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="/reading"
            target="_self"
            className="flex items-center transition-colors duration-300 ease-in-out hover:decoration-foreground hover:cursor-pointer pr-0"
          >
            <Book className="mr-0 size-4" />
            Reading
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}