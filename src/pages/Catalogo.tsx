// src/pages/Catalogo.tsx
import { useState} from 'react'
import GridProductos from '../components/catalogo/GridProductos'
import CatalogoCategorias from '../components/catalogo/CatalogoCategorias'
import OfertasBanner from '../components/catalogo/OfertasBanner'
export default function Catalogo() {
  const [soloOfertas, setSoloOfertas] = useState(false)


  return (
    <>
      <OfertasBanner soloOfertas={soloOfertas} onToggle={setSoloOfertas} />
      <GridProductos soloOfertas={soloOfertas} onVerOfertas={setSoloOfertas} />
      <CatalogoCategorias />
    </>
  )
}