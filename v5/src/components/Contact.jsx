import { useState, useRef } from 'react'
import { SITE, PROJECT_TYPES, BUDGETS } from '../data/site.js'

const EMPTY = { name: '', email: '', type: '', date: '', place: '', budget: '', message: '' }

function Field({ label, name, hint, error, children }) {
  return (
    <div>
      <label htmlFor={name} className="block text-[0.9375rem] text-ink mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[0.8125rem] text-ink3">{hint}</p>}
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-[0.8125rem] text-ink font-medium">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (bad) =>
  `w-full bg-paper border px-3.5 py-3 text-[0.9375rem] text-ink
   placeholder:text-ink3 transition-colors
   ${bad ? 'border-ink' : 'border-rule hover:border-ink2 focus:border-ink'}`

export default function Contact() {
  const [form, setForm]   = useState(EMPTY)
  const [errors, setErr]  = useState({})
  const [sent, setSent]   = useState(false)
  const firstBad = useRef(null)

  const set = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErr(x => ({ ...x, [e.target.name]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Bitte sag mir, wie du heisst.'
    if (!form.email.trim()) e.email = 'Ohne Adresse kann ich nicht antworten.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Diese Adresse sieht nicht vollständig aus.'
    if (!form.type)             e.type    = 'Wähl aus, worum es geht.'
    if (form.message.trim().length < 10)
      e.message = 'Ein, zwei Sätze zum Vorhaben helfen mir weiter.'
    return e
  }

  const submit = (e) => {
    e.preventDefault()
    const found = validate()
    setErr(found)
    if (Object.keys(found).length) {
      const el = document.getElementById(Object.keys(found)[0])
      el?.focus()
      return
    }

    const subject = `Anfrage: ${form.type} — ${form.name}`
    const body = [
      form.message, '',
      `Art des Projekts: ${form.type}`,
      form.date   && `Datum: ${form.date}`,
      form.place  && `Ort: ${form.place}`,
      form.budget && `Budget: ${form.budget}`,
      '', form.name, form.email,
    ].filter(Boolean).join('\n')

    window.location.href =
      `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section id="anfrage" className="px-5 md:px-10 py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1500px] grid lg:grid-cols-2 gap-10 lg:gap-16">

        <div>
          <h2 className="display display-l text-ink">Projekt anfragen</h2>
          <p className="lede mt-4">
            Erzähl mir kurz, was du vorhast. Ich melde mich innerhalb von zwei
            Tagen mit einer Einschätzung und einem Preis.
          </p>

          <dl className="mt-10 border-t border-rule">
            {[
              ['Mail', SITE.email, `mailto:${SITE.email}`],
              ['Instagram', `@${SITE.instagram}`, `https://instagram.com/${SITE.instagram}`],
              ['Unsplash', SITE.unsplash, null],
              ['Standort', `${SITE.location}, ${SITE.country}`, null],
            ].map(([k, v, href]) => (
              <div key={k} className="flex items-baseline gap-5 border-b border-rule py-3.5">
                <dt className="text-[0.8125rem] text-ink3 w-24 shrink-0">{k}</dt>
                <dd className="text-[0.9375rem] text-ink2">
                  {href
                    ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer" className="hover:text-ink underline underline-offset-4
                          decoration-rule hover:decoration-ink transition-colors
                          inline-flex items-center min-h-[44px]">{v}</a>
                    : v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" name="name" error={errors.name}>
              <input id="name" name="name" value={form.name} onChange={set}
                autoComplete="name" placeholder="Dein Name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={inputCls(errors.name)} />
            </Field>

            <Field label="Mail" name="email" error={errors.email}>
              <input id="email" name="email" type="email" value={form.email} onChange={set}
                autoComplete="email" placeholder="du@beispiel.ch"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={inputCls(errors.email)} />
            </Field>
          </div>

          <Field label="Art des Projekts" name="type" error={errors.type}>
            <select id="type" name="type" value={form.type} onChange={set}
              aria-invalid={!!errors.type}
              aria-describedby={errors.type ? 'type-error' : undefined}
              className={inputCls(errors.type)}>
              <option value="">Bitte wählen</option>
              {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Datum" name="date" hint="Wenn schon bekannt">
              <input id="date" name="date" type="date" value={form.date} onChange={set}
                className={inputCls(false)} />
            </Field>
            <Field label="Ort" name="place" hint="Wenn schon bekannt">
              <input id="place" name="place" value={form.place} onChange={set}
                placeholder="z. B. Zürich" className={inputCls(false)} />
            </Field>
          </div>

          <Field label="Budgetrahmen" name="budget" hint="Optional — hilft mir, realistisch zu planen">
            <select id="budget" name="budget" value={form.budget} onChange={set}
              className={inputCls(false)}>
              <option value="">Keine Angabe</option>
              {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>

          <Field label="Nachricht" name="message" error={errors.message}>
            <textarea id="message" name="message" rows={5} value={form.message} onChange={set}
              placeholder="Was hast du vor?"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className={`${inputCls(errors.message)} resize-y`} />
          </Field>

          <button type="submit"
            className="bg-ink text-paper text-[0.9375rem] font-medium
              px-7 py-3.5 hover:bg-ink2 transition-colors">
            Anfrage senden
          </button>

          <div aria-live="polite">
            {sent && (
              <div className="border border-rule bg-paper2 p-4">
                <p className="text-[0.9375rem] text-ink">
                  Dein Mailprogramm sollte sich jetzt mit der fertigen Nachricht
                  geöffnet haben. Du musst sie dort nur noch abschicken.
                </p>
                <p className="mt-2 text-[0.8125rem] text-ink2">
                  Ist nichts passiert? Dann schreib direkt an{' '}
                  <a href={`mailto:${SITE.email}`}
                    className="text-ink underline underline-offset-4">{SITE.email}</a>.
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
