// src/components/home/PreguntasFrecuentes.tsx
import { useState } from 'react'
import { mockPreguntas } from '../../data/mocks'
import './PreguntasFrecuentes.css'

export default function PreguntasFrecuentes() {
  const [abierta, setAbierta] = useState<string | null>(null)

  const toggle = (id: string) => {
    setAbierta((prev) => (prev === id ? null : id))
  }

  return (
    <section className="faq section section-alt" id="faq">
      <div className="container">

        <div className="badge">Dudas frecuentes</div>
        <h2 className="section-title">Preguntas <span>frecuentes</span></h2>
        <p className="section-subtitle">Todo lo que necesitás saber antes de hacer tu primer pedido.</p>

        <div className="faq__lista">
          {mockPreguntas.map((p) => (
            <div
              key={p._id}
              className={`faq__item ${abierta === p._id ? 'faq__item--open' : ''}`}
            >
              <button
                className="faq__pregunta"
                onClick={() => toggle(p._id)}
                aria-expanded={abierta === p._id}
              >
                <span>{p.pregunta}</span>
                <div className="faq__icono">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>
              <div className="faq__respuesta-wrap">
                <p className="faq__respuesta">{p.respuesta}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA al pie */}
        <div className="faq__cta">
          <p>¿Tenés alguna otra consulta?</p>
          <a
            href="https://wa.me/5493412479055"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Escribinos por WhatsApp
          </a>
        </div>

      </div>
    </section>
  )
}