
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: 'Общие вопросы',
      questions: [
        {
          question: 'Что такое дистанционное обучение?',
          answer: 'Дистанционное обучение - это форма получения образования, при которой взаимодействие преподавателя и студента происходит на расстоянии с помощью информационных технологий. Вы можете изучать материалы в удобное время и в удобном месте.'
        },
        {
          question: 'Какие документы выдаются после обучения?',
          answer: 'После успешного завершения курса вы получаете документ установленного образца: удостоверение о повышении квалификации (для курсов от 16 часов) или диплом о профессиональной переподготовке (для курсов от 250 часов).'
        },
        {
          question: 'Признаются ли ваши документы работодателями?',
          answer: 'Да, наши документы имеют официальный статус и признаются работодателями по всей России. Мы имеем лицензию на образовательную деятельность, что гарантирует качество и признание наших документов.'
        }
      ]
    },
    {
      category: 'Обучение',
      questions: [
        {
          question: 'Как проходит процесс обучения?',
          answer: 'После оплаты курса вы получаете доступ к личному кабинету с учебными материалами. Обучение включает изучение лекций, выполнение практических заданий и прохождение итогового тестирования. Вы можете учиться в своем темпе.'
        },
        {
          question: 'Есть ли поддержка во время обучения?',
          answer: 'Да, каждому студенту назначается персональный куратор, который помогает в процессе обучения, отвечает на вопросы и консультирует по учебным материалам. Также работает служба технической поддержки.'
        },
        {
          question: 'Можно ли продлить срок обучения?',
          answer: 'Да, если вы не успеваете завершить обучение в установленные сроки, можно продлить доступ к материалам. Обратитесь к своему куратору для решения этого вопроса.'
        },
        {
          question: 'Что делать, если не сдал итоговое тестирование?',
          answer: 'Если вы не прошли итоговое тестирование с первого раза, предоставляется возможность пересдачи. Количество попыток зависит от конкретного курса. Куратор поможет подготовиться к повторной сдаче.'
        }
      ]
    },
    {
      category: 'Оплата и документы',
      questions: [
        {
          question: 'Какие способы оплаты доступны?',
          answer: 'Мы принимаем оплату банковскими картами (Visa, MasterCard, МИР), через электронные кошельки, банковские переводы. Для юридических лиц доступна оплата по счету с НДС.'
        },
        {
          question: 'Можно ли оплатить обучение в рассрочку?',
          answer: 'Да, для некоторых курсов доступна рассрочка платежа. Условия рассрочки зависят от стоимости и продолжительности курса. Уточните возможность рассрочки у менеджера.'
        },
        {
          question: 'Как получить документы для бухгалтерии?',
          answer: 'После оплаты мы предоставляем все необходимые документы: договор, акт выполненных работ, счет-фактуру (при необходимости). Документы можно получить в электронном виде или заказать почтовую доставку.'
        },
        {
          question: 'Возможен ли возврат средств?',
          answer: 'Возврат средств возможен в случае отказа от обучения до начала курса или при наличии технических проблем, препятствующих обучению. Условия возврата указаны в договоре.'
        }
      ]
    },
    {
      category: 'Технические вопросы',
      questions: [
        {
          question: 'Какие технические требования для обучения?',
          answer: 'Для обучения достаточно компьютера или мобильного устройства с доступом в интернет и современным браузером. Рекомендуется скорость интернета от 1 Мбит/с.'
        },
        {
          question: 'Не могу войти в личный кабинет, что делать?',
          answer: 'Проверьте правильность ввода логина и пароля. Если забыли пароль, воспользуйтесь функцией восстановления. При других проблемах обратитесь в техническую поддержку.'
        },
        {
          question: 'Можно ли скачать материалы для изучения офлайн?',
          answer: 'Некоторые материалы доступны для скачивания, но основная часть контента доступна только в онлайн-режиме для защиты авторских прав. Точная информация указана в описании каждого курса.'
        }
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
          Часто задаваемые вопросы
        </h1>
        <p className="text-xl text-muted-foreground">
          Ответы на самые популярные вопросы о наших курсах и обучении
        </p>
      </motion.div>

      {/* FAQ Sections */}
      <div className="space-y-8">
        {faqData.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((item, questionIndex) => {
                const globalIndex = categoryIndex * 100 + questionIndex;
                const isOpen = openItems.includes(globalIndex);
                
                return (
                  <Card key={questionIndex}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium pr-4">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-4">
              Не нашли ответ на свой вопрос?
            </h3>
            <p className="text-muted-foreground mb-6">
              Свяжитесь с нами, и мы обязательно поможем
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+78001234567"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Позвонить: +7 (800) 123-45-67
              </a>
              <a
                href="/contacts"
                className="inline-flex items-center justify-center px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                Написать сообщение
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
