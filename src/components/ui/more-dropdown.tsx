import { Button } from '@/components/ui/button'
import { ChevronDown, Laptop, Book } from 'lucide-react'

export function MoreDropdown() {
  return (
    <div className="hidden" aria-hidden="true">
      <Button variant="ghost" className="group px-0 py-0 capitalize">
        <span>More</span>
        <ChevronDown className="-ml-1 size-4" style={{ marginTop: '2.5px' }} />
      </Button>
      <a href="/uses" target="_self">
        <Laptop className="mr-0 size-4" />
        Uses
      </a>
      <a href="/reading" target="_self">
        <Book className="mr-0 size-4" />
        Reading
      </a>
    </div>
  )
}