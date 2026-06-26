export type Locale = 'uz' | 'ru' | 'en';

export const localeNames: Record<Locale, { label: string; flag: string }> = {
  uz: { label: "O'zbek", flag: '🇺🇿' },
  ru: { label: 'Русский', flag: '🇷🇺' },
  en: { label: 'English', flag: '🇬🇧' },
};

type DeepRecord = { [key: string]: string | DeepRecord };

const translations: Record<Locale, DeepRecord> = {
  uz: {
    nav: {
      home: 'Bosh saxifa',
      about: "O'zim haqimda",
      projects: 'Loyihalar',
      skills: 'Konikmalar',
      contact: "Bog'lanish",
      download_cv: 'Download CV',
    },
    hero: {
      greeting: 'Salom, men',
      download_cv: 'CV yuklab olish',
    },
    about: {
      title: "O'zim haqimda",
      milestones: {
        computer: {
          title: 'Computer Since',
          desc: 'Kampyuter asoslari. Word, Excel, PowerPoint va boshqa dasturlarni o\'rganish va o\'rnatish.',
        },
        frontend: {
          title: 'Frontend Development',
          desc: 'HTML, CSS, JavaScript, React va boshqa frontend texnologiyalar.',
        },
        backend: {
          title: 'Backend Development',
          desc: 'Python, Node.js, Django, Express.js va boshqa backend texnologiyalar.',
        },
        cloud: {
          title: 'Cloud serverlar',
          desc: 'Linux, Docker, AWS, Vercel, Render va boshqa cloud texnologiyalar.',
        },
        ai: {
          title: 'AI Integration',
          desc: "AI larni o'rganish, nazorat qilish va Prompt Engineering orqali AI lar orqali tizimlar qurish.",
        },
        ielts: {
          title: 'IELTS Preparation',
          desc: "IELTS sertifikatini olish uchun tayyorgarlik ko'rish va imtihon topshirish.",
        },
      },
    },
    projects: {
      badge: 'Loyihalarim',
      subtitle: "Yaratgan va ishlab chiqqan asosiy dasturiy mahsulotlarim ro'yxati",
    },
    skills: {
      badge: "Ko'nikmalar",
      subtitle: 'Men foydalanadigan texnologiyalar va dasturlash vositalari',
      languages: 'Full Stack',
      databases: "Ma'lumotlar bazalari",
      systems: 'Dev OPS & Cloud',
      programs: 'Dasturlar',
    },
    contact: {
      title: "Bog'lanish",
      badge: "Bog'lanish",
      heading: 'Keling birgalikda ajoyib narsa yarataylik',
      desc: "Loyihangiz haqida ma'lumot bering va men bir ish kuni ichida javob beraman.",
      pill: '24 soat ichida javob',
      info_title: 'Loyihangiz haqida gapirib bering',
      info_desc: "Maqsadlaringizni men bilan quring. Email orqali ham bog'lanishingiz mumkin:",
      name_label: "To'liq ism",
      name_placeholder: 'Ozodbek Usmonqulov',
      email_label: 'Email',
      email_placeholder: 'info@gmail.com',
      phone_label: 'Telefon',
      phone_field_label: 'Telefon raqam',
      phone_placeholder: '+998 (99) 999-99-99',
      telegram_label: 'Telegram',
      message_label: 'Xabar',
      message_placeholder: "Yaratmoqchi bo'lgan loyihangiz haqida qisqacha ma'lumot bering...",
      submit: 'Xabarni yuborish',
      submitting: 'Yuborilmoqda...',
      success: 'Xabar muvaffaqiyatli yuborildi',
      error: 'Xatolik yuz berdi. Qayta urinib ko\'ring.',
      server_error: 'Serverga ulanib bo\'lmadi. Bot ishlayotganiga ishonch hosil qiling.',
    },
    admin: {
      dashboard: 'Bosh menyu',
      welcome: 'Xush kelibsiz, Admin!',
      welcome_desc: 'Ozodbek Usmonqulov portfolio boshqaruv paneliga xush kelibsiz. Tizim to\'liq ishchi holatda.',
      status: 'Tizim holati',
      status_active: 'Ishlamoqda (Active)',
      github: 'GitHub Aloqasi',
      connected: 'Ulandi',
      not_connected: 'Ulanmagan',
      my_projects: 'Loyihalarim',
      repos: 'GitHub Repozitoriylari',
      disconnect: 'Ulanishni uzish',
      logout: 'Logout',
      username_placeholder: 'Foydalanuvchi nomi',
      password_placeholder: 'Parol',
    },
  },

  ru: {
    nav: {
      home: 'Главная',
      about: 'О себе',
      projects: 'Проекты',
      skills: 'Навыки',
      contact: 'Контакты',
      download_cv: 'Скачать CV',
    },
    hero: {
      greeting: 'Привет, я',
      download_cv: 'Скачать CV',
    },
    about: {
      title: 'Обо мне',
      milestones: {
        computer: {
          title: 'Компьютер',
          desc: 'Основы компьютера. Изучение Word, Excel, PowerPoint и других программ.',
        },
        frontend: {
          title: 'Frontend',
          desc: 'HTML, CSS, JavaScript, React и другие frontend технологии.',
        },
        backend: {
          title: 'Backend',
          desc: 'Python, Node.js, Django, Express.js и другие backend технологии.',
        },
        cloud: {
          title: 'Cloud серверы',
          desc: 'Linux, Docker, AWS, Vercel, Render и другие облачные технологии.',
        },
        ai: {
          title: 'AI Интеграция',
          desc: 'Изучение AI, контроль и создание систем с помощью Prompt Engineering и AI.',
        },
        ielts: {
          title: 'IELTS Подготовка',
          desc: 'Подготовка к получению сертификата IELTS и сдача экзамена.',
        },
      },
    },
    projects: {
      badge: 'Мои проекты',
      subtitle: 'Список основных программных продуктов, которые я создал и разработал',
    },
    skills: {
      badge: 'Навыки',
      subtitle: 'Технологии и инструменты, которые я использую',
      languages: 'Full Stack',
      databases: 'Базы данных',
      systems: 'Dev OPS & Cloud',
      programs: 'Программы',
    },
    contact: {
      title: 'Связаться',
      badge: 'Связаться',
      heading: 'Давайте создадим что-то удивительное вместе',
      desc: 'Расскажите о своем проекте, и я отвечу в течение одного рабочего дня.',
      pill: 'Ответ в течение 24 часов',
      info_title: 'Расскажите о своем проекте',
      info_desc: 'Обсудите ваши цели со мной. Вы также можете связаться по электронной почте:',
      name_label: 'Полное имя',
      name_placeholder: 'Озодбек Усмонкулов',
      email_label: 'Email',
      email_placeholder: 'info@gmail.com',
      phone_label: 'Телефон',
      phone_field_label: 'Номер телефона',
      phone_placeholder: '+998 (99) 999-99-99',
      telegram_label: 'Telegram',
      message_label: 'Сообщение',
      message_placeholder: 'Кратко опишите проект, который хотите создать...',
      submit: 'Отправить сообщение',
      submitting: 'Отправка...',
      success: 'Сообщение успешно отправлено',
      error: 'Произошла ошибка. Попробуйте снова.',
      server_error: 'Не удалось подключиться к серверу.',
    },
    admin: {
      dashboard: 'Главная',
      welcome: 'Добро пожаловать, Админ!',
      welcome_desc: 'Панель управления портфолио Озодбека Усмонкулова. Система работает в полном объёме.',
      status: 'Статус системы',
      status_active: 'Работает (Active)',
      github: 'GitHub связь',
      connected: 'Подключено',
      not_connected: 'Не подключено',
      my_projects: 'Мои проекты',
      repos: 'Репозитории GitHub',
      disconnect: 'Отключить',
      logout: 'Выйти',
      username_placeholder: 'Имя пользователя',
      password_placeholder: 'Пароль',
    },
  },

  en: {
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact',
      download_cv: 'Download CV',
    },
    hero: {
      greeting: "Hi, I'm",
      download_cv: 'Download CV',
    },
    about: {
      title: 'About Me',
      milestones: {
        computer: {
          title: 'Computer Since',
          desc: 'Computer basics. Learning and installing Word, Excel, PowerPoint and other programs.',
        },
        frontend: {
          title: 'Frontend Development',
          desc: 'HTML, CSS, JavaScript, React and other frontend technologies.',
        },
        backend: {
          title: 'Backend Development',
          desc: 'Python, Node.js, Django, Express.js and other backend technologies.',
        },
        cloud: {
          title: 'Cloud Servers',
          desc: 'Linux, Docker, AWS, Vercel, Render and other cloud technologies.',
        },
        ai: {
          title: 'AI Integration',
          desc: 'Learning AI, controlling and building systems with Prompt Engineering and AI.',
        },
        ielts: {
          title: 'IELTS Preparation',
          desc: 'Preparing for and taking the IELTS certification exam.',
        },
      },
    },
    projects: {
      badge: 'My Projects',
      subtitle: 'List of main software products I created and developed',
    },
    skills: {
      badge: 'Skills',
      subtitle: 'Technologies and tools I use',
      languages: 'Full Stack',
      databases: 'Databases',
      systems: 'Dev OPS & Cloud',
      programs: 'Programs',
    },
    contact: {
      title: 'Contact',
      badge: 'Contact',
      heading: "Let's create something amazing together",
      desc: 'Tell me about your project and I will respond within one business day.',
      pill: 'Reply within 24 hours',
      info_title: 'Tell me about your project',
      info_desc: 'Discuss your goals with me. You can also reach out via email:',
      name_label: 'Full Name',
      name_placeholder: 'Ozodbek Usmonqulov',
      email_label: 'Email',
      email_placeholder: 'info@gmail.com',
      phone_label: 'Phone',
      phone_field_label: 'Phone Number',
      phone_placeholder: '+998 (99) 999-99-99',
      telegram_label: 'Telegram',
      message_label: 'Message',
      message_placeholder: 'Briefly describe the project you want to create...',
      submit: 'Send Message',
      submitting: 'Sending...',
      success: 'Message sent successfully',
      error: 'An error occurred. Please try again.',
      server_error: 'Could not connect to server. Make sure the bot is running.',
    },
    admin: {
      dashboard: 'Dashboard',
      welcome: 'Welcome, Admin!',
      welcome_desc: 'Welcome to Ozodbek Usmonqulov portfolio control panel. System is fully operational.',
      status: 'System Status',
      status_active: 'Running (Active)',
      github: 'GitHub Connection',
      connected: 'Connected',
      not_connected: 'Not Connected',
      my_projects: 'My Projects',
      repos: 'GitHub Repositories',
      disconnect: 'Disconnect',
      logout: 'Logout',
      username_placeholder: 'Username',
      password_placeholder: 'Password',
    },
  },
};

export function getTranslation(locale: Locale): DeepRecord {
  return translations[locale];
}

export type TranslationKeys = keyof typeof translations.uz;
