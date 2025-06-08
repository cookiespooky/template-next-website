
'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BookOpen, 
  FolderOpen, 
  Users, 
  Tags, 
  Settings, 
  BarChart3,
  Upload,
  X,
  Home,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Courses',
    href: '/dashboard/courses',
    icon: BookOpen,
  },
  {
    name: 'Categories',
    href: '/dashboard/categories',
    icon: FolderOpen,
  },
  {
    name: 'Instructors',
    href: '/dashboard/instructors',
    icon: Users,
  },
  {
    name: 'Tags',
    href: '/dashboard/tags',
    icon: Tags,
  },
  {
    name: 'Media',
    href: '/dashboard/media',
    icon: Upload,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "admin-sidebar",
        open && "open"
      )}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary"
                  )}
                  asChild
                >
                  <Link href={item.href} onClick={onClose}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            Course Platform Admin v1.0
          </div>
        </div>
      </div>
    </>
  )
}
