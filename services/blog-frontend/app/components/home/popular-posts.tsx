
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Eye, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  id: string
  title: string
  slug: string
  viewCount: number
  readingTime?: number
  publishedAt: string
  author: {
    firstName: string
    lastName: string
  }
}

interface PopularPostsProps {
  posts: Post[]
}

export function PopularPosts({ posts }: PopularPostsProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Popular Articles</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post, index) => (
          <div key={post.id} className="flex items-start space-x-3 group">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <Link href={`/posts/${post.slug}`}>
                <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
              </Link>
              
              <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.viewCount.toLocaleString()}</span>
                </div>
                
                {post.readingTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readingTime}m</span>
                  </div>
                )}
                
                <span>
                  {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
