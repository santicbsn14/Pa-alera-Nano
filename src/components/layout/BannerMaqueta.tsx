// src/components/layout/BannerMaqueta.tsx
import { MODO_MAQUETA } from '../../config/canal'
import './BannerMaqueta.css'

export default function BannerMaqueta() {
  if (!MODO_MAQUETA) return null

  return (
    <div className="banner-maqueta" role="status">
      Versión de prueba de NanoYA — los precios son de ejemplo
    </div>
  )
}
