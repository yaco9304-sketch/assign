import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminHeader() {
  const { logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.5rem",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "white",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", fontWeight: "bold", whiteSpace: "nowrap" }}>
          학년 배정 시스템
        </h1>
        <span style={{ color: "#666", fontSize: "0.85rem", whiteSpace: "nowrap" }}>/</span>
        <span style={{ color: "#666", fontSize: "0.85rem", whiteSpace: "nowrap" }}>관리자</span>
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "none",
          color: "#666",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.9rem",
        }}
      >
        로그아웃 →
      </button>
    </header>
  );
}

