import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";

export default function LoginPage() {
  const { login, setAuth } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState<"teacher" | "admin">("teacher");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Google Identity Services 로드 (한 번만)
    if (role === "teacher" && !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [role]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (role === "admin") {
      try {
        await login({ name: undefined, password, role });
        nav("/admin/dashboard");
      } catch (err: any) {
        setError(err.response?.data?.detail || "로그인 실패");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      // Google 스크립트 로드 대기
      await new Promise<void>((resolve) => {
        // @ts-ignore
        if (window.google?.accounts?.oauth2) {
          resolve();
          return;
        }
        const checkInterval = setInterval(() => {
          // @ts-ignore
          if (window.google?.accounts?.oauth2) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        // 최대 5초 대기
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      });

      // @ts-ignore
      if (!window.google?.accounts?.oauth2) {
        setError("Google 로그인을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError("Google 클라이언트 ID가 설정되지 않았습니다.");
        return;
      }

      // 데스크톱 앱 감지 (Electron)
      // 여러 방법으로 Electron 환경 감지
      const isElectron = 
        window.navigator.userAgent.includes('Electron') ||
        // @ts-ignore
        (window.electronAPI !== undefined) ||
        window.location.protocol === 'file:' ||
        window.location.hostname === '' ||
        window.location.hostname === 'localhost';
      
      // redirect_uri 설정
      // ⚠️ 주의: 단축 URL은 redirect_uri로 사용할 수 없습니다
      // Google OAuth는 실제로 콜백을 받을 수 있는 URL이어야 합니다
      // 환경 변수로 커스텀 redirect_uri 설정 가능 (단축 URL 제외)
      const customRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
      
      let redirectUri: string;
      if (customRedirectUri) {
        // 커스텀 redirect_uri 사용
        // 단축 URL이 아닌 실제 URL이어야 함 (예: https://your-domain.com/callback)
        redirectUri = customRedirectUri;
      } else if (isElectron) {
        // Electron 앱에서는 기본적으로 http://localhost 사용
        // 이는 데스크톱 앱에서 가장 안정적인 방법
        redirectUri = 'http://localhost';
      } else {
        // 웹 앱에서는 현재 origin + pathname 사용
        // GitHub Pages의 경우 base path가 포함될 수 있음
        redirectUri = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') || window.location.origin;
        // 로그인 페이지에서 호출되므로 /login을 제거하고 base path만 사용
        if (redirectUri.endsWith('/login')) {
          redirectUri = redirectUri.replace('/login', '');
        }
      }
      
      console.log('Google Login - isElectron:', isElectron, 'redirectUri:', redirectUri);
      
      // @ts-ignore
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid profile email",
        redirect_uri: redirectUri,
        callback: async (response: any) => {
          if (response.error) {
            setError(response.error_description || "구글 로그인이 취소되었습니다.");
            return;
          }
          try {
            console.log("Sending token to backend:", response.access_token?.substring(0, 20) + "...");
            const res = await api.post("/auth/google", { token: response.access_token });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            if (res.data.teacher_id) localStorage.setItem("teacher_id", String(res.data.teacher_id));
            setAuth(res.data.role, res.data.teacher_id);
            nav("/my-preference");
          } catch (err: any) {
            console.error("Backend error:", err);
            setError(err.response?.data?.detail || "구글 로그인 실패");
          }
        },
      });

      // 로그인 팝업 열기
      client.requestAccessToken();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.response?.data?.detail || err.message || "구글 로그인 실패");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h2 style={{ marginBottom: "2rem", textAlign: "center", fontSize: "1.8rem", fontWeight: "bold" }}>로그인</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>역할</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            <option value="teacher">교사</option>
            <option value="admin">관리자</option>
          </select>
        </div>

        {role === "teacher" ? (
          <div>
            <button
              onClick={handleGoogleLogin}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "#fff",
                color: "#3c4043",
                border: "1px solid #dadce0",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.15)";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path
                    d="M17.64 9.2045c0-.6371-.0573-1.2516-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0777-1.7963 2.7164v2.2581h2.9087c1.7023-1.5668 2.6836-3.874 2.6836-6.6154z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.4673-.8068 5.9659-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0572.859-2.3518 0-4.3436-1.5881-5.0554-3.7236H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.9445 10.71c-.1755-.525-.2759-1.0841-.2759-1.6591s.1004-1.1341.2759-1.6591V4.96H.957C.3477 6.1754 0 7.55 0 9.0509s.3477 2.8755.957 4.0909l2.9875-2.3318z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.5795c1.3218 0 2.5077.4541 3.4405 1.3459l2.5818-2.5818C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.957 4.96L3.9445 7.2918C4.6564 5.1564 6.6482 3.5795 9 3.5795z"
                    fill="#EA4335"
                  />
                </g>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem",
                }}
              />
            </div>
            {error && (
              <div style={{ color: "#f44336", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
              }}
            >
              로그인
            </button>
          </form>
        )}

        {role === "teacher" && error && (
          <div style={{ marginTop: "1rem", color: "#f44336", fontSize: "0.9rem", textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
