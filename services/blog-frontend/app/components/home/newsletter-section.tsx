
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubscribed(true)
      setEmail('')
      toast.success('Successfully subscribed to our newsletter!')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
        <p className="text-xl text-blue-100">
          You've successfully subscribed to our newsletter. 
          Get ready for amazing content delivered to your inbox!
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <div className="max-w-2xl mx-auto">
        <Mail className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
        
        <h2 className="text-3xl font-bold mb-4">
          Stay Updated with Our Latest Insights
        </h2>
        
        <p className="text-xl text-blue-100 mb-8">
          Join over 10,000 learners who receive our weekly newsletter with 
          expert tips, tutorials, and industry insights.
        </p>

        <form onSubmit={handleSubmit} className="newsletter-form">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="newsletter-form input"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="newsletter-form button"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe Now'}
          </Button>
        </form>

        <p className="text-sm text-blue-200 mt-4">
          No spam, unsubscribe at any time. We respect your privacy.
        </p>

        <div className="flex items-center justify-center space-x-8 mt-8 text-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold">10K+</div>
            <div className="text-sm">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">Weekly</div>
            <div className="text-sm">Updates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">Expert</div>
            <div className="text-sm">Content</div>
          </div>
        </div>
      </div>
    </div>
  )
}
