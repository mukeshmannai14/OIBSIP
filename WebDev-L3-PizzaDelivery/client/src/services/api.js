
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;

  if (currentUser) {
    const idToken = await currentUser.getIdToken();

    config.headers.Authorization = `Bearer ${idToken}`;
  }

  return config;
});

export default api;
