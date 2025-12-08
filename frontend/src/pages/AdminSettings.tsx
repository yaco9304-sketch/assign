import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import AdminHeader from "../components/AdminHeader";

const YEAR = new Date().getFullYear() + 1;

type Row = {
  grade: number;
  class_count: number;
  required_homerooms: number;
  required_subject_teachers: number;
  required_duty_heads: number;
};

export default function AdminSettings() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [rows, setRows] = useState<Row[]>(
    [1, 2, 3, 4, 5, 6].map((g) => ({
      grade: g,
      class_count: 0,
      required_homerooms: 0,
      required_subject_teachers: 0,
      required_duty_heads: 0,
    }))
  );
  const [totalSubjectTeachers, setTotalSubjectTeachers] = useState(0);
  const [totalDutyHeads, setTotalDutyHeads] = useState(0);

  const { data } = useQuery({
    queryKey: ["settings", YEAR],
    queryFn: async () => {
      const res = await api.get("/admin/settings", { params: { year: YEAR } });
      return res.data;
    },
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const gradeMap = new Map(data.map((s: any) => [s.grade, s]));
      const newRows = [1, 2, 3, 4, 5, 6].map((g) => {
        const existing = gradeMap.get(g);
        return existing
          ? {
              grade: g,
              class_count: existing.class_count,
              required_homerooms: existing.required_homerooms,
              required_subject_teachers: existing.required_subject_teachers || 0,
              required_duty_heads: existing.required_duty_heads || 0,
            }
          : {
              grade: g,
              class_count: 0,
              required_homerooms: 0,
              required_subject_teachers: 0,
              required_duty_heads: 0,
            };
      });
      setRows(newRows);
      setTotalSubjectTeachers(newRows.reduce((sum, r) => sum + r.required_subject_teachers, 0));
      setTotalDutyHeads(newRows.reduce((sum, r) => sum + r.required_duty_heads, 0));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = rows.map((r) => ({
        year: YEAR,
        grade: r.grade,
        class_count: r.class_count,
        required_homerooms: r.required_homerooms,
        required_subject_teachers: Math.floor(totalSubjectTeachers / 6),
        required_duty_heads: Math.floor(totalDutyHeads / 6),
      }));
      console.log("Saving payload:", payload);
      const res = await api.post("/admin/settings", payload);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", YEAR] });
      alert("저장되었습니다.");
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      alert(`저장 실패: ${error.response?.data?.detail || error.message || "알 수 없는 오류"}`);
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
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{YEAR} 학급 설정</h2>
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
            <th style={{ padding: "0.5rem", border: "1px solid #ddd" }}>학년</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ddd" }}>학급 수</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ddd" }}>필요 담임</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.grade}>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd", textAlign: "center" }}>
                {r.grade}학년
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                <input
                  type="number"
                  value={r.class_count}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const next = [...rows];
                    next[i].class_count = v;
                    setRows(next);
                  }}
                  style={{ width: "100%", padding: "0.25rem" }}
                />
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                <input
                  type="number"
                  value={r.required_homerooms}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const next = [...rows];
                    next[i].required_homerooms = v;
                    setRows(next);
                  }}
                  style={{ width: "100%", padding: "0.25rem" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "600" }}>교과전담 및 업무부장</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>교과전담</label>
            <input
              type="number"
              value={totalSubjectTeachers}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setTotalSubjectTeachers(v);
              }}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>업무부장</label>
            <input
              type="number"
              value={totalDutyHeads}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setTotalDutyHeads(v);
              }}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.status === "pending"}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: mutation.status === "pending" ? "not-allowed" : "pointer",
        }}
      >
        {mutation.status === "pending" ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

