
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, Clock, HelpCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  const supportChannels = [
    {
      icon: Phone,
      title: 'Телефонная поддержка',
      description: 'Звоните нам для получения быстрой помощи',
      contact: '+7 (800) 123-45-67',
      action: 'tel:+78001234567',
      availability: 'Пн-Пт: 9:00-18:00',
      responseTime: 'Мгновенно'
    },
    {
      icon: Mail,
      title: 'Email поддержка',
      description: 'Отправьте нам подробное описание проблемы',
      contact: 'support@platform-courses.ru',
      action: 'mailto:support@platform-courses.ru',
      availability: '24/7',
      responseTime: 'До 24 часов'
    },
    {
      icon: MessageCircle,
      title: 'Онлайн чат',
      description: 'Получите помощь в режиме реального времени',
      contact: 'Чат на сайте',
      action: '#',
      availability: 'Пн-Пт: 9:00-18:00',
      responseTime: 'До 5 минут'
    }
  ];

  const supportTopics = [
    {
      icon: HelpCircle,
      title: 'Технические проблемы',
      description: 'Проблемы с доступом к курсам, воспроизведением видео, работой платформы'
    },
    {
      icon: FileText,
      title: 'Вопросы по документам',
      description: 'Получение сертификатов, дипломов, справок об обучении'
    },
    {
      icon: Clock,
      title: 'Продление обучения',
      description: 'Запросы на продление сроков обучения, восстановление доступа'
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
          Техническая поддержка
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Мы готовы помочь вам решить любые технические вопросы и проблемы с обучением
        </p>
      </motion.div>

      {/* Support Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {supportChannels.map((channel, index) => (
          <Card key={channel.title} className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <channel.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg">{channel.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">{channel.description}</p>
              
              <div className="space-y-2">
                <div className="font-medium">{channel.contact}</div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{channel.availability}</span>
                  </div>
                  <div className="mt-1">Ответ: {channel.responseTime}</div>
                </div>
              </div>

              <Button asChild className="w-full">
                <a href={channel.action}>Связаться</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Support Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-center mb-8">
          С чем мы можем помочь
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportTopics.map((topic, index) => (
            <Card key={topic.title}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <topic.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Возможно, ответ на ваш вопрос уже есть в нашей базе знаний
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/faq">Посмотреть FAQ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Центр поддержки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Подробные инструкции и руководства по использованию платформы
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/help">Перейти в центр поддержки</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
