import { useState } from "react";
import api from "../lib/api";

export function useAuth() {
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [teacherId, setTeacherId] = useState<number | null>(
    localStorage.getItem("teacher_id") ? Number(localStorage.getItem("teacher_id")) : null
  );

  const login = async (payload: { name?: string; password: string; role: "teacher" | "admin" }) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    if (data.teacher_id) localStorage.setItem("teacher_id", String(data.teacher_id));
    setRole(data.role);
    if (data.teacher_id) setTeacherId(data.teacher_id);
  };

  const logout = () => {
    localStorage.clear();
    setRole("");
    setTeacherId(null);
  };

  const setAuth = (newRole: string, newTeacherId: number | null) => {
    setRole(newRole);
    setTeacherId(newTeacherId);
  };

  return { role, teacherId, login, logout, setAuth };
}

