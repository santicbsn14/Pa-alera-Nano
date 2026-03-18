// src/components/home/Logistica.tsx
import viacargo from '../../assets/viacargo.webp'
import elsalvador from '../../assets/elsalvador.webp'
import davidromano from '../../assets/davidromano.webp'
import './Logistica.css'

const fletes = [
  {
    _id: 'f1',
    nombre: 'Via Cargo',
    imagen: viacargo,
    descripcion: 'Cargas y encomiendas a todo el país. Capacidad sin límites.',
    whatsapp: '3364033636',
    color: '#2ECC40',
  },
  {
    _id: 'f2',
    nombre: 'Comisiones El Salvador',
    imagen: elsalvador,
    descripcion: 'Gran capacidad, confiabilidad y full service. Punto a convenir y puerta a puerta.',
    whatsapp: '3400515272',
    color: '#FF6B35',
  },
  {
    _id: 'f3',
    nombre: 'David Romano Comisión',
    imagen: davidromano,
    descripcion: 'Buen precio, responsabilidad y confiabilidad. A Rosario y alrededores.',
    whatsapp: '3364319018',
    color: '#1A3A6C',
  },
]

export default function Logistica() {
  return (
    <section className="logistica section" id="logistica">
      <div className="container">

        <div className="badge">Envíos</div>
        <h2 className="section-title">Empresas de <span>logística</span></h2>
        <p className="section-subtitle">Trabajamos con transportes de confianza para que tu pedido llegue seguro a cualquier punto del país.</p>

        <div className="logistica__grid">
          {fletes.map((flete) => (
            <div key={flete._id} className="logistica__card">
              <div className="logistica__img-wrap">
                <img
                  src={flete.imagen}
                  alt={flete.nombre}
                  className="logistica__img"
                  loading="lazy"
                />
              </div>
              <div className="logistica__info">
                <h3 className="logistica__nombre">{flete.nombre}</h3>
                <p className="logistica__desc">{flete.descripcion}</p>
                <a
                  href={`https://wa.me/${flete.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="logistica__btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.845L.057 23.535a.75.75 0 00.916.919l5.764-1.463A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.513-5.208-1.408l-.372-.22-3.862.981.999-3.778-.242-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Contactar
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}