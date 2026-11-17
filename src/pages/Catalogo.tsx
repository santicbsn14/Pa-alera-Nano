// src/pages/Catalogo.tsx
import { useState} from 'react'
import GridProductos from '../components/catalogo/GridProductos'
import CatalogoCategorias from '../components/catalogo/CatalogoCategorias'
import OfertasBanner from '../components/catalogo/OfertasBanner'
import CarruselDestacados from '../components/catalogo/CarruselDestacados'
import PromosMini from '../components/catalogo/PromosMini'
import { ES_MINORISTA } from '../config/canal'
export default function Catalogo() {
  const [soloOfertas, setSoloOfertas] = useState(false)

  // NanoYA: el catálogo es la página de inicio, con el mini carrusel de promos arriba.
  if (ES_MINORISTA) {
    return (
      <>
        <PromosMini />
        <OfertasBanner soloOfertas={soloOfertas} onToggle={setSoloOfertas} />
        <CarruselDestacados />
        <GridProductos soloOfertas={soloOfertas} onVerOfertas={setSoloOfertas} />
        <CatalogoCategorias />
      </>
    )
  }

  return (
    <>
      <OfertasBanner soloOfertas={soloOfertas} onToggle={setSoloOfertas} />
      <CarruselDestacados />
      <GridProductos soloOfertas={soloOfertas} onVerOfertas={setSoloOfertas} />
      <CatalogoCategorias />
    </>
  )
}