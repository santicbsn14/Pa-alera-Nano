// src/components/home/ListaPrecios.tsx
import './Listaprecios.css'

const LINK_PRECIOS = 'https://docs.google.com/spreadsheets/d/1m2a2ziUqNsiMKjYGIbiziqVyq7RhAX4x/edit?usp=sharing'
export default function ListaPrecios() {
  return (
    <section className="precios-simple section" id="precios">
      <div className="container precios-simple__inner">

        <div className="precios-simple__texto">
          <div className="badge">Lista de precios</div>
          <h2 className="section-title">Precios <span>mayoristas</span></h2>
          <p className="precios-simple__desc">
            También podés consultar nuestra lista de precios en Excel formato (XLS). Siempre actualizada para ver o descargar.
          </p>
        </div>

        <a
  href={LINK_PRECIOS}
  target="_blank"
  rel="noopener noreferrer"
  className="precios-simple__btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Ver lista en excel
        </a>

      </div>
    </section>
  )
}