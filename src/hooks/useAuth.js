import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';  // CORRECT FILE PATH

// ----------------------------------------------------------------------

const useAuth = () => useContext(AuthContext);

export default useAuth;