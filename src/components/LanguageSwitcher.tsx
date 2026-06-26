import { useState, useRef, useEffect } from 'react';
import { useT } from '../i18n/LocaleContext';
import { localeNames, type Locale } from '../i18n/translations';
import uzFlag from 'flag-icons/flags/4x3/uz.svg';
import ruFlag from 'flag-icons/flags/4x3/ru.svg';
import usFlag from 'flag-icons/flags/4x3/us.svg';
import './LanguageSwitcher.css';

const flagSrc: Record<Locale, string> = { uz: uzFlag, ru: ruFlag, en: usFlag };

export default function LanguageSwitcher() {
  const { locale, setLocale } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const locales = Object.entries(localeNames) as [Locale, { label: string; flag: string }][];

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-switcher__btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch language"
      >
        <img src={flagSrc[locale]} alt="" className="lang-switcher__current" />
      </button>

      <div className={`lang-switcher__drop ${open ? 'lang-switcher__drop--open' : ''}`}>
        {locales.map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            className={`lang-switcher__option ${locale === key ? 'lang-switcher__option--active' : ''}`}
            onClick={() => { setLocale(key); setOpen(false); }}
          >
            <img src={flagSrc[key]} alt="" className="lang-switcher__flag" />
            <span className="lang-switcher__label">{label}</span>
            {locale === key && (
              <svg className="lang-switcher__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
