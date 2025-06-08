
'use client';

import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, Users, CreditCard, FileText, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HelpPage() {
  const helpSections = [
    {
      icon: BookOpen,
      title: 'Обучение',
      items: [
        'Как записаться на курс?',
        'Как проходит дистанционное обучение?',
        'Сколько времени занимает обучение?',
        'Можно ли учиться в своем темпе?',
        'Есть ли поддержка во время обучения?'
      ]
    },
    {
      icon: FileText,
      title: 'Документы',
      items: [
        'Какие документы выдаются после обучения?',
        'Как получить документ об образовании?',
        'Сколько действует удостоверение?',
        'Можно ли получить дубликат документа?',
        'Признаются ли документы работодателями?'
      ]
    },
    {
      icon: CreditCard,
      title: 'Оплата',
      items: [
        'Какие способы оплаты доступны?',
        'Можно ли оплатить в рассрочку?',
        'Как получить документы для бухгалтерии?',
        'Возможен ли возврат средств?',
        'Есть ли скидки для организаций?'
      ]
    },
    {
      icon: Users,
      title: 'Аккаунт',
      items: [
        'Как зарегистрироваться на платформе?',
        'Забыл пароль, что делать?',
        'Как изменить личные данные?',
        'Как посмотреть историю заказов?',
        'Как связаться с поддержкой?'
      ]
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: 'Телефон',
      value: '+7 (800) 123-45-67',
      description: 'Бесплатный звонок по России',
      action: 'tel:+78001234567'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'support@platform-courses.ru',
      description: 'Ответим в течение 24 часов',
      action: 'mailto:support@platform-courses.ru'
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
          Центр поддержки
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Найдите ответы на часто задаваемые вопросы или свяжитесь с нашей службой поддержки
        </p>
      </motion.div>

      {/* Help Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
      >
        {helpSections.map((section, index) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-center mb-8">
          Не нашли ответ на свой вопрос?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {contactMethods.map((method) => (
            <Card key={method.title} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <method.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{method.title}</h3>
                <p className="text-lg font-medium mb-1">{method.value}</p>
                <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                <Button asChild>
                  <a href={method.action}>Связаться</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Contact Form Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center"
      >
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-4">
              Или отправьте нам сообщение
            </h3>
            <p className="text-muted-foreground mb-6">
              Заполните форму обратной связи, и мы ответим вам в ближайшее время
            </p>
            <Button asChild size="lg">
              <Link href="/contacts">
                Написать сообщение
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
