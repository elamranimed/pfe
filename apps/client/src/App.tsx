import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Offices } from './pages/Offices';
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
            <Route path="payments" element={<Payments />} />
            <Route path="expenses" element={<Expenses />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
