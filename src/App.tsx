import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Offices } from './pages/Offices';
import { Tenants } from './pages/Tenants';
import { TenantDetails } from './components/tenants/TenantDetails';
import { Payments } from './pages/Payments';
import { Expenses } from './pages/Expenses';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="offices" element={<Offices />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="tenants/:id" element={<TenantDetails />} />
            <Route path="payments" element={<Payments />} />
            <Route path="expenses" element={<Expenses />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
