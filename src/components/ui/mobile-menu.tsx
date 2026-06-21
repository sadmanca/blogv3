import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NAV_LINKS } from '@/consts'
import { Menu } from 'lucide-react'

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={(val: boolean) => setIsOpen(val)}>
      <DropdownMenuTrigger
        asChild
        onClick={() => {
          setIsOpen((val) => !val)
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-8 sm:hidden"
          title="Menu"
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        {NAV_LINKS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <a
              href={item.href}
              className="w-full text-lg font-medium capitalize"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MobileMenu
