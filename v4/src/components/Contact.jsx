import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

function Field({ label, name, type = 'text', placeholder, value, onChange, multiline }) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-[9px] tracking-[0.22em]
        text-fg2 uppercase mb-2">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        type={multiline ? undefined : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={multiline ? 4 : undefined}
        required
        className="w-full bg-transparent border-b border-border text-fg font-display text-sm
          placeholder:text-fg2/35 focus:outline-none focus:border-fg/60
          transition-colors py-3 resize-none"
      />
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const btnRef = useRef(null)
  const [mag, setMag] = useState({ x: 0, y: 0 })

  const onMove = (e) => {
    const r = btnRef.current.getBoundingClientRect()
    setMag({
      x: (e.clientX - r.left - r.width  / 2) * 0.28,
      y: (e.clientY - r.top  - r.height / 2) * 0.28,
    })
  }

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    // Kein Backend — öffnet den Mail-Client mit vorbefülltem Text
    const subject = encodeURIComponent(`Anfrage von ${form.name}`)
    const body    = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`)
    window.location.href = `mailto:hallo@raw-capture-by.com?subject=${subject}&body=${body}`
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="contact" className="pt-24 md:pt-32 px-6 md:px-10 border-t border-border">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-8 h-px bg-fg2/40" />
        <p className="section-label">Kontakt</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-14 lg:gap-24">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(36px,5.5vw,68px)] font-bold tracking-tighter
              text-fg leading-[0.94] mb-8"
          >
            Zusammen<br /><span className="text-fg2">arbeiten</span>
          </motion.h2>

          <p className="font-display text-[15px] text-fg2 leading-relaxed max-w-md mb-10">
            Anfragen für Shootings, Events, Konzerte oder Videoprojekte — am besten
            per Mail oder direkt über Instagram.
          </p>

          <div className="space-y-1">
            {[
              ['Instagram', '@raw_capture_by',          'https://instagram.com/raw_capture_by'],
              ['Mail',      'hallo@raw-capture-by.com', 'mailto:hallo@raw-capture-by.com'],
              ['Web',       'raw-capture-by.com',       'https://raw-capture-by.com'],
              ['Standort',  'St. Gallen, Schweiz',      null],
            ].map(([label, value, href]) => (
              <div key={label} className="flex items-baseline gap-5 border-b border-border py-3.5">
                <span className="font-mono text-[9px] tracking-[0.2em] text-fg2 uppercase w-24 shrink-0">
                  {label}
                </span>
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="font-display text-sm text-fg hover:text-fg2 transition-colors">
                    {value} <span className="text-fg2">→</span>
                  </a>
                ) : (
                  <span className="font-display text-sm text-fg">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-7"
        >
          <Field label="Name"  name="name"  placeholder="Dein Name" value={form.name} onChange={set} />
          <Field label="Mail"  name="email" type="email" placeholder="deine@mail.ch" value={form.email} onChange={set} />
          <Field label="Nachricht" name="message" placeholder="Erzähl mir von deinem Projekt…"
            value={form.message} onChange={set} multiline />

          <button
            ref={btnRef}
            type="submit"
            onMouseMove={onMove}
            onMouseLeave={() => setMag({ x: 0, y: 0 })}
            style={{ transform: `translate(${mag.x}px, ${mag.y}px)` }}
            className="magnetic font-mono text-[10px] tracking-[0.24em] text-bg uppercase
              bg-fg px-9 py-4 hover:bg-accent transition-colors mt-2"
          >
            {sent ? 'Mail geöffnet ✓' : 'Nachricht senden →'}
          </button>
        </motion.form>
      </div>

      <footer className="mt-24 md:mt-32 py-7 border-t border-border
        flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[9px] tracking-[0.18em] text-fg2/60 uppercase">
          © {new Date().getFullYear()} raw_capture_by · Livio Raschle · St. Gallen
        </p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-mono text-[9px] tracking-[0.18em] text-fg2 hover:text-fg
            transition-colors uppercase">
          ↑ Nach oben
        </button>
      </footer>
    </section>
  )
}
