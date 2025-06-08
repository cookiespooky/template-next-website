
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Star, 
  ShoppingCart, 
  BookOpen,
  Award,
  CheckCircle,
  Calendar,
  FileText,
  Play
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, state } = useCart();
  const { toast } = useToast();

  const isInCart = course ? state.items.some(item => item.course.id === course.id) : false;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data.course);
        } else {
          console.error('Course not found');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!course || isInCart) return;

    setIsAddingToCart(true);
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
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Курс не найден</h1>
          <p className="text-muted-foreground">Запрашиваемый курс не существует или был удален.</p>
        </div>
      </div>
    );
  }

  const discount = course.oldPrice && course.price 
    ? calculateDiscount(course.oldPrice, course.price) 
    : 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              {course.category && (
                <Badge variant="outline">{course.category.name}</Badge>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold">{course.title}</h1>
              <p className="text-xl text-muted-foreground">{course.shortDescription}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {course.instructor && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{course.instructor.name}</span>
                  </div>
                )}
                {course.hoursInt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.hoursInt} часов</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{getCourseFormatLabel(course.format)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>{getCourseLevelLabel(course.level)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Course Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative aspect-video bg-muted rounded-lg overflow-hidden"
          >
            <Image
              src={course.imageUrl || "/placeholder-course.jpg"}
              alt={course.title}
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Описание курса</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
                
                {course.for_whom && (
                  <div>
                    <h4 className="font-semibold mb-2">Для кого предназначен курс:</h4>
                    <p className="text-muted-foreground">{course.for_whom}</p>
                  </div>
                )}

                {course.for_whom_detailed && (
                  <div>
                    <h4 className="font-semibold mb-2">Подробнее о целевой аудитории:</h4>
                    <p className="text-muted-foreground">{course.for_whom_detailed}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          {course.features && course.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Что включено в курс</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reviews */}
          {course.reviews && course.reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Отзывы студентов</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.user?.name}</span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div className="text-center space-y-2">
                  {course.price ? (
                    <div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold">
                          {formatPrice(course.price)}
                        </span>
                        {course.oldPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            {formatPrice(course.oldPrice)}
                          </span>
                        )}
                      </div>
                      {discount > 0 && (
                        <Badge variant="destructive" className="text-sm">
                          Скидка {discount}%
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-green-600">
                      Бесплатно
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                {course.price && (
                  <Button 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isInCart}
                    className="w-full"
                    size="lg"
                  >
                    {isAddingToCart ? (
                      "Добавление..."
                    ) : isInCart ? (
                      "В корзине"
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Добавить в корзину
                      </>
                    )}
                  </Button>
                )}

                {/* Course Info */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Тип курса:</span>
                    <span className="text-sm font-medium">{getCourseTypeLabel(course.type)}</span>
                  </div>
                  
                  {course.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Длительность:</span>
                      <span className="text-sm font-medium">{course.duration}</span>
                    </div>
                  )}
                  
                  {course.hours && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Академических часов:</span>
                      <span className="text-sm font-medium">{course.hours}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Формат:</span>
                    <span className="text-sm font-medium">{getCourseFormatLabel(course.format)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Уровень:</span>
                    <span className="text-sm font-medium">{getCourseLevelLabel(course.level)}</span>
                  </div>
                </div>

                {/* Certificate Info */}
                {course.certificate && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Документ об образовании</h4>
                        <p className="text-sm text-muted-foreground">{course.certificate}</p>
                        {course.doc_expire && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Срок действия: {course.doc_expire}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructor */}
                {course.instructor && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{course.instructor.name}</h4>
                        {course.instructor.experience && (
                          <p className="text-sm text-muted-foreground">{course.instructor.experience}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
