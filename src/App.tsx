import Header from './components/Header'
import Hero from './components/Hero'
import Vacancies from './components/Vacancies'
import HowItWorks from './components/HowItWorks'
import About from './components/About'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Vacancies />
        <HowItWorks />
        <About />
      </main>
      <Footer />
    </>
  )
}
