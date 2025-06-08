
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Award, Users, BookOpen, Shield, Target, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const stats = [
    { label: 'Лет на рынке', value: '10+', icon: Award },
    { label: 'Выпускников', value: '50000+', icon: Users },
    { label: 'Курсов', value: '500+', icon: BookOpen },
    { label: 'Лицензий', value: '100%', icon: Shield }
  ];

  const values = [
    {
      icon: Target,
      title: 'Качество образования',
      description: 'Мы предоставляем только актуальные знания и навыки, которые действительно нужны в профессиональной деятельности.'
    },
    {
      icon: Users,
      title: 'Индивидуальный подход',
      description: 'Каждый студент получает персональную поддержку кураторов и возможность обучаться в удобном темпе.'
    },
    {
      icon: Heart,
      title: 'Забота о студентах',
      description: 'Мы сопровождаем наших студентов на всех этапах обучения и помогаем в решении любых вопросов.'
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          О нашей платформе
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Мы создаем качественные образовательные программы для профессионального развития специалистов различных отраслей
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-2xl lg:text-3xl font-bold">
            Наша миссия
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Мы стремимся сделать качественное профессиональное образование доступным для каждого. 
            Наша платформа объединяет лучших экспертов и современные образовательные технологии, 
            чтобы предоставить студентам знания и навыки, необходимые для успешной карьеры.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            За годы работы мы помогли тысячам специалистов повысить квалификацию, освоить новые 
            профессии и достичь карьерных целей. Наши выпускники работают в ведущих компаниях 
            и успешно применяют полученные знания на практике.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Команда платформы"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>

      {/* Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
          Наши ценности
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <Card key={value.title} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Licenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <Card>
          <CardHeader>
            <CardTitle>Лицензия на образовательную деятельность</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Наша образовательная организация имеет лицензию на осуществление образовательной 
              деятельности и право выдачи документов установленного образца.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Лицензия № 123456 от 01.01.2020</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
