import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

// --- Данные ---
const NAV_LINKS = ['Главная', 'Мониторинг', 'Тарифы', 'FAQ', 'Контакты'];

type RateRow = {
  bank: string;
  plan: string;
  product: string;
  abonent: string;
  acquiring: string | null;
  salary: string | null;
  change: string;
  up: boolean | null;
  updated: string;
};

const RATES_DATA: RateRow[] = [
  { bank: 'Сбербанк', plan: 'Лёгкий старт', product: 'РКО', abonent: '0 ₽/мес', acquiring: '1.8%', salary: '0 ₽', change: 'Новый', up: null, updated: '2 мин назад' },
  { bank: 'Т-Банк', plan: 'Простой', product: 'РКО', abonent: '490 ₽/мес', acquiring: '1.59%', salary: 'бесплатно', change: '-0.1%', up: false, updated: '5 мин назад' },
  { bank: 'Альфа-Банк', plan: 'Бизнес Старт', product: 'РКО', abonent: '0 ₽/мес', acquiring: '2.0%', salary: '0 ₽', change: '+0.2%', up: true, updated: '18 мин назад' },
  { bank: 'ВТБ', plan: 'Стартовый', product: 'РКО', abonent: '0 ₽/мес', acquiring: '1.9%', salary: '0 ₽', change: '—', up: null, updated: '1 час назад' },
  { bank: 'Газпромбанк', plan: 'Базовый', product: 'РКО', abonent: '0 ₽/мес', acquiring: '1.7%', salary: '500 ₽', change: '-0.2%', up: false, updated: '3 мин назад' },
  { bank: 'Открытие', plan: 'Простой', product: 'РКО', abonent: '0 ₽/мес', acquiring: '1.8%', salary: 'бесплатно', change: '+0.1%', up: true, updated: '30 мин назад' },
  { bank: 'МСП Банк', plan: 'МСБ', product: 'РКО', abonent: '0 ₽/мес', acquiring: '1.6%', salary: '0 ₽', change: 'Новый', up: null, updated: '10 мин назад' },
  { bank: 'Промсвязь', plan: 'Бизнес 360', product: 'РКО', abonent: '790 ₽/мес', acquiring: '1.5%', salary: 'бесплатно', change: '+0.3%', up: true, updated: '45 мин назад' },
];

const TICKER_ITEMS = [
  { label: 'Ключевая ставка ЦБ', value: '21.00%', up: false },
  { label: 'Т-Банк эквайринг', value: '1.59%', up: false },
  { label: 'Сбер РКО', value: '0 ₽/мес', up: true },
  { label: 'Альфа зарплатный', value: '0 ₽', up: true },
  { label: 'ВТБ эквайринг', value: '1.90%', up: false },
  { label: 'Газпром абонент', value: '0 ₽/мес', up: true },
  { label: 'Открытие эквайринг', value: '1.80%', up: false },
  { label: 'Промсвязь РКО', value: '790 ₽/мес', up: false },
];

const PLANS = [
  {
    name: 'Старт',
    price: '490',
    period: '/мес',
    desc: 'Для ИП и малого бизнеса',
    features: ['До 15 банков', 'Мониторинг РКО и эквайринга', '3 уведомления в день', 'Еженедельный дайджест', 'Сравнение тарифов'],
    cta: 'Попробовать бесплатно',
    highlight: false,
  },
  {
    name: 'Бизнес',
    price: '1 490',
    period: '/мес',
    desc: 'Для растущих компаний',
    features: ['До 50 банков', 'РКО, эквайринг, зарплатный', 'Мгновенные уведомления', 'Ежедневный отчёт PDF', 'Telegram-бот', 'API доступ'],
    cta: 'Выбрать тариф',
    highlight: true,
  },
  {
    name: 'Корпоративный',
    price: '4 900',
    period: '/мес',
    desc: 'Для бухгалтеров и CFO',
    features: ['Все банки России', 'Все продукты РКО', 'Мультипользователь (10 чел.)', 'White-label отчёты', 'Выгрузка Excel/Google Sheets', 'Приоритетная поддержка'],
    cta: 'Связаться с нами',
    highlight: false,
  },
];

const FAQ_ITEMS = [
  {
    q: 'Какие продукты отслеживаются в рамках РКО?',
    a: 'Мы мониторим полный пакет РКО: абонентскую плату, стоимость платёжных поручений, эквайринг (торговый и интернет), зарплатный проект, кассовое обслуживание и бизнес-карты.',
  },
  {
    q: 'Как быстро приходят уведомления об изменении тарифа?',
    a: 'Система проверяет тарифы банков каждые 15 минут. При обнаружении изменения email-уведомление приходит в течение 1–2 минут.',
  },
  {
    q: 'Сколько банков отслеживается?',
    a: 'На тарифе "Бизнес" — 50 крупнейших банков, включая Сбер, Т-Банк, Альфа, ВТБ, Газпромбанк, Открытие, Промсвязьбанк и другие. На корпоративном — все банки с лицензией на РКО.',
  },
  {
    q: 'Можно ли сравнивать тарифы между банками?',
    a: 'Да, в разделе мониторинга есть встроенный сравнительный режим — можно выбрать до 5 банков и сравнить по любому параметру: абонентка, эквайринг, зарплатный.',
  },
  {
    q: 'Как отменить подписку?',
    a: 'Подписку можно отменить в личном кабинете в один клик. Деньги за неиспользованный период возвращаем в течение 3 рабочих дней.',
  },
];

const STATS = [
  { value: '87', suffix: '+', label: 'банков в базе' },
  { value: '12', suffix: 'K+', label: 'бизнесов следят' },
  { value: '99.8', suffix: '%', label: 'точность данных' },
  { value: '15', suffix: 'мин', label: 'интервал проверки' },
];

// --- Компоненты ---

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const num = parseFloat(value);
          const duration = 1200;
          const steps = 40;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = num * eased;
            setDisplay(Number.isInteger(num) ? Math.round(current).toString() : current.toFixed(1));
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="font-mono text-4xl font-bold text-gradient">
      {display}{suffix}
    </div>
  );
}

function Navbar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (label: string) => {
    setActive(label);
    setMobileOpen(false);
    const map: Record<string, string> = {
      'Главная': 'hero', 'Мониторинг': 'monitoring', 'Тарифы': 'pricing',
      'FAQ': 'faq', 'Контакты': 'contacts'
    };
    document.getElementById(map[label])?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card border-b py-3' : 'py-5'}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollTo('Главная')}>
          <div className="w-8 h-8 rounded-lg btn-primary-gradient flex items-center justify-center">
            <Icon name="TrendingUp" size={16} className="text-white relative z-10" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Rate<span className="text-gradient">Watch</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active === link
                  ? 'text-[#2D8FF4] bg-[#2D8FF4]/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {link}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="pulse-dot" />
            <span>Live</span>
          </div>
          <button className="btn-primary-gradient px-5 py-2.5 rounded-lg text-sm font-semibold">
            <span>Подключиться</span>
          </button>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Icon name={mobileOpen ? 'X' : 'Menu'} size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-card border-t mt-3 py-4">
          <div className="container mx-auto flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function TickerBar() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap bg-white/[0.03] border-y border-white/[0.06] py-2.5">
      <div className="ticker-inner gap-0">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mr-8">
            <span className="text-xs text-muted-foreground font-display">{item.label}</span>
            <span className={`text-xs font-mono font-semibold ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.value}
            </span>
            <span className={`text-xs ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.up ? '▲' : '▼'}
            </span>
            <span className="text-white/10 ml-4">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden bg-grid">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #2D8FF4 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-8 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #0ECAD4 0%, transparent 70%)' }} />

      <TickerBar />

      <div className="container mx-auto mt-16 mb-12 relative z-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border mb-8 animate-fade-up delay-100">
            <div className="pulse-dot" />
            <span className="text-xs font-medium text-muted-foreground">Мониторинг тарифов РКО в реальном времени</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.05] mb-6 animate-fade-up delay-200">
            Лучшее РКО
            <br />
            <span className="text-gradient">для вашего бизнеса.</span>
            <br />
            Первым узнавай.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10 animate-fade-up delay-300">
            Отслеживаем тарифы РКО, эквайринга и зарплатного проекта в 87+ банках. 
            Email-уведомление — когда условия меняются.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-up delay-400">
            <button className="btn-primary-gradient px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2">
              <span>Начать мониторинг</span>
              <Icon name="ArrowRight" size={18} className="relative z-10" />
            </button>
            <button className="px-8 py-4 rounded-xl text-base font-semibold glass-card glass-card-hover flex items-center gap-2 text-foreground">
              <Icon name="Play" size={16} />
              Смотреть демо
            </button>
          </div>

          <div className="flex flex-wrap gap-6 mt-12 animate-fade-up delay-500">
            {[
              { icon: 'Shield', text: '99.8% точность данных' },
              { icon: 'Zap', text: 'Уведомления за 2 минуты' },
              { icon: 'Lock', text: 'Банковская защита данных' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name={item.icon} size={15} className="text-[#2D8FF4]" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto pb-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
          {STATS.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="text-xs text-muted-foreground mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="divider-glow" />
    </section>
  );
}

const PRODUCT_ICONS: Record<string, string> = {
  'РКО': 'Building2',
  'Эквайринг': 'CreditCard',
  'Зарплатный': 'Users',
};

function MonitoringSection() {
  const [filter, setFilter] = useState('РКО');
  const filters = ['РКО', 'Эквайринг', 'Зарплатный'];

  return (
    <section id="monitoring" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #2D8FF4 0%, transparent 70%)' }} />

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-semibold text-[#2D8FF4] tracking-widest uppercase mb-3 block">
              Мониторинг
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight">
              Тарифы РКО онлайн
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md">
              Актуальные условия расчётно-кассового обслуживания. Обновляется каждые 15 минут.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === f ? 'btn-primary-gradient text-white' : 'glass-card hover:bg-white/10 text-muted-foreground'
                }`}
              >
                <Icon name={PRODUCT_ICONS[f]} size={14} className={filter === f ? 'relative z-10' : ''} />
                {filter === f ? <span>{f}</span> : f}
              </button>
            ))}
          </div>
        </div>

        {/* Таблица РКО */}
        {filter === 'РКО' && (
          <div className="glass-card rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-6 gap-3 px-6 py-4 border-b border-white/[0.06] text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span className="col-span-2">Банк / Тариф</span>
              <span className="text-center">Абонентка</span>
              <span className="text-center">Эквайринг</span>
              <span className="text-center">Зарплатный</span>
              <span className="text-right">Изменение</span>
            </div>
            {RATES_DATA.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-6 gap-3 px-6 py-4 items-center transition-all hover:bg-white/[0.03] cursor-pointer ${
                  i < RATES_DATA.length - 1 ? 'border-b border-white/[0.04]' : ''
                }`}
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl glass-card border flex items-center justify-center text-xs font-bold text-[#2D8FF4] flex-shrink-0">
                    {row.bank.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{row.bank}</p>
                    <p className="text-xs text-muted-foreground">{row.plan}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-center text-foreground">{row.abonent}</span>
                <span className="font-mono font-bold text-sm text-center text-[#0ECAD4]">
                  {row.acquiring ?? '—'}
                </span>
                <span className="font-mono text-sm text-center text-muted-foreground">
                  {row.salary ?? '—'}
                </span>
                <div className="flex justify-end">
                  {row.up === null ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                      {row.change}
                    </span>
                  ) : (
                    <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${row.up ? 'badge-up' : 'badge-down'}`}>
                      <Icon name={row.up ? 'TrendingUp' : 'TrendingDown'} size={11} />
                      {row.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Таблица Эквайринг */}
        {filter === 'Эквайринг' && (
          <div className="glass-card rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b border-white/[0.06] text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span className="col-span-2">Банк / Тариф</span>
              <span className="text-center">Торговый</span>
              <span className="text-center">Интернет</span>
              <span className="text-right">Обновлено</span>
            </div>
            {[
              { bank: 'Т-Банк', plan: 'Простой', trade: '1.59%', online: '2.19%', updated: '5 мин назад' },
              { bank: 'Сбербанк', plan: 'Лёгкий старт', trade: '1.80%', online: '2.50%', updated: '2 мин назад' },
              { bank: 'Альфа-Банк', plan: 'Бизнес Старт', trade: '2.00%', online: '2.70%', updated: '18 мин назад' },
              { bank: 'ВТБ', plan: 'Стартовый', trade: '1.90%', online: '2.40%', updated: '1 час назад' },
              { bank: 'Газпромбанк', plan: 'Базовый', trade: '1.70%', online: '2.30%', updated: '3 мин назад' },
              { bank: 'Открытие', plan: 'Простой', trade: '1.80%', online: '2.20%', updated: '30 мин назад' },
            ].map((row, i, arr) => (
              <div key={i} className={`grid grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-white/[0.03] cursor-pointer transition-all ${i < arr.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl glass-card border flex items-center justify-center text-xs font-bold text-[#2D8FF4] flex-shrink-0">
                    {row.bank.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{row.bank}</p>
                    <p className="text-xs text-muted-foreground">{row.plan}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-center text-[#0ECAD4]">{row.trade}</span>
                <span className="font-mono font-bold text-sm text-center text-foreground">{row.online}</span>
                <span className="text-xs text-muted-foreground text-right">{row.updated}</span>
              </div>
            ))}
          </div>
        )}

        {/* Таблица Зарплатный проект */}
        {filter === 'Зарплатный' && (
          <div className="glass-card rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b border-white/[0.06] text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span className="col-span-2">Банк / Тариф</span>
              <span className="text-center">Обслуживание</span>
              <span className="text-center">Перевод ЗП</span>
              <span className="text-right">Обновлено</span>
            </div>
            {[
              { bank: 'Т-Банк', plan: 'Простой', service: 'Бесплатно', transfer: '0 ₽', updated: '5 мин назад' },
              { bank: 'Сбербанк', plan: 'Лёгкий старт', service: 'Бесплатно', transfer: '0 ₽', updated: '2 мин назад' },
              { bank: 'Альфа-Банк', plan: 'Бизнес Старт', service: 'Бесплатно', transfer: '0 ₽', updated: '18 мин назад' },
              { bank: 'ВТБ', plan: 'Стартовый', service: 'Бесплатно', transfer: '0 ₽', updated: '1 час назад' },
              { bank: 'Газпромбанк', plan: 'Базовый', service: '500 ₽/мес', transfer: '15 ₽/чел', updated: '3 мин назад' },
              { bank: 'Промсвязь', plan: 'Бизнес 360', service: 'Бесплатно', transfer: '0 ₽', updated: '45 мин назад' },
            ].map((row, i, arr) => (
              <div key={i} className={`grid grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-white/[0.03] cursor-pointer transition-all ${i < arr.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl glass-card border flex items-center justify-center text-xs font-bold text-[#2D8FF4] flex-shrink-0">
                    {row.bank.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{row.bank}</p>
                    <p className="text-xs text-muted-foreground">{row.plan}</p>
                  </div>
                </div>
                <span className="font-mono text-sm text-center text-emerald-400">{row.service}</span>
                <span className="font-mono font-bold text-sm text-center text-foreground">{row.transfer}</span>
                <span className="text-xs text-muted-foreground text-right">{row.updated}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <div className="pulse-dot w-2 h-2" />
            Данные обновлены: {new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <button className="text-xs text-[#2D8FF4] hover:text-[#0ECAD4] transition-colors flex items-center gap-1.5">
            Показать все банки
            <Icon name="ChevronRight" size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2D8FF4]/[0.03] to-transparent" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#2D8FF4] tracking-widest uppercase mb-3 block">
            Тарифы
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl">
            Выберите план
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Первые 14 дней бесплатно на любом тарифе. Отмена в любой момент.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-[#2D8FF4]/20 to-[#2D8FF4]/5 border border-[#2D8FF4]/40 shadow-[0_0_60px_rgba(45,143,244,0.2)]'
                  : 'glass-card border glass-card-hover'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="btn-primary-gradient px-4 py-1 rounded-full text-xs font-bold text-white">
                    <span>Популярный</span>
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold text-4xl text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">₽{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm">
                    <Icon name="Check" size={15} className={plan.highlight ? 'text-[#0ECAD4]' : 'text-[#2D8FF4]'} />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                plan.highlight
                  ? 'btn-primary-gradient'
                  : 'glass-card border hover:bg-white/10 text-foreground'
              }`}>
                {plan.highlight ? <span>{plan.cta}</span> : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-28">
      <div className="divider-glow mb-28 -mt-28" />

      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-xs font-semibold text-[#2D8FF4] tracking-widest uppercase mb-3 block">
              FAQ
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-6">
              Часто задаваемые вопросы
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Не нашли ответ? Напишите нам — отвечаем в течение 2 часов в рабочие дни.
            </p>
            <button className="flex items-center gap-2 text-[#2D8FF4] text-sm font-semibold hover:text-[#0ECAD4] transition-colors">
              <Icon name="MessageCircle" size={16} />
              Написать в поддержку
            </button>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`glass-card border rounded-xl overflow-hidden transition-all duration-200 ${
                  open === i ? 'border-[#2D8FF4]/30' : ''
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-medium text-sm pr-4">{item.q}</span>
                  <Icon
                    name="ChevronDown"
                    size={16}
                    className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/[0.06] pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactsSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['РКО']);

  const products = [
    { id: 'РКО', icon: 'Building2', desc: 'Расчётный счёт и обслуживание' },
    { id: 'Эквайринг', icon: 'CreditCard', desc: 'Торговый и интернет' },
    { id: 'Зарплатный', icon: 'Users', desc: 'Зарплатный проект' },
    { id: 'Кассовое', icon: 'Banknote', desc: 'Кассовое обслуживание' },
  ];

  const toggleProduct = (p: string) => {
    setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="contacts" className="py-28 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #2D8FF4 0%, transparent 70%)' }} />

      <div className="divider-glow mb-28 -mt-28" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs font-semibold text-[#2D8FF4] tracking-widest uppercase mb-3 block">
            Контакты
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-4">
            Подключить уведомления
          </h2>
          <p className="text-muted-foreground mb-12">
            Укажите email и выберите продукты — будем присылать уведомления, когда тарифы изменятся.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl border p-8 text-left">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Email для уведомлений</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="buh@company.ru"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#2D8FF4]/50 transition-all"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-3">Какие продукты отслеживать?</label>
                <div className="grid grid-cols-2 gap-2">
                  {products.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                        selectedProducts.includes(p.id)
                          ? 'bg-[#2D8FF4]/15 border-[#2D8FF4]/50 text-foreground'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      <Icon name={p.icon} size={16} className={selectedProducts.includes(p.id) ? 'text-[#2D8FF4]' : ''} />
                      <div>
                        <p className={`text-xs font-semibold ${selectedProducts.includes(p.id) ? 'text-[#2D8FF4]' : ''}`}>{p.id}</p>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary-gradient w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                <span>Подключить уведомления</span>
                <Icon name="Bell" size={16} className="relative z-10" />
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Нажимая кнопку, вы соглашаетесь с условиями обработки данных. Отписаться можно в 1 клик.
              </p>
            </form>
          ) : (
            <div className="glass-card rounded-2xl border border-emerald-500/30 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-emerald-400" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-2">Готово!</h3>
              <p className="text-muted-foreground">
                Мы отправили письмо на <span className="text-foreground font-medium">{email}</span>.
                <br />Подтвердите email, чтобы начать получать уведомления.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
          {[
            { icon: 'Mail', label: 'Email', value: 'support@ratewatch.ru' },
            { icon: 'MessageSquare', label: 'Telegram', value: '@ratewatch_bot' },
            { icon: 'Clock', label: 'Поддержка', value: 'Пн–Пт, 9:00–18:00' },
          ].map((item, i) => (
            <div key={i} className="glass-card border rounded-xl px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2D8FF4]/10 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={16} className="text-[#2D8FF4]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md btn-primary-gradient flex items-center justify-center">
            <Icon name="TrendingUp" size={12} className="text-white relative z-10" />
          </div>
          <span className="font-display font-bold text-sm">Rate<span className="text-gradient">Watch</span></span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 RateWatch. Данные носят информационный характер.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
          <a href="#" className="hover:text-foreground transition-colors">Пользовательское соглашение</a>
        </div>
      </div>
    </footer>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState('Главная');

  useEffect(() => {
    const sections: Record<string, string> = {
      hero: 'Главная', monitoring: 'Мониторинг', pricing: 'Тарифы', faq: 'FAQ', contacts: 'Контакты'
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (sections[id]) setActiveSection(sections[id]);
          }
        });
      },
      { threshold: 0.4 }
    );
    Object.keys(sections).forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f18] text-foreground">
      <Navbar active={activeSection} setActive={setActiveSection} />
      <HeroSection />
      <MonitoringSection />
      <PricingSection />
      <FAQSection />
      <ContactsSection />
      <Footer />
    </div>
  );
}