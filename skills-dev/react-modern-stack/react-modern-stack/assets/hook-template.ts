import { useState, useEffect } from 'react';

export const use${HOOK_NAME} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Logic here
  }, []);

  return { data, loading, error };
};
