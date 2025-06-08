
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  postCount: number
}

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <span>Categories</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                />
                <div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    {category.name}
                  </div>
                  {category.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {category.description}
                    </div>
                  )}
                </div>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                {category.postCount}
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
