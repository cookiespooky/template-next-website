
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Star, 
  ShoppingCart, 
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { Course } from '@/lib/types';
import { 
  formatPrice, 
  getCourseFormatLabel, 
  getCourseLevelLabel,
  getCourseTypeLabel,
  calculateDiscount 
} from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  showAddToCart?: boolean;
}

export function CourseCard({ course, showAddToCart = true }: CourseCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, state } = useCart();
  const { toast } = useToast();

  const isInCart = state.items.some(item => item.course.id === course.id);
  const discount = course.oldPrice && course.price 
    ? calculateDiscount(course.oldPrice, course.price) 
    : 0;

  const handleAddToCart = async () => {
    if (isInCart) {
      toast({
        title: "Курс уже в корзине",
        description: "Этот курс уже добавлен в вашу корзину",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      addToCart(course);
      toast({
        title: "Курс добавлен в корзину",
        description: `"${course.title}" добавлен в корзину`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить курс в корзину",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
        <CardHeader className="p-0">
          <div className="relative aspect-video bg-muted overflow-hidden">
            <Image
              src={course.imageUrl || "https://images.idgesg.net/images/article/2018/05/book-laptop_combination_online_learning_virtual_repository_digital_library_by_bet_noire_gettyimages_1200x800-100757560-large.jpg"}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {course.isPopular && (
                <Badge variant="destructive" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Популярный
                </Badge>
              )}
              {course.isFeatured && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Рекомендуем
                </Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Course Type */}
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                {getCourseTypeLabel(course.type)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1">
          <div className="space-y-3">
            {/* Category */}
            {course.category && (
              <Badge variant="outline" className="text-xs">
                {course.category.name}
              </Badge>
            )}

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              <Link href={`/courses/${course.slug}`}>
                {course.title}
              </Link>
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.shortDescription || course.description}
            </p>

            {/* Course Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                {course.hoursInt && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.hoursInt} ч.</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{getCourseFormatLabel(course.format)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>{getCourseLevelLabel(course.level)}</span>
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-3 h-3" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {course.instructor.name}
                </span>
              </div>
            )}

            {/* Features */}
            {course.features && course.features.length > 0 && (
              <div className="space-y-1">
                {course.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
                {course.features.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{course.features.length - 2} дополнительных возможностей
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full space-y-3">
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {course.price ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">
                      {formatPrice(course.price)}
                    </span>
                    {course.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(course.oldPrice)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-lg font-bold text-green-600">
                    Бесплатно
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/courses/${course.slug}`}>
                  Подробнее
                </Link>
              </Button>
              
              {showAddToCart && course.price && (
                <Button 
                  onClick={handleAddToCart}
                  disabled={isLoading || isInCart}
                  size="sm"
                  className="flex-1"
                >
                  {isLoading ? (
                    "Добавление..."
                  ) : isInCart ? (
                    "В корзине"
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      В корзину
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
