export const fetchClient = async (
  url: string,
  options: any = {},
  headers: any = {}
) => {
  const token = localStorage.getItem("accessToken");
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }
  return fetch("http://localhost:3000" + url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    ...options,
  });
};
