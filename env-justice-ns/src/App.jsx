import { useEffect, useState } from 'react'
import bundled from '../server/data.json'
import './App.css'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'figures', label: 'Key figures' },
  { id: 'pathways', label: 'Pathways' },
  { id: 'food', label: 'Food & exposure' },
  { id: 'health', label: 'Health context' },
  { id: 'justice', label: 'Environmental justice' },
  { id: 'sites', label: 'Example sites' },
  { id: 'action', label: 'Response & gaps' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'sources', label: 'Sources' },
]

function apiContentUrl() {
  const b = import.meta.env.BASE_URL ?? '/'
  const path = 'api/content'
  if (b === '/' || b === '') return `/${path}`
  // BASE_URL is usually '/' or '/repo-name/' from Vite; './' for relative base
  return `${b.endsWith('/') ? b : `${b}/`}${path}`.replace(/([^:]\/)\/+/g, '$1')
}

async function fetchContent(signal) {
  const r = await fetch(apiContentUrl(), { signal })
  if (!r.ok) throw new Error('bad response')
  return /** @type {typeof bundled} */ (await r.json())
}

function useSiteContent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const ac = new AbortController()
    fetchContent(ac.signal)
      .then((json) => {
        setData(json)
      })
      .catch(() => {
        if (ac.signal.aborted) return
        setData(bundled)
      })
    return () => ac.abort()
  }, [])

  return { data }
}

export default function App() {
  const { data } = useSiteContent()
  const [activeId, setActiveId] = useState('overview')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id)
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0 }
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [data])

  if (!data) {
    return (
      <div className="app">
        <header className="site-header">
          <div className="site-header__inner">
            <h1>Ponhook Lake mine tailings</h1>
            <div className="loading-bar" aria-hidden />
            <p className="tagline">Loading briefing on arsenic, mercury, and environmental justice in Mi’kma’ki…</p>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <h1>{data.meta.title}</h1>
          <p className="tagline">{data.meta.subtitle}</p>
        </div>
      </header>

      <aside className="toc" aria-label="Page sections">
        <nav>
          <h2>On this page</h2>
          <ul>
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={activeId === id ? 'true' : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="main-col">
        <section id="overview" className="doc-section" aria-labelledby="h-overview">
          <h2 id="h-overview">Overview</h2>
          <p className="lede">
            Historic gold mining around Molega and Ponhook lake left mine tailings containing high amounts of arsenic and mercury. 
            Many years later, these tailings continue to interract with and contaminate the ecosystem and the people who live in the area.
          </p>
          <div className="prose">
            <p>
              Gold was found at Molega in 1886 and the settlement grew rapidly.
              The operation ran a 20-stamp mill on Ponhook and dominated production during the boom
              years.
            </p>
            <p>
              Arsenic is found with gold in arsenopyrite-bearing quartz. Mine operations
              expose fresh mineral surfaces, accelerating release of this. Amalgam formed in gold mining operations
              created methylmercury, which is hazardous for wildlife in the area, and can work its way up the food chain.
            </p>
            <p className="meta-line" style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
              {data.meta.credits ? `${data.meta.credits} ` : ''}
              Last content update: {data.meta.updated}
            </p>
          </div>
        </section>

        <section id="figures" className="doc-section" aria-labelledby="h-figures">
          <h2 id="h-figures">Key figures</h2>
          <p className="prose">
            Below are a few key figures that tell the story of the effects these mine tailings had on the surounding environment.
          </p>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Indicator</th>
                  <th scope="col">Value</th>
                  <th scope="col">Context</th>
                </tr>
              </thead>
              <tbody>
                {data.keyFigures.map((row, i) => (
                  <tr key={`kf-${i}`}>
                    <td>{row.label}</td>
                    <td className="num">{row.value}</td>
                    <td>{row.note}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="pathways" className="doc-section" aria-labelledby="h-pathways">
          <h2 id="h-pathways">Pathways</h2>
          <p className="prose">
            There are several ways arsenic and mercury can contaminate people and wildlife in the area. Outlined below are the most
            common ways that humans or wildlife are exposed to these contaminants.
          </p>
          <div className="path-grid">
            {data.pathways.map((p) => (
              <article key={p.route} className="path-card">
                <h4>{p.route}</h4>
                <p>{p.detail}</p>
              </article>
            ))}
          </div>
          <h3>Arsenic vs. mercury (side-by-side)</h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Topic</th>
                  <th scope="col">Arsenic</th>
                  <th scope="col">Mercury</th>
                </tr>
              </thead>
              <tbody>
                {(data.pathwayComparison ?? []).map((row, i) => (
                  <tr key={`pc-${i}`}>
                    <td>{row.col1}</td>
                    <td>{row.col2}</td>
                    <td>{row.col3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="food" className="doc-section" aria-labelledby="h-food">
          <h2 id="h-food">Food &amp; exposure</h2>
          <div className="prose">
            <p>
              Ponhook lake is a popular fishing, hunting, and camping area. Toxic metals accumulate in the plants and animals
              near the dumping sites, those harvesting these resources could leave themselves at risk of exposure to these contaminants.
            </p>
            <p>
              Freshwater bodies linked to these mines can hold methylmercury, which canbe harmful to humans and wildlife.
              Humans ingest the contaminant by eating fish from these bodies. Adults may face lower acute
              poisoning risk from ingesting the metals, while unborn children and young children are more vulnerable, and the risk
              of harming their nervous system is higher.
            </p>
            <p>
              Many wells and lakes in the area have been found to contain arsenic levels above the safe limit. While drinking is still
              the primary form of contamination through water, it is also possible to be affected by bathing or swimming in arsenic 
              contaminated water.
            </p>
          </div>
          <div className="callout callout--warn" role="note">
            <strong>Ecological stakes.</strong> Tailings are threatening to than humans and their health. They also affect the entire ecosystem
            and will continue to harm wildlife and plants for years to come. These tailings are more than one hundred years old and are still
            showing very toxic levels of arsenic and mercury, which will continue to harm the environment in the area.
              
          </div>
        </section>

        <section id="health" className="doc-section" aria-labelledby="h-health">
          <h2 id="h-health">Health context (summary)</h2>
          <p className="prose">
            Below are the effects that these toxic metals can have on humans. From different levels of exposure,
            to different age groups, these contaminants can have diverse effcts, which we have outlined.
            
          </p>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Agent / scenario</th>
                  <th scope="col">Health effects (summary)</th>
                  <th scope="col">Exposure notes</th>
                </tr>
              </thead>
              <tbody>
                {data.healthNotes.map((h, i) => (
                  <tr key={`hn-${i}`}>
                    <td>{h.agent}</td>
                    <td>{h.effects}</td>
                    <td>{h.exposure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="justice" className="doc-section" aria-labelledby="h-justice">
          <h2 id="h-justice">Environmental justice framing</h2>
          <ul className="prose">
            {data.ejFraming.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section id="action" className="doc-section" aria-labelledby="h-action">
          <h2 id="h-action">What is being done</h2>
          <p className="prose">
            In summary, there is not much being done. There are some small health assessments being done, the public
            findings are very vague and not accurate towards the actual state of the problem. Most solutions require residents to perform their own test
            to see if they are at risk of ingesting toxins.
          </p>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Topic</th>
                  <th scope="col">Measure or finding</th>
                </tr>
              </thead>
              <tbody>
                {(data.dueDiligence ?? []).map((row, i) => (
                  <tr key={`dd-${i}`}>
                    <td>{row.col1}</td>
                    <td>{row.col2}</td>
                    <td>{row.col3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="glossary" className="doc-section" aria-labelledby="h-glossary">
          <h2 id="h-glossary">Glossary</h2>
          <div className="glossary prose">
            <dl>
              {(data.glossary ?? []).map((entry) => (
                <div key={entry.term}>
                  <dt>{entry.term}</dt>
                  <dd>{entry.definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="sources" className="doc-section" aria-labelledby="h-sources">
          <h2 id="h-sources">Sources &amp; further reading</h2>
          <ul className="resource-list">
            {data.resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {r.title}
                </a>
                <span className="pub">{r.publisher}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
