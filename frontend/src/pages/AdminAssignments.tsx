import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import AdminHeader from "../components/AdminHeader";

const YEAR = new Date().getFullYear() + 1;

export default function AdminAssignments() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["assignments", YEAR],
    queryFn: async () => {
      const res = await api.get("/admin/assignments", { params: { year: YEAR } });
      return res.data as any[];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => api.post("/admin/assign", null, { params: { year: YEAR } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", YEAR] });
      alert("배정이 완료되었습니다.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "배정 중 오류가 발생했습니다.";
      alert(msg);
    },
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      <AdminHeader />
      <div
        style={{
          flex: 1,
          padding: "clamp(1rem, 3vw, 2rem)",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{YEAR} 자동 배정</h2>
          <button
            onClick={() => nav("/admin/dashboard")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ← 대시보드로
          </button>
        </div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            if (confirm("배정을 실행하시겠습니까?")) {
              mutation.mutate();
            }
          }}
          disabled={mutation.status === "pending"}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: mutation.status === "pending" ? "not-allowed" : "pointer",
          }}
        >
          {mutation.status === "pending" ? "배정 중..." : "배정 실행"}
        </button>
      </div>
        {isLoading && <p>로딩...</p>}
        {data && data.length > 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>교사명</th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>배정 학년</th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>배정 근거</th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>적용 규정</th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>상세 내역</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a: any) => (
              <tr key={a.id}>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd", fontWeight: "500" }}>
                  {a.teacher_name || `교사 ${a.teacher_id}`}
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center", fontSize: "1.1rem", fontWeight: "600" }}>
                  {a.assigned_grade}학년
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      backgroundColor:
                        a.assignment_type === "규정우선"
                          ? "#e3f2fd"
                          : a.assignment_type.includes("지망")
                          ? "#e8f5e9"
                          : "#fff3e0",
                      color:
                        a.assignment_type === "규정우선"
                          ? "#1976d2"
                          : a.assignment_type.includes("지망")
                          ? "#2e7d32"
                          : "#f57c00",
                    }}
                  >
                    {a.assignment_type}
                  </span>
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd", fontSize: "0.9rem" }}>
                  {a.rule_reference || "-"}
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd", fontSize: "0.85rem", color: "#666" }}>
                  {a.description || "-"}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          </div>
        ) : (
          !isLoading && (
            <p style={{ marginTop: "1rem", color: "#999" }}>배정 결과가 없습니다. 배정을 실행해주세요.</p>
          )
        )}
      </div>
    </div>
  );
}

