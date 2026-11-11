// src/pages/Catalogo.tsx
import { useState} from 'react'
import GridProductos from '../components/catalogo/GridProductos'
import CatalogoCategorias from '../components/catalogo/CatalogoCategorias'
import OfertasBanner from '../components/catalogo/OfertasBanner'
import CarruselDestacados from '../components/catalogo/CarruselDestacados'
import { ES_MINORISTA } from '../config/canal'
export default function Catalogo() {
  const [soloOfertas, setSoloOfertas] = useState(false)

  return (
    <>
      <OfertasBanner soloOfertas={soloOfertas} onToggle={setSoloOfertas} />
      {!ES_MINORISTA && <CarruselDestacados />}
      <GridProductos soloOfertas={soloOfertas} onVerOfertas={setSoloOfertas} />
      <CatalogoCategorias />
    </>
  )
}