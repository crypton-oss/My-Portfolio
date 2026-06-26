import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CheckCircle, Mail, MessageSquare, Phone, Send, XCircle } from "lucide-react";
import { useT } from "../i18n/LocaleContext";
import { siteConfig } from "../config/site";
import "./ContactSection.css";
type ContactSectionProps = {
  visible: boolean;
  theme: "dark" | "light";
  style?: React.CSSProperties;
};
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.2 },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
export default function ContactSection({ theme, style }: ContactSectionProps) {
  const { t } = useT()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${siteConfig.botUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setToast({ type: "success", message: t("contact.success") });
      } else {
        setToast({ type: "error", message: body.error || t("contact.error") });
      }
    } catch {
      setToast({ type: "error", message: t("contact.server_error") });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 4500);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  return (
    <>
    <section
      id="contact"
      className={`contact-section contact-section--${theme}`}
      style={style}
    >
      {" "}
      <div className="contact-bg-glow" />{" "}
      <div className="contact-container">
        {" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="contact-heading"
        >
          {" "}
          <div className="contact-heading__badge">
            {" "}
            <span className="contact-heading__badge-dot" /> {t('contact.badge')}{" "}
          </div>{" "}
          <h2 className="contact-heading__title">
            {t('contact.heading')}
          </h2>{" "}
          <p className="contact-heading__desc">
            {" "}
            {t('contact.desc')}{" "}
          </p>{" "}
        </motion.div>{" "}
        <div className="contact-card">
          {" "}
          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="contact-form"
            aria-label="Contact form"
          >
            {" "}
            {/* Left column — info */}{" "}
            <motion.div variants={itemVariants} className="contact-info">
              {" "}
              <motion.div
                variants={itemVariants}
                className="contact-info__pill"
                aria-hidden="true"
              >
                {" "}
                <span className="contact-info__pill-dot" /> {t('contact.pill')}{" "}
              </motion.div>{" "}
              <div className="contact-info__text">
                {" "}
                  <h3 className="contact-info__title">
                    {t('contact.info_title')}
                  </h3>{" "}
                  <p className="contact-info__desc">
                    {" "}
                    {t('contact.info_desc')}{" "}
                    <a
                    href="mailto:ozodbekusmonqulov7777@gmail.com"
                    className="contact-info__link"
                  >
                    {" "}
                    ozodbekusmonqulov7777@gmail.com{" "}
                  </a>{" "}
                </p>{" "}
              </div>{" "}
              <div className="contact-info__cards">
                {" "}
                <div className="contact-info-card">
                  {" "}
                  <Mail
                    className="contact-info-card__icon"
                    aria-hidden="true"
                  />{" "}
                  <div>
                    {" "}
                    <p className="contact-info-card__label">{t('contact.email_label')}</p>{" "}
                    <p>ozodbekusmonqulov7777@gmail.com</p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="contact-info-card">
                  {" "}
                  <Phone
                    className="contact-info-card__icon"
                    aria-hidden="true"
                  />{" "}
                  <div>
                    {" "}
                    <p className="contact-info-card__label">{t('contact.phone_label')}</p>{" "}
                    <p>+998 (95) 254-98-86</p>{" "}
                  </div>{" "}
                </div>{" "}
                   <div className="contact-info-card">
                  {" "}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="contact-info-card__icon" aria-hidden="true" width="24" height="24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>{" "}
                  <div>
                    {" "}
                    <p className="contact-info-card__label">{t('contact.telegram_label')}</p>{" "}
                    <p>@anonim_crypton</p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* Right column — form fields */}{" "}
            <motion.div variants={itemVariants} className="contact-fields">
              {" "}
              <div className="contact-fields__row">
                {" "}
                <div className="contact-field-group">
                  {" "}
                  <label htmlFor="name" className="contact-field-label">
                    {t('contact.name_label')}
                  </label>{" "}
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('contact.name_placeholder')}
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-input"
                    required
                  />{" "}
                </div>{" "}
                <div className="contact-field-group">
                  {" "}
                  <label htmlFor="email" className="contact-field-label">
                    {t('contact.email_label')}
                  </label>{" "}
                  <div className="contact-input-wrap">
                    {" "}
                    <Mail
                      className="contact-input-icon"
                      aria-hidden="true"
                    />{" "}
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('contact.email_placeholder')}
                      value={formData.email}
                      onChange={handleChange}
                      className="contact-input contact-input--icon"
                      autoComplete="email"
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="contact-field-group">
                {" "}
                <label htmlFor="phone" className="contact-field-label">
                  {t('contact.phone_field_label')}
                </label>{" "}
                <div className="contact-input-wrap">
                  {" "}
                  <Phone
                    className="contact-input-icon"
                    aria-hidden="true"
                  />{" "}
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t('contact.phone_placeholder')}
                    value={formData.phone}
                    onChange={handleChange}
                    className="contact-input contact-input--icon"
                    autoComplete="tel"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="contact-field-group">
                {" "}
                <label htmlFor="message" className="contact-field-label">
                  {t('contact.message_label')}
                </label>{" "}
                <div className="contact-input-wrap">
                  {" "}
                  <MessageSquare
                    className="contact-input-icon contact-input-icon--top"
                    aria-hidden="true"
                  />{" "}
                  <textarea
                    id="message"
                    name="message"
                    placeholder={t('contact.message_placeholder')}
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-input contact-input--icon contact-input--textarea"
                    rows={5}
                    required
                  />{" "}
                </div>{" "}
              </div>{" "}
              <motion.div variants={itemVariants}>
                {" "}
                <button type="submit" className="contact-submit" disabled={submitting}>
                  {" "}
                  {submitting ? (
                    <span className="contact-submit__spinner" />
                  ) : (
                    <Send className="contact-submit__icon" aria-hidden="true" />
                  )}
                  <span>{submitting ? t('contact.submitting') : t('contact.submit')}</span>{" "}
                </button>{" "}
              </motion.div>{" "}
              {/* <p className="contact-privacy">
                {" "}
                Formani yuborish orqali siz{" "}
                <a href="#" className="contact-privacy__link">
                  {" "}
                  maxfiylik siyosati{" "}
                </a>{" "}
                ga rozilik bildirasiz.{" "}
              </p>{" "} */}
            </motion.div>{" "}
          </motion.form>{" "}
        </div>{" "}
      </div>{" "}
    </section>
      {toast && (
        <div className={`contact-toast contact-toast--${toast.type} contact-toast--visible`} role="alert">
          {toast.type === "success" ? (
            <CheckCircle className="contact-toast__icon" />
          ) : (
            <XCircle className="contact-toast__icon" />
          )}
          {toast.message}
        </div>
      )}
    </>
  );
}
