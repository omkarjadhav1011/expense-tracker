import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
