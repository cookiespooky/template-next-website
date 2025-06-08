
import { Metadata } from 'next'
import { blogApi } from '@/lib/api'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedPosts } from '@/components/home/featured-posts'
import { RecentPosts } from '@/components/home/recent-posts'
import { PopularPosts } from '@/components/home/popular-posts'
import { CategoriesSection } from '@/components/home/categories-section'
import { NewsletterSection } from '@/components/home/newsletter-section'

export const metadata: Metadata = {
  title: 'Course Platform Blog - Latest Insights and Tutorials',
  description: 'Discover the latest insights, tutorials, and industry trends in online education. Learn from experts and stay ahead in your learning journey.',
  openGraph: {
    title: 'Course Platform Blog - Latest Insights and Tutorials',
    description: 'Discover the latest insights, tutorials, and industry trends in online education.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Course Platform Blog - Latest Insights and Tutorials',
    description: 'Discover the latest insights, tutorials, and industry trends in online education.',
  },
}

async function getFeaturedPosts() {
  try {
    const response = await blogApi.get('/public/posts?featured=true&limit=3')
    return response.data.data.posts
  } catch (error) {
    console.error('Failed to fetch featured posts:', error)
    return []
  }
}

async function getRecentPosts() {
  try {
    const response = await blogApi.get('/public/recent?limit=6')
    return response.data.data
  } catch (error) {
    console.error('Failed to fetch recent posts:', error)
    return []
  }
}

async function getPopularPosts() {
  try {
    const response = await blogApi.get('/public/popular?limit=5')
    return response.data.data
  } catch (error) {
    console.error('Failed to fetch popular posts:', error)
    return []
  }
}

async function getCategories() {
  try {
    const response = await blogApi.get('/public/categories')
    return response.data.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}

export default async function HomePage() {
  const [featuredPosts, recentPosts, popularPosts, categories] = await Promise.all([
    getFeaturedPosts(),
    getRecentPosts(),
    getPopularPosts(),
    getCategories(),
  ])

  return (
    <>
      <HeroSection />
      
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <FeaturedPosts posts={featuredPosts} />
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <RecentPosts posts={recentPosts} />
            </div>
            <div className="space-y-8">
              <PopularPosts posts={popularPosts} />
              <CategoriesSection categories={categories} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <NewsletterSection />
        </div>
      </section>
    </>
  )
}
