export const fetchClient = async (url: string, headers = {}, options = {}) => {
  const token = localStorage.getItem("accessToken");

  return fetch("http://localhost:3000/" + url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    ...options,
  });
};
