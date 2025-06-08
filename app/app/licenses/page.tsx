
'use client';

import { motion } from 'framer-motion';
import { Shield, FileText, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LicensesPage() {
  const licenses = [
    {
      title: 'Лицензия на образовательную деятельность',
      number: '№ 123456',
      date: '01 января 2020 года',
      authority: 'Министерство образования и науки РФ',
      description: 'Право на осуществление образовательной деятельности по программам дополнительного профессионального образования',
      status: 'Действующая'
    },
    {
      title: 'Свидетельство о государственной аккредитации',
      number: '№ 789012',
      date: '15 марта 2020 года',
      authority: 'Федеральная служба по надзору в сфере образования и науки',
      description: 'Подтверждение соответствия образовательных программ федеральным государственным образовательным стандартам',
      status: 'Действующее'
    }
  ];

  const certifications = [
    'ISO 9001:2015 - Система менеджмента качества',
    'ISO 27001:2013 - Система управления информационной безопасностью',
    'Сертификат соответствия ГОСТ Р ИСО 9001-2015',
    'Членство в Ассоциации организаций дополнительного профессионального образования'
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
          Лицензии и сертификаты
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Наша образовательная организация имеет все необходимые лицензии и сертификаты для ведения образовательной деятельности
        </p>
      </motion.div>

      {/* Licenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6 mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Основные лицензии</h2>
        {licenses.map((license, index) => (
          <Card key={license.number}>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="mb-2">{license.title}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{license.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-1">Номер лицензии:</h4>
                  <p className="text-muted-foreground">{license.number}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Дата выдачи:</h4>
                  <p className="text-muted-foreground">{license.date}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-1">Выдана:</h4>
                  <p className="text-muted-foreground">{license.authority}</p>
                </div>
              </div>
              <p className="text-muted-foreground">{license.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Certifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Сертификаты и членство</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-primary" />
              <CardTitle>Дополнительные сертификаты качества</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legal Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>Правовая информация</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Полное наименование организации:</h4>
              <p className="text-muted-foreground">
                Автономная некоммерческая организация дополнительного профессионального образования "Платформа"
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">ИНН / КПП:</h4>
              <p className="text-muted-foreground">1234567890 / 123456789</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">ОГРН:</h4>
              <p className="text-muted-foreground">1234567890123</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Юридический адрес:</h4>
              <p className="text-muted-foreground">123456, г. Москва, ул. Примерная, д. 123, оф. 456</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Банковские реквизиты:</h4>
              <p className="text-muted-foreground">
                Р/с: 40703810000000000000<br />
                Банк: ПАО "Сбербанк России"<br />
                К/с: 30101810400000000225<br />
                БИК: 044525225
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
