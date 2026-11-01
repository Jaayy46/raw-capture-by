import { SERVICES } from '../data/site.js'

export default function Services() {
  const go = () => document.getElementById('anfrage')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="leistungen" className="px-5 md:px-10 py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="max-w-prose">
          <h2 className="display display-l text-ink">Was ich mache</h2>
          <p className="lede mt-4">
            Erzähl mir einfach, was dir vorschwebt. Dann finden wir zusammen heraus,
            was dafür Sinn macht — und was es kostet.
          </p>
        </div>

        <div className="mt-10 border-t border-rule">
          {SERVICES.map(s => (
            <article key={s.title}
              className="border-b border-rule py-8 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-4 md:gap-10">
              <div>
                <h3 className="display display-m text-ink">{s.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] text-ink3">Für {s.for}</p>
              </div>
              <div className="max-w-prose">
                <p className="text-[0.9375rem] leading-relaxed text-ink2">{s.body}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink">{s.deliver}</p>
              </div>
            </article>
          ))}
        </div>

        <button onClick={go}
          className="mt-10 bg-ink text-paper text-[0.9375rem] font-medium
            px-7 py-3.5 hover:bg-ink2 transition-colors">
          Projekt anfragen
        </button>
      </div>
    </section>
  )
}
