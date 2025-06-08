
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { state, removeFromCart, updateQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (courseId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(courseId);
    } else {
      updateQuantity(courseId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsLoading(true);
    // Redirect to checkout page
    window.location.href = '/checkout';
  };

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-muted rounded-full">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-muted-foreground mb-8">
            Добавьте курсы в корзину, чтобы продолжить обучение
          </p>
          <Button asChild>
            <Link href="/courses">
              Перейти к курсам
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          Корзина
        </h1>
        <p className="text-muted-foreground">
          {state.items.length} {state.items.length === 1 ? 'курс' : 'курсов'} в корзине
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item, index) => (
            <motion.div
              key={item.course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Course Image */}
                    <div className="relative w-full md:w-48 aspect-video bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.course.imageUrl || "/placeholder-course.jpg"}
                        alt={item.course.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">
                        <Link 
                          href={`/courses/${item.course.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.course.title}
                        </Link>
                      </h3>
                      
                      {item.course.category && (
                        <p className="text-sm text-muted-foreground">
                          {item.course.category.name}
                        </p>
                      )}

                      {item.course.shortDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.course.shortDescription}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.course.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.course.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatPrice((item.course.price || 0) * item.quantity)}
                            </div>
                            {item.course.oldPrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.course.oldPrice * item.quantity)}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.course.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Итого</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {state.items.map((item) => (
                  <div key={item.course.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2">
                      {item.course.title} × {item.quantity}
                    </span>
                    <span>{formatPrice((item.course.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Общая сумма:</span>
                  <span>{formatPrice(state.total)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Переход к оплате...' : 'Перейти к оплате'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center">
                <Link 
                  href="/courses"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Продолжить покупки
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
