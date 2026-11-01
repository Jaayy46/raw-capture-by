import { CATEGORIES } from '../data/photos.js'
import { SITE, GEAR } from '../data/site.js'

const portrait = CATEGORIES.find(c => c.id === 'landschaft').photos[0]

export default function About() {
  return (
    <section id="ueber" className="bg-paper2 px-5 md:px-10 py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1500px] grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]
        gap-10 lg:gap-16 items-start">

        <div>
          <h2 className="display display-l text-ink">Über mich</h2>

          <div className="mt-5 max-w-prose space-y-4 text-[1rem] leading-relaxed text-ink2">
            <p>
              Ich bin {SITE.first}, 21, und wohne im {SITE.location}. Angefangen hat
              alles vor etwa drei Jahren, als ich spontan eine Kamera in die Hand
              gedrückt bekommen habe. Ziemlich schnell habe ich gemerkt, wie sehr mich
              das interessiert — und wie viel Spass es macht, Momente einzufangen
              und Erinnerungen festzuhalten.
            </p>
            <p>
              Sonnenauf- und -untergänge sind etwas vom Schönsten überhaupt. Darum
              gebe ich mir Mühe, mich auch mal früh aus dem Bett zu holen, damit ich
              die Morgenstunden nicht verpasse.
            </p>
            <p>
              Auf ein Thema festlegen wollte ich mich nie. Konzerte, Motorsport,
              Wildlife, Street, Architektur — was mich interessiert, nehme ich mit.
              Für Aufträge und längere Projekte bin ich erreichbar.
            </p>
          </div>

          <h3 className="display display-m text-ink mt-10" style={{ fontSize: '1.125rem' }}>
            Ausrüstung
          </h3>
          <ul className="mt-3 space-y-1.5 text-[0.9375rem] text-ink2">
            {GEAR.map(g => <li key={g}>{g}</li>)}
          </ul>
        </div>

        <figure className="m-0">
          <img
            src={`/media/full/${portrait.file}.webp`}
            alt={portrait.caption}
            loading="lazy" decoding="async"
            className="w-full aspect-[4/5] object-cover bg-paper"
          />
          <figcaption className="mt-3 text-[0.8125rem] text-ink3">
            {portrait.caption}. Noch kein Portrait von mir — kommt.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
