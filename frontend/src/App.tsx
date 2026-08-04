import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Executive } from './pages/Executive'
import { Funnel } from './pages/Funnel'
import { Cohorts } from './pages/Cohorts'
import { Products } from './pages/Products'

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Executive />} />
          <Route path="/funnel" element={<Funnel />} />
          <Route path="/cohorts" element={<Cohorts />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
