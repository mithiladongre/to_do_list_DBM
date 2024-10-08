import './App.css';
import Authform from './components/AuthForm';
import { Route, Routes, BrowserRouter as Router } from "react-router-dom"; 
import Home from './components/Home';

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Authform />} />
      </Routes>
    </Router>
  );
}

export default App;
