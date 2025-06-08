
import { motion } from 'framer-motion';
import { FileText, Users, CreditCard, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: 'Общие положения',
      content: [
        'Настоящие Условия использования регулируют отношения между пользователями и образовательной платформой.',
        'Используя наш сайт, вы соглашаетесь с данными условиями в полном объеме.',
        'Мы оставляем за собой право изменять условия использования с уведомлением пользователей.',
        'Продолжение использования сайта после изменений означает ваше согласие с новыми условиями.'
      ]
    },
    {
      icon: FileText,
      title: 'Образовательные услуги',
      content: [
        'Мы предоставляем доступ к образовательным курсам и программам дистанционного обучения.',
        'Все курсы разработаны квалифицированными специалистами и соответствуют образовательным стандартам.',
        'После успешного завершения курса выдается документ установленного образца.',
        'Содержание курсов защищено авторским правом и не может быть воспроизведено без разрешения.'
      ]
    },
    {
      icon: CreditCard,
      title: 'Оплата и возврат',
      content: [
        'Оплата производится в соответствии с указанными на сайте ценами на момент покупки.',
        'Мы принимаем оплату банковскими картами, электронными кошельками и банковскими переводами.',
        'Возврат средств возможен в случае отказа от обучения до его начала.',
        'Для юридических лиц предоставляются все необходимые документы для бухгалтерского учета.'
      ]
    },
    {
      icon: Shield,
      title: 'Ответственность и ограничения',
      content: [
        'Мы не несем ответственности за технические сбои, не зависящие от нас.',
        'Пользователь несет ответственность за сохранность своих учетных данных.',
        'Запрещается использование платформы в незаконных целях или нарушение авторских прав.',
        'Мы оставляем за собой право заблокировать доступ при нарушении условий использования.'
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
          Условия использования
        </h1>
        <p className="text-xl text-muted-foreground">
          Правила и условия использования нашей образовательной платформы
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
              Добро пожаловать на нашу образовательную платформу! Настоящие Условия использования 
              определяют правила пользования сайтом и получения образовательных услуг. 
              Пожалуйста, внимательно ознакомьтесь с данными условиями перед началом использования платформы.
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

      {/* Additional Terms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Интеллектуальная собственность</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Все материалы на платформе, включая тексты, изображения, видео, аудио и программное обеспечение, 
              защищены авторским правом и являются интеллектуальной собственностью платформы или ее партнеров.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Запрещается копирование, распространение или модификация материалов без разрешения</li>
              <li>• Пользователи получают ограниченную лицензию на использование материалов для личного обучения</li>
              <li>• Нарушение авторских прав может повлечь правовые последствия</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поведение пользователей</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Пользователи обязуются соблюдать правила поведения на платформе:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Не нарушать права других пользователей</li>
              <li>• Не размещать оскорбительный или неприемлемый контент</li>
              <li>• Не пытаться получить несанкционированный доступ к системе</li>
              <li>• Не использовать платформу для незаконной деятельности</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Прекращение доступа</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Мы оставляем за собой право приостановить или прекратить доступ к платформе 
              в случае нарушения условий использования, неоплаты услуг или по другим обоснованным причинам. 
              При прекращении доступа пользователь теряет право на использование материалов платформы.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Применимое право и разрешение споров</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Настоящие условия регулируются законодательством Российской Федерации. 
              Все споры, возникающие в связи с использованием платформы, подлежат разрешению 
              в судебном порядке по месту нахождения образовательной организации.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              По вопросам, связанным с условиями использования, обращайтесь:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: legal@platform-courses.ru</p>
              <p>Телефон: +7 (800) 123-45-67</p>
              <p>Адрес: 123456, г. Москва, ул. Примерная, д. 123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
