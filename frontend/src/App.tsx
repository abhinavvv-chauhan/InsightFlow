import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Executive from './pages/Executive';
import Funnel from './pages/Funnel';
import Customer from './pages/Customer';
import Product from './pages/Product';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/executive" replace />} />
          <Route path="executive" element={<Executive />} />
          <Route path="funnel" element={<Funnel />} />
          <Route path="customer" element={<Customer />} />
          <Route path="product" element={<Product />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
