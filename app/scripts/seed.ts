
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.review.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contactForm.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Администратор',
      email: 'admin@platform-courses.ru',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    }
  });

  const testUser = await prisma.user.create({
    data: {
      name: 'Тестовый Пользователь',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'STUDENT',
      phone: '+7 (999) 123-45-67',
      isVerified: true,
    }
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Анна Петрова',
        email: 'anna.petrova@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        phone: '+7 (999) 111-11-11',
        isVerified: true,
      }
    }),
    prisma.user.create({
      data: {
        name: 'Михаил Сидоров',
        email: 'mikhail.sidorov@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        phone: '+7 (999) 222-22-22',
        isVerified: true,
      }
    }),
    prisma.user.create({
      data: {
        name: 'Елена Козлова',
        email: 'elena.kozlova@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        phone: '+7 (999) 333-33-33',
        isVerified: true,
      }
    })
  ]);

  // Create instructors
  console.log('👨‍🏫 Creating instructors...');
  const instructors = await Promise.all([
    prisma.instructor.create({
      data: {
        name: 'Профессор Иванов Иван Иванович',
        slug: 'professor-ivanov',
        bio: 'Доктор педагогических наук, профессор кафедры образовательных технологий. Более 20 лет опыта в сфере образования.',
        experience: '20+ лет в образовании',
        education: 'МГУ им. М.В. Ломоносова, доктор педагогических наук',
        email: 'ivanov@platform-courses.ru',
        phone: '+7 (495) 123-45-67',
      }
    }),
    prisma.instructor.create({
      data: {
        name: 'Доцент Смирнова Мария Александровна',
        slug: 'docent-smirnova',
        bio: 'Кандидат технических наук, специалист по охране труда и промышленной безопасности.',
        experience: '15+ лет в области охраны труда',
        education: 'МГТУ им. Н.Э. Баумана, кандидат технических наук',
        email: 'smirnova@platform-courses.ru',
        phone: '+7 (495) 234-56-78',
      }
    }),
    prisma.instructor.create({
      data: {
        name: 'Кандидат наук Волков Алексей Петрович',
        slug: 'candidate-volkov',
        bio: 'Кандидат экономических наук, эксперт в области управления персоналом и HR-технологий.',
        experience: '12+ лет в HR и управлении',
        education: 'РЭУ им. Г.В. Плеханова, кандидат экономических наук',
        email: 'volkov@platform-courses.ru',
        phone: '+7 (495) 345-67-89',
      }
    })
  ]);

  // Create categories
  console.log('📚 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Педагогика и образование',
        slug: 'pedagogy-education',
        description: 'Курсы для педагогов, воспитателей, методистов и других работников образования',
        icon: 'graduation-cap',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Охрана труда',
        slug: 'occupational-safety',
        description: 'Обучение специалистов по охране труда, промышленной безопасности и экологии',
        icon: 'shield',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Управление персоналом',
        slug: 'hr-management',
        description: 'Курсы для HR-специалистов, руководителей и менеджеров по персоналу',
        icon: 'users',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Медицина и здравоохранение',
        slug: 'healthcare',
        description: 'Повышение квалификации для медицинских работников',
        icon: 'heart',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Строительство и архитектура',
        slug: 'construction',
        description: 'Обучение для специалистов строительной отрасли',
        icon: 'building',
      }
    }),
    prisma.category.create({
      data: {
        name: 'Информационные технологии',
        slug: 'information-technology',
        description: 'Курсы по IT, программированию и цифровым технологиям',
        icon: 'computer',
      }
    })
  ]);

  // Create courses
  console.log('🎓 Creating courses...');
  const courses = await Promise.all([
    // Pedagogy courses
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Современные педагогические технологии в образовании',
        title: 'Современные педагогические технологии в образовании',
        slug: 'modern-pedagogical-technologies',
        description: 'Комплексный курс по изучению и применению современных педагогических технологий в образовательном процессе. Изучение интерактивных методов обучения, цифровых инструментов и инновационных подходов к преподаванию.',
        shortDescription: 'Изучение современных методов и технологий преподавания',
        document: 'Удостоверение о повышении квалификации',
        doc_expire: '5 лет',
        hours: '72',
        hoursInt: 72,
        for_whom: 'Педагоги, учителя, преподаватели',
        for_whom_detailed: 'Курс предназначен для учителей общеобразовательных школ, преподавателей колледжей и вузов, методистов, заместителей директоров по учебной работе',
        price: 4500,
        oldPrice: 6000,
        duration: '2 недели',
        format: 'ONLINE',
        level: 'INTERMEDIATE',
        type: 'QUALIFICATION',
        categoryId: categories[0].id,
        instructorId: instructors[0].id,
        isPopular: true,
        isFeatured: true,
        features: [
          'Интерактивные лекции',
          'Практические задания',
          'Методические материалы',
          'Сертификат установленного образца',
          'Поддержка куратора'
        ],
        certificate: 'Удостоверение о повышении квалификации установленного образца',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Инклюзивное образование: теория и практика',
        title: 'Инклюзивное образование: теория и практика',
        slug: 'inclusive-education',
        description: 'Курс посвящен изучению принципов и методов инклюзивного образования. Рассматриваются особенности работы с детьми с ОВЗ, адаптация образовательных программ и создание инклюзивной среды.',
        shortDescription: 'Работа с детьми с особыми образовательными потребностями',
        document: 'Удостоверение о повышении квалификации',
        doc_expire: '5 лет',
        hours: '108',
        hoursInt: 108,
        for_whom: 'Педагоги, психологи, дефектологи',
        for_whom_detailed: 'Учителя, воспитатели, педагоги-психологи, учителя-дефектологи, социальные педагоги',
        price: 5500,
        duration: '3 недели',
        format: 'ONLINE',
        level: 'ADVANCED',
        type: 'QUALIFICATION',
        categoryId: categories[0].id,
        instructorId: instructors[0].id,
        isPopular: true,
        features: [
          'Теоретические основы инклюзии',
          'Практические методики',
          'Кейсы из практики',
          'Документооборот',
          'Консультации экспертов'
        ],
        certificate: 'Удостоверение о повышении квалификации установленного образца',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    // Safety courses
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Специалист по охране труда',
        title: 'Специалист по охране труда',
        slug: 'occupational-safety-specialist',
        description: 'Профессиональная переподготовка для получения квалификации специалиста по охране труда. Изучение законодательства, методов оценки рисков, организации системы управления охраной труда.',
        shortDescription: 'Профессиональная переподготовка по охране труда',
        document: 'Диплом о профессиональной переподготовке',
        doc_expire: 'Бессрочно',
        hours: '256',
        hoursInt: 256,
        for_whom: 'Специалисты по охране труда, инженеры',
        for_whom_detailed: 'Лица, назначаемые на должность специалиста по охране труда, инженеры по технике безопасности, руководители служб охраны труда',
        price: 12000,
        oldPrice: 15000,
        duration: '2 месяца',
        format: 'ONLINE',
        level: 'BEGINNER',
        type: 'DIPLOMA',
        categoryId: categories[1].id,
        instructorId: instructors[1].id,
        isFeatured: true,
        features: [
          'Полный курс законодательства',
          'Практические навыки',
          'Итоговая аттестация',
          'Диплом гос. образца',
          'Трудоустройство'
        ],
        certificate: 'Диплом о профессиональной переподготовке установленного образца',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Обучение по охране труда руководителей и специалистов',
        title: 'Обучение по охране труда руководителей и специалистов',
        slug: 'safety-training-managers',
        description: 'Обязательное обучение по охране труда для руководителей и специалистов в соответствии с требованиями Трудового кодекса РФ и постановления Правительства РФ №2464.',
        shortDescription: 'Обязательное обучение по охране труда',
        document: 'Удостоверение о проверке знаний',
        doc_expire: '3 года',
        hours: '40',
        hoursInt: 40,
        for_whom: 'Руководители, специалисты',
        for_whom_detailed: 'Руководители организаций, заместители руководителей, курирующие вопросы охраны труда, специалисты служб охраны труда',
        price: 2500,
        duration: '1 неделя',
        format: 'ONLINE',
        level: 'BEGINNER',
        type: 'QUALIFICATION',
        categoryId: categories[1].id,
        instructorId: instructors[1].id,
        isPopular: true,
        features: [
          'Актуальное законодательство',
          'Онлайн-тестирование',
          'Быстрое получение документов',
          'Соответствие требованиям ГИТ',
          'Техподдержка 24/7'
        ],
        certificate: 'Удостоверение о проверке знаний требований охраны труда',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    // HR courses
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'HR-менеджер: управление персоналом',
        title: 'HR-менеджер: управление персоналом',
        slug: 'hr-manager-personnel-management',
        description: 'Комплексная программа профессиональной переподготовки для HR-специалистов. Изучение всех аспектов управления персоналом: подбор, адаптация, мотивация, развитие, увольнение.',
        shortDescription: 'Профессиональная переподготовка HR-специалистов',
        document: 'Диплом о профессиональной переподготовке',
        doc_expire: 'Бессрочно',
        hours: '512',
        hoursInt: 512,
        for_whom: 'HR-специалисты, руководители',
        for_whom_detailed: 'Специалисты отделов кадров, HR-менеджеры, руководители, желающие освоить управление персоналом',
        price: 18000,
        oldPrice: 22000,
        duration: '4 месяца',
        format: 'ONLINE',
        level: 'INTERMEDIATE',
        type: 'DIPLOMA',
        categoryId: categories[2].id,
        instructorId: instructors[2].id,
        isFeatured: true,
        features: [
          'Полный цикл HR-процессов',
          'Практические кейсы',
          'Современные HR-технологии',
          'Диплом гос. образца',
          'Карьерная поддержка'
        ],
        certificate: 'Диплом о профессиональной переподготовке с присвоением квалификации',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Кадровое делопроизводство и документооборот',
        title: 'Кадровое делопроизводство и документооборот',
        slug: 'hr-documentation',
        description: 'Курс по ведению кадрового делопроизводства в соответствии с актуальным законодательством. Изучение документооборота, трудовых книжек, личных дел сотрудников.',
        shortDescription: 'Ведение кадровой документации',
        document: 'Удостоверение о повышении квалификации',
        doc_expire: '5 лет',
        hours: '72',
        hoursInt: 72,
        for_whom: 'Кадровики, секретари, делопроизводители',
        for_whom_detailed: 'Специалисты отделов кадров, секретари-референты, делопроизводители, помощники руководителей',
        price: 4000,
        duration: '2 недели',
        format: 'ONLINE',
        level: 'BEGINNER',
        type: 'QUALIFICATION',
        categoryId: categories[2].id,
        instructorId: instructors[2].id,
        isPopular: true,
        features: [
          'Актуальные формы документов',
          'Пошаговые инструкции',
          'Образцы заполнения',
          'Консультации юриста',
          'Практические задания'
        ],
        certificate: 'Удостоверение о повышении квалификации установленного образца',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    // Healthcare courses
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440007',
        name: 'Сестринское дело в терапии',
        title: 'Сестринское дело в терапии',
        slug: 'nursing-therapy',
        description: 'Повышение квалификации медицинских сестер терапевтического профиля. Современные стандарты сестринской помощи, новые технологии и методы лечения.',
        shortDescription: 'Повышение квалификации медсестер',
        document: 'Удостоверение о повышении квалификации',
        doc_expire: '5 лет',
        hours: '144',
        hoursInt: 144,
        for_whom: 'Медицинские сестры',
        for_whom_detailed: 'Медицинские сестры терапевтических отделений, участковые медсестры, медсестры поликлиник',
        price: 6500,
        duration: '1 месяц',
        format: 'ONLINE',
        level: 'INTERMEDIATE',
        type: 'QUALIFICATION',
        categoryId: categories[3].id,
        instructorId: instructors[0].id,
        features: [
          'Современные стандарты',
          'Клинические случаи',
          'Практические навыки',
          'Аккредитация Минздрава',
          'Зачет НМО баллов'
        ],
        certificate: 'Удостоверение о повышении квалификации с зачетом НМО баллов',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    // Construction courses
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440008',
        name: 'Проектирование зданий и сооружений',
        title: 'Проектирование зданий и сооружений',
        slug: 'building-design',
        description: 'Профессиональная переподготовка по проектированию зданий и сооружений. Изучение современных технологий проектирования, BIM-моделирования, строительных норм.',
        shortDescription: 'Профессиональная переподготовка проектировщиков',
        document: 'Диплом о профессиональной переподготовке',
        doc_expire: 'Бессрочно',
        hours: '520',
        hoursInt: 520,
        for_whom: 'Инженеры, архитекторы, проектировщики',
        for_whom_detailed: 'Инженеры-строители, архитекторы, проектировщики, технические специалисты строительных организаций',
        price: 25000,
        oldPrice: 30000,
        duration: '5 месяцев',
        format: 'ONLINE',
        level: 'ADVANCED',
        type: 'DIPLOMA',
        categoryId: categories[4].id,
        instructorId: instructors[1].id,
        features: [
          'BIM-технологии',
          'Современные САПР',
          'Строительные нормы',
          'Практические проекты',
          'Диплом гос. образца'
        ],
        certificate: 'Диплом о профессиональной переподготовке с правом ведения деятельности',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    // IT courses
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440009',
        name: 'Веб-разработка: от основ до профессионала',
        title: 'Веб-разработка: от основ до профессионала',
        slug: 'web-development',
        description: 'Комплексный курс веб-разработки для начинающих и продвинутых разработчиков. Изучение HTML, CSS, JavaScript, React, Node.js и современных инструментов разработки.',
        shortDescription: 'Полный курс веб-разработки',
        document: 'Диплом о профессиональной переподготовке',
        doc_expire: 'Бессрочно',
        hours: '720',
        hoursInt: 720,
        for_whom: 'Начинающие разработчики, IT-специалисты',
        for_whom_detailed: 'Начинающие программисты, студенты IT-специальностей, специалисты, желающие сменить профессию',
        price: 35000,
        oldPrice: 45000,
        duration: '6 месяцев',
        format: 'ONLINE',
        level: 'BEGINNER',
        type: 'DIPLOMA',
        categoryId: categories[5].id,
        instructorId: instructors[2].id,
        isPopular: true,
        isFeatured: true,
        features: [
          'Современный стек технологий',
          'Реальные проекты',
          'Менторская поддержка',
          'Помощь в трудоустройстве',
          'Портфолио проектов'
        ],
        certificate: 'Диплом о профессиональной переподготовке с присвоением квалификации',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    }),
    prisma.course.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Информационная безопасность',
        title: 'Информационная безопасность',
        slug: 'information-security',
        description: 'Курс по основам информационной безопасности для специалистов IT-отрасли. Изучение методов защиты информации, кибербезопасности, аудита ИБ.',
        shortDescription: 'Основы информационной безопасности',
        document: 'Удостоверение о повышении квалификации',
        doc_expire: '3 года',
        hours: '120',
        hoursInt: 120,
        for_whom: 'IT-специалисты, системные администраторы',
        for_whom_detailed: 'Системные администраторы, IT-специалисты, специалисты по информационной безопасности',
        price: 8500,
        duration: '3 недели',
        format: 'ONLINE',
        level: 'INTERMEDIATE',
        type: 'QUALIFICATION',
        categoryId: categories[5].id,
        instructorId: instructors[2].id,
        features: [
          'Практические лабораторные',
          'Современные угрозы',
          'Методы защиты',
          'Сертификация',
          'Экспертная поддержка'
        ],
        certificate: 'Удостоверение о повышении квалификации установленного образца',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      }
    })
  ]);

  // Create enrollments
  console.log('📝 Creating enrollments...');
  await Promise.all([
    prisma.enrollment.create({
      data: {
        userId: testUser.id,
        courseId: courses[0].id,
        status: 'ACTIVE',
        progress: 45,
      }
    }),
    prisma.enrollment.create({
      data: {
        userId: testUser.id,
        courseId: courses[2].id,
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date('2024-01-15'),
      }
    }),
    prisma.enrollment.create({
      data: {
        userId: students[0].id,
        courseId: courses[1].id,
        status: 'ACTIVE',
        progress: 75,
      }
    }),
    prisma.enrollment.create({
      data: {
        userId: students[1].id,
        courseId: courses[3].id,
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date('2024-02-20'),
      }
    }),
    prisma.enrollment.create({
      data: {
        userId: students[2].id,
        courseId: courses[8].id,
        status: 'ACTIVE',
        progress: 30,
      }
    })
  ]);

  // Create orders
  console.log('🛒 Creating orders...');
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: testUser.id,
        status: 'COMPLETED',
        totalAmount: 4500,
        currency: 'RUB',
        customerName: testUser.name,
        customerEmail: testUser.email,
        customerPhone: testUser.phone,
        items: {
          create: [
            {
              courseId: courses[0].id,
              quantity: 1,
              price: 4500,
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: students[0].id,
        status: 'COMPLETED',
        totalAmount: 5500,
        currency: 'RUB',
        customerName: students[0].name,
        customerEmail: students[0].email,
        customerPhone: students[0].phone,
        items: {
          create: [
            {
              courseId: courses[1].id,
              quantity: 1,
              price: 5500,
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: students[1].id,
        status: 'PENDING',
        totalAmount: 12000,
        currency: 'RUB',
        customerName: students[1].name,
        customerEmail: students[1].email,
        customerPhone: students[1].phone,
        items: {
          create: [
            {
              courseId: courses[2].id,
              quantity: 1,
              price: 12000,
            }
          ]
        }
      }
    })
  ]);

  // Create payments
  console.log('💳 Creating payments...');
  await Promise.all([
    prisma.payment.create({
      data: {
        orderId: orders[0].id,
        status: 'SUCCEEDED',
        amount: 4500,
        currency: 'RUB',
        paymentMethod: 'bank_card',
        description: `Оплата заказа #${orders[0].id}`,
        paidAt: new Date('2024-01-10'),
      }
    }),
    prisma.payment.create({
      data: {
        orderId: orders[1].id,
        status: 'SUCCEEDED',
        amount: 5500,
        currency: 'RUB',
        paymentMethod: 'bank_card',
        description: `Оплата заказа #${orders[1].id}`,
        paidAt: new Date('2024-02-15'),
      }
    }),
    prisma.payment.create({
      data: {
        orderId: orders[2].id,
        status: 'PENDING',
        amount: 12000,
        currency: 'RUB',
        description: `Оплата заказа #${orders[2].id}`,
      }
    })
  ]);

  // Create reviews
  console.log('⭐ Creating reviews...');
  await Promise.all([
    prisma.review.create({
      data: {
        userId: testUser.id,
        courseId: courses[0].id,
        rating: 5,
        comment: 'Отличный курс! Очень понравилась подача материала и практические задания. Рекомендую всем педагогам.',
        isApproved: true,
      }
    }),
    prisma.review.create({
      data: {
        userId: students[0].id,
        courseId: courses[1].id,
        rating: 4,
        comment: 'Хороший курс по инклюзивному образованию. Много полезной информации, но хотелось бы больше практических примеров.',
        isApproved: true,
      }
    }),
    prisma.review.create({
      data: {
        userId: students[1].id,
        courseId: courses[3].id,
        rating: 5,
        comment: 'Прошел обучение по охране труда. Все четко, понятно, актуальная информация. Документы получил быстро.',
        isApproved: true,
      }
    }),
    prisma.review.create({
      data: {
        userId: students[2].id,
        courseId: courses[8].id,
        rating: 5,
        comment: 'Отличный курс веб-разработки! Преподаватель объясняет сложные вещи простым языком. Уже создал первый проект.',
        isApproved: true,
      }
    })
  ]);

  // Create contact forms
  console.log('📧 Creating contact forms...');
  await Promise.all([
    prisma.contactForm.create({
      data: {
        userId: testUser.id,
        name: testUser.name,
        email: testUser.email,
        phone: testUser.phone,
        subject: 'Вопрос по курсу педагогики',
        message: 'Здравствуйте! Хотел бы узнать подробнее о курсе современных педагогических технологий. Есть ли возможность получить программу обучения?',
        formType: 'course_inquiry',
        status: 'RESOLVED',
        response: 'Добрый день! Программа курса отправлена на ваш email. Если есть дополнительные вопросы, обращайтесь.',
        respondedAt: new Date('2024-03-15'),
        respondedBy: 'Менеджер Иванова А.С.',
      }
    }),
    prisma.contactForm.create({
      data: {
        name: 'Петр Николаев',
        email: 'petr.nikolaev@example.com',
        phone: '+7 (999) 444-44-44',
        subject: 'Корпоративное обучение',
        message: 'Интересует возможность корпоративного обучения сотрудников по охране труда. У нас 50 человек. Какие условия?',
        formType: 'corporate',
        status: 'IN_PROGRESS',
      }
    }),
    prisma.contactForm.create({
      data: {
        userId: students[0].id,
        name: students[0].name,
        email: students[0].email,
        phone: students[0].phone,
        subject: 'Техническая поддержка',
        message: 'Не могу войти в личный кабинет. Пишет "неверный пароль", хотя ввожу правильно.',
        formType: 'support',
        status: 'NEW',
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Created:');
  console.log(`- ${await prisma.user.count()} users`);
  console.log(`- ${await prisma.instructor.count()} instructors`);
  console.log(`- ${await prisma.category.count()} categories`);
  console.log(`- ${await prisma.course.count()} courses`);
  console.log(`- ${await prisma.enrollment.count()} enrollments`);
  console.log(`- ${await prisma.order.count()} orders`);
  console.log(`- ${await prisma.payment.count()} payments`);
  console.log(`- ${await prisma.review.count()} reviews`);
  console.log(`- ${await prisma.contactForm.count()} contact forms`);
  
  console.log('\n🔑 Test credentials:');
  console.log('Admin: admin@platform-courses.ru / password123');
  console.log('User: test@example.com / password123');
  console.log('Student: anna.petrova@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
