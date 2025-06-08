
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  const sections = [
    {
      icon: UserCheck,
      title: 'Сбор персональных данных',
      content: [
        'Мы собираем только те персональные данные, которые необходимы для предоставления образовательных услуг.',
        'К персональным данным относятся: ФИО, email, телефон, данные об образовании и профессиональной деятельности.',
        'Сбор данных происходит с вашего согласия при регистрации на платформе или записи на курсы.',
        'Мы не собираем избыточную информацию и не требуем данные, не связанные с образовательным процессом.'
      ]
    },
    {
      icon: Lock,
      title: 'Использование данных',
      content: [
        'Ваши данные используются исключительно для предоставления образовательных услуг.',
        'Мы можем использовать контактную информацию для связи по вопросам обучения.',
        'Данные об успеваемости используются для выдачи документов об образовании.',
        'Мы не передаем ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.'
      ]
    },
    {
      icon: Shield,
      title: 'Защита данных',
      content: [
        'Мы применяем современные технические и организационные меры для защиты ваших данных.',
        'Доступ к персональным данным имеют только уполномоченные сотрудники.',
        'Мы используем шифрование для передачи и хранения чувствительной информации.',
        'Регулярно проводим аудит безопасности и обновляем системы защиты.'
      ]
    },
    {
      icon: Eye,
      title: 'Ваши права',
      content: [
        'Вы имеете право на доступ к своим персональным данным.',
        'Вы можете запросить исправление неточных или неполных данных.',
        'Вы имеете право на удаление ваших данных (право на забвение).',
        'Вы можете отозвать согласие на обработку данных в любое время.',
        'Вы имеете право на получение копии ваших данных в структурированном формате.'
      ]
    }
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          Политика конфиденциальности
        </h1>
        <p className="text-xl text-muted-foreground">
          Мы серьезно относимся к защите ваших персональных данных
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Последнее обновление: 1 января 2024 года
        </p>
      </motion.div>

      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              Настоящая Политика конфиденциальности определяет порядок обработки персональных данных 
              пользователей образовательной платформы. Мы обязуемся защищать вашу конфиденциальность 
              и обрабатывать ваши данные в соответствии с требованиями Федерального закона 
              "О персональных данных" № 152-ФЗ и GDPR.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Sections */}
      <div className="space-y-6 mb-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
          >
            <Card>
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
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Cookies и технологии отслеживания</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Мы используем cookies и аналогичные технологии для улучшения работы сайта и персонализации контента:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Необходимые cookies для работы сайта и аутентификации</li>
              <li>• Аналитические cookies для понимания поведения пользователей</li>
              <li>• Функциональные cookies для сохранения ваших предпочтений</li>
            </ul>
            <p className="text-muted-foreground">
              Вы можете управлять настройками cookies в вашем браузере.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Изменения в политике</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Мы можем обновлять данную Политику конфиденциальности. О существенных изменениях 
              мы уведомим вас по email или через уведомления на сайте. Рекомендуем периодически 
              просматривать эту страницу для ознакомления с актуальной версией.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Если у вас есть вопросы о нашей Политике конфиденциальности или вы хотите 
              воспользоваться своими правами, свяжитесь с нами:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: privacy@platform-courses.ru</p>
              <p>Телефон: +7 (800) 123-45-67</p>
              <p>Адрес: 123456, г. Москва, ул. Примерная, д. 123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
