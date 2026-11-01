import { useState } from 'react'
import { SITE } from '../data/site.js'

/* Impressum and Datenschutz are a legal requirement in Switzerland
   (revDSG). Kept as an in-page panel rather than separate routes —
   this is a single-page site and a router for two static texts is
   more machinery than the content deserves. */
const LEGAL = {
  impressum: {
    title: 'Impressum',
    body: [
      ['Verantwortlich für den Inhalt', `${SITE.name}, ${SITE.location}, ${SITE.country}`],
      ['Kontakt', SITE.email],
      ['Bildrechte', `Sämtliche Fotografien und Filme auf dieser Seite stammen von ${SITE.name} und sind urheberrechtlich geschützt. Eine Nutzung, Vervielfältigung oder Bearbeitung ohne schriftliche Zustimmung ist nicht gestattet.`],
    ],
  },
  datenschutz: {
    title: 'Datenschutz',
    body: [
      ['Grundsatz', 'Diese Seite erhebt so wenig Daten wie möglich. Es werden keine Cookies gesetzt, kein Tracking eingebunden und keine Analysedienste verwendet.'],
      ['Kontaktformular', 'Das Formular sendet nichts an einen Server. Es stellt aus deinen Eingaben eine E-Mail zusammen und öffnet dein eigenes Mailprogramm. Die Daten verlassen deinen Rechner erst, wenn du die Nachricht selbst abschickst.'],
      ['Schriften', 'Die Schrift Archivo wird von Google Fonts geladen. Dabei übermittelt dein Browser deine IP-Adresse an Google. Rechtsgrundlage ist das berechtigte Interesse an einer einheitlichen Darstellung.'],
      ['Hosting', 'Die Seite liegt bei GitHub Pages. Beim Aufruf werden technisch notwendige Verbindungsdaten verarbeitet.'],
      ['Deine Rechte', `Nach dem revidierten Datenschutzgesetz hast du Anspruch auf Auskunft, Berichtigung und Löschung. Schreib dafür an ${SITE.email}.`],
    ],
  },
}

export default function Footer() {
  const [panel, setPanel] = useState(null)
  const doc = panel ? LEGAL[panel] : null

  return (
    <footer className="border-t border-rule px-5 md:px-10 py-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="display display-m text-ink" style={{ fontSize: '1.125rem' }}>
              {SITE.name}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink3">
              Fotografie und Film, {SITE.location}
            </p>
          </div>

          <nav aria-label="Weitere Links" className="flex flex-wrap gap-x-7 gap-y-2">
            <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noreferrer"
              className="text-[0.9375rem] text-ink2 hover:text-ink transition-colors inline-flex items-center min-h-[44px]">Instagram</a>
            <a href={`mailto:${SITE.email}`}
              className="text-[0.9375rem] text-ink2 hover:text-ink transition-colors inline-flex items-center min-h-[44px]">Mail</a>
            {Object.keys(LEGAL).map(k => (
              <button key={k} onClick={() => setPanel(p => p === k ? null : k)}
                aria-expanded={panel === k}
                className="text-[0.9375rem] text-ink2 hover:text-ink transition-colors inline-flex items-center min-h-[44px]">
                {LEGAL[k].title}
              </button>
            ))}
          </nav>
        </div>

        {doc && (
          <div className="mt-8 border-t border-rule pt-8 max-w-prose">
            <h2 className="display display-m text-ink" style={{ fontSize: '1.25rem' }}>
              {doc.title}
            </h2>
            <dl className="mt-4 space-y-4">
              {doc.body.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[0.8125rem] text-ink3">{k}</dt>
                  <dd className="mt-0.5 text-[0.9375rem] leading-relaxed text-ink2">{v}</dd>
                </div>
              ))}
            </dl>
            <button onClick={() => setPanel(null)}
              className="mt-5 text-[0.9375rem] text-ink underline underline-offset-4">
              Schliessen
            </button>
          </div>
        )}

        <p className="mt-10 text-[0.8125rem] text-ink3">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  )
}
