// src/components/home/Contacto.tsx
import './Contacto.css'

const WHATSAPP = '5493412479055'
const INSTAGRAM = 'panaleranano'
const DIRECCION = 'Belgrano 2046, Villa Constitución, Santa Fe'
const MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3348.123!2d-60.324278!3d-33.234917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDE0JzA1LjciUyA2MMKwMTknMjcuNCJX!5e0!3m2!1ses!2sar!4v1234567890'

const infoItems = [
  {
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    titulo: 'Dirección',
    valor: DIRECCION,
    link: `https://maps.google.com/?q=-33.234917,-60.324278`,
  },
  {
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    titulo: 'WhatsApp',
    valor: `+${WHATSAPP}`,
    link: `https://wa.me/${WHATSAPP}`,
  },
  {
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    titulo: 'Instagram',
    valor: `@${INSTAGRAM}`,
    link: `https://instagram.com/${INSTAGRAM}`,
  },
  {
    icono: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    titulo: 'Horarios',
    valor: 'Lun a Vie · 8:00 — 18:00',
    link: null,
  },
]

export default function Contacto() {
  return (
    <section className="contacto section" id="contacto">
      <div className="container">

        <div className="badge">Contacto</div>
        <h2 className="section-title">¿Dónde <span>encontrarnos?</span></h2>
        <p className="section-subtitle">Estamos en Villa Constitución, Santa Fe. Hacemos envíos a todo el país.</p>

        <div className="contacto__inner">

          {/* Info */}
          <div className="contacto__info">
            {infoItems.map((item) => (
              <div key={item.titulo} className="contacto__item">
                <div className="contacto__icono">{item.icono}</div>
                <div className="contacto__texto">
                  <span className="contacto__label">{item.titulo}</span>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contacto__valor contacto__valor--link"
                    >
                      {item.valor}
                    </a>
                  ) : (
                    <span className="contacto__valor">{item.valor}</span>
                  )}
                </div>
              </div>
            ))}

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary contacto__btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.845L.057 23.535a.75.75 0 00.916.919l5.764-1.463A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.513-5.208-1.408l-.372-.22-3.862.981.999-3.778-.242-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Hacer un pedido ahora
            </a>
          </div>

          {/* Mapa */}
          <div className="contacto__mapa-wrap">
            <iframe
              title="Ubicación Pañalera Nano"
              src={MAPS_EMBED}
              className="contacto__mapa"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  )
}