// src/pages/Home.tsx
import Hero from '../components/home/Hero'
import ListaPrecios from '../components/home/ListaPrecios'
import Logistica from '../components/home/Logistica'
import PreguntasFrecuentes from '../components/home/PreguntasFrecuentes'
import Contacto from '../components/home/Contacto'

export default function Home() {
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