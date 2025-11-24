import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WizardPresupuesto } from './screens/Wizard/WizardPresupuesto';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WizardPresupuesto />} />
        <Route path="/wizard" element={<WizardPresupuesto />} />
      </Routes>
    </Router>
  );
}

export default App;

