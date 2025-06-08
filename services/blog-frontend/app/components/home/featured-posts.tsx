
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImageUrl?: string
  featuredImageAlt?: string
  readingTime?: number
  publishedAt: string
  author: {
    firstName: string
    lastName: string
    avatarUrl?: string
  }
  category?: {
    name: string
    slug: string
    color?: string
  }
  tags: Array<{
    tag: {
      name: string
      slug: string
      color?: string
    }
  }>
}

interface FeaturedPostsProps {
  posts: Post[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Featured Articles</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Hand-picked articles from our expert contributors covering the latest trends and insights
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <Card key={post.id} className={`card-hover ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
            <Link href={`/posts/${post.slug}`}>
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                {post.featuredImageUrl ? (
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.featuredImageAlt || post.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="text-4xl font-bold text-primary/30">
                      {post.title.charAt(0)}
                    </div>
                  </div>
                )}
                
                {post.category && (
                  <div className="absolute top-4 left-4">
                    <Badge 
                      className="category-badge"
                      style={{ 
                        backgroundColor: post.category.color || '#3b82f6',
                        color: 'white'
                      }}
                    >
                      {post.category.name}
                    </Badge>
                  </div>
                )}
              </div>
            </Link>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Link href={`/posts/${post.slug}`}>
                    <h3 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground mt-2 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{post.author.firstName} {post.author.lastName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {post.readingTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readingTime} min read</span>
                      </div>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map(({ tag }) => (
                      <Link key={tag.slug} href={`/tags/${tag.slug}`}>
                        <Badge 
                          variant="secondary" 
                          className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
