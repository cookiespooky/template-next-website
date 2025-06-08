
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, User, ArrowRight } from 'lucide-react'
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
  }
}

interface RecentPostsProps {
  posts: Post[]
}

export function RecentPosts({ posts }: RecentPostsProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Recent Articles</h2>
        <p className="text-muted-foreground">No articles available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Recent Articles</h2>
          <p className="text-muted-foreground">
            Stay up to date with our latest insights and tutorials
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/posts">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {posts.map((post, index) => (
          <Card key={post.id} className="card-hover">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <Link href={`/posts/${post.slug}`}>
                    <div className="relative aspect-video md:aspect-square overflow-hidden rounded-l-lg">
                      {post.featuredImageUrl ? (
                        <Image
                          src={post.featuredImageUrl}
                          alt={post.featuredImageAlt || post.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <div className="text-2xl font-bold text-primary/30">
                            {post.title.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                <div className="md:w-2/3 p-6">
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

                    <div className="flex items-center justify-between">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/posts/${post.slug}`}>
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
