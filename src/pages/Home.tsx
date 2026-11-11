// src/pages/Home.tsx
import Hero from '../components/home/Hero'
import ListaPrecios from '../components/home/ListaPrecios'
import Logistica from '../components/home/Logistica'
import PreguntasFrecuentes from '../components/home/PreguntasFrecuentes'
import Contacto from '../components/home/Contacto'
import ComoComprar from '../components/home/ComoComprar'
import { ES_MINORISTA } from '../config/canal'

export default function Home() {
  if (ES_MINORISTA) {
    return (
      <>
        <Hero />
        <ComoComprar />
        <Contacto />
      </>
    )
  }

  return (
    <>
      <Hero />
      <ListaPrecios />
      <Logistica />
      <PreguntasFrecuentes />
      <Contacto />
    </>
  )
}
