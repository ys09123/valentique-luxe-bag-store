import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

const PrivateRoute = ({
  children,
  adminOnly = false
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if(loading) {
    return <Loader />
  }
  if(!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if(adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute