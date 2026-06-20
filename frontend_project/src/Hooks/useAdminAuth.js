import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { adminApi } from '../Utils/adminApi';

export const useAdminAuth = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // If the global auth context is still loading, wait.
    if (authLoading) {
      return;
    }

    // If AuthContext finished loading, and there is no user or user is not admin, deny access.
    if (!currentUser || !currentUser.isAdmin) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const verifyBackend = async () => {
      try {
        const data = await adminApi.verifyAdmin();
        if (data.success && data.user && data.user.isAdmin) {
          setIsAdmin(true);
          setAdminUser(data.user);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Backend admin verification failed:", err);
        setError(err.message || "Failed to verify admin status");
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyBackend();
  }, [authLoading, currentUser]);

  return { isAdmin, loading: loading || authLoading, error, adminUser };
};
