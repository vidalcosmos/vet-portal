import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout           from './components/Layout'
import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import PetDetail        from './pages/PetDetail'
import BookAppointment  from './pages/BookAppointment'
import AddPet           from './pages/AddPet'
import Noticias         from './pages/Noticias'
import Perfil           from './pages/Perfil'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
    </div>
  )
  return user ? <Layout>{children}</Layout> : <Navigate to="/login"/>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/"/> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login/></PublicRoute>}/>
          <Route path="/registro" element={<PublicRoute><Register/></PublicRoute>}/>
          <Route path="/"                element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path="/mascota/:id"     element={<ProtectedRoute><PetDetail/></ProtectedRoute>}/>
          <Route path="/agendar"         element={<ProtectedRoute><BookAppointment/></ProtectedRoute>}/>
          <Route path="/agregar-mascota" element={<ProtectedRoute><AddPet/></ProtectedRoute>}/>
          <Route path="/noticias"        element={<ProtectedRoute><Noticias/></ProtectedRoute>}/>
          <Route path="/perfil"          element={<ProtectedRoute><Perfil/></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
