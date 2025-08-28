import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

// API functions
const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetch("http://localhost:3000/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

const signupUser = async (
  credentials: LoginCredentials & { name: string }
): Promise<AuthResponse> => {
  const response = await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  const response = await fetch("http://localhost:3000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    localStorage.removeItem("accessToken");
    return null;
  }

  return response.json();
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      queryClient.setQueryData(["user"], data.user);
      navigate("/tasks");
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      queryClient.setQueryData(["user"], data.user);
      navigate("/tasks");
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    // Remove token from localStorage
    localStorage.removeItem("accessToken");

    // Clear user data from cache
    queryClient.setQueryData(["user"], null);

    // Navigate to login
    navigate("/login");
  };
};
