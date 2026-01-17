import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; //holds logged in users and tokens
import { ExpenseProvider } from "./context/ExpenseContext"; //fetches user data from backend
import ResetPassword from "./pages/ResetPassword"; 

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";      
import NotFound from "./pages/NotFound";  
import ProtectedRoute from "./components/ProtectedRoute"; //Check if the user is authenticated,yes->dashbpard or No->login page

function App() {
  return (
    <AuthProvider>   {/*token comes from auth*/}
      <ExpenseProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
           

            {/* Protected Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/budget" 
              element={
                <ProtectedRoute>
                  <Budget />
                </ProtectedRoute>
              }
            />

           
            <Route path="*" element={<NotFound />} />
            
          </Routes>
        </BrowserRouter>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;

//done