
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Shield, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Star,
  BookOpen,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/course-card';
import { Course, Category } from '@/lib/types';

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/courses?limit=6&featured=true'),
          fetch('/api/categories?limit=6')
        ]);

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setFeaturedCourses(coursesData.courses || []);
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'Курсов', value: '500+', icon: GraduationCap },
    { label: 'Студентов', value: '10000+', icon: Users },
    { label: 'Лет опыта', value: '10+', icon: Award },
    { label: 'Сертификатов', value: '100%', icon: Shield }
  ];

  const features = [
    'Документы установленного образца',
    'Дистанционное обучение 24/7',
    'Поддержка кураторов',
    'Практические задания',
    'Быстрое получение документов',
    'Доступные цены'
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Лицензированная образовательная организация
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Профессиональное <span className="text-primary">образование</span> для вашего развития
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Повышение квалификации и переподготовка для педагогов, специалистов по охране труда и других профессий. Дистанционное обучение с выдачей документов установленного образца.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8">
                  <Link href="/courses">
                    Выбрать курс
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="text-lg px-8">
                  <Link href="/contacts">
                    Получить консультацию
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-purple-200 rounded-2xl overflow-hidden">
                <Image
                  src="https://i.pinimg.com/originals/eb/99/1c/eb991c39bd8f0978f9973b11c3fb5cf6.jpg"
                  alt="Профессиональное образование"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Направления обучения
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Выберите подходящее направление для повышения квалификации или профессиональной переподготовки
            </p>
          </motion.div>

          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {category.name}
                          </CardTitle>
                          {category._count && (
                            <p className="text-sm text-muted-foreground">
                              {category._count.courses} курсов
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {category.description || 'Профессиональные курсы в данной области'}
                      </p>
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/categories/${category.slug}`}>
                          Смотреть курсы
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Категории курсов скоро появятся</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Популярные курсы
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Самые востребованные программы обучения с высоким рейтингом
            </p>
          </motion.div>

          {!loading && featuredCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && featuredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Популярные курсы скоро появятся</p>
            </div>
          )}

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/courses">
                Все курсы
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Почему выбирают нас
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Мы предоставляем качественное образование с современными методами обучения и полной поддержкой студентов.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl overflow-hidden">
                <Image
                  src="https://img.freepik.com/premium-photo/graduation-women-students-celebrate-achievement-with-hug-gown-successful-together-as-graduates-mockup-space-happy-female-girls-embrace-receive-degree-diploma-certificate_590464-88262.jpg?w=2000"
                  alt="Успешные студенты"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Готовы начать обучение?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Получите профессиональные знания и документы установленного образца. Начните свой путь к карьерному росту уже сегодня.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8">
                <Link href="/courses">
                  Выбрать курс
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
                <Link href="/contacts">
                  Задать вопрос
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
