import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const next = i18n.language.startsWith('ru') ? 'en' : 'ru';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      className="lang-toggle"
      aria-label="Switch language"
    >
      {next === 'ru' ? 'РУ' : 'EN'}
    </button>
  );
}