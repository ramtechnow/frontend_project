import { useState, useEffect } from 'react';
import { adminApi } from '../Utils/adminApi';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Safe local check first to avoid unnecessary backend calls if clearly invalid
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = JSON.parse(atob(parts[1]));
        if (!payload.user || !payload.user.isAdmin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Local token validation check failed:", err);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Backend verification
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

    checkAuth();
  }, []);

  return { isAdmin, loading, error, adminUser };
};
