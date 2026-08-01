import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import Profile from "./features/profile/Profile";
import Budgets from "./features/budget/Budgets";

import TransactionList from "./features/expense/TransactionList";
import Categories from "./features/expense/Categories";

import AppLayout from "./components/AppLayout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Everything inside the shell shares one sidebar, header and drawer. */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Routes the pre-redesign UI used; the drawer replaced those pages. */}
        <Route path="/add-transaction" element={<Navigate to="/transactions" replace />} />
        <Route path="/edit-transaction/:id" element={<Navigate to="/transactions" replace />} />
        <Route path="/add-category" element={<Navigate to="/categories" replace />} />

        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
