import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Executive } from './pages/Executive'
import { Funnel } from './pages/Funnel'
import { Cohorts } from './pages/Cohorts'
import { Products } from './pages/Products'
import { Copilot } from './pages/Copilot'

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Executive />} />
          <Route path="/funnel" element={<Funnel />} />
          <Route path="/cohorts" element={<Cohorts />} />
          <Route path="/products" element={<Products />} />
          <Route path="/copilot" element={<Copilot />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
