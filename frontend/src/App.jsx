import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import Profile from "./features/profile/Profile";

import AddTransaction from "./features/expense/AddTransaction";
import EditTransaction from "./features/expense/EditTransaction";
import TransactionList from "./features/expense/TransactionList";
import AddCategory from "./features/expense/AddCategory";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/transactions" element={<ProtectedRoute><TransactionList /></ProtectedRoute>} />
        <Route path="/add-transaction" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        <Route path="/edit-transaction/:id" element={<ProtectedRoute><EditTransaction /></ProtectedRoute>} />
        <Route path="/add-category" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />

        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
