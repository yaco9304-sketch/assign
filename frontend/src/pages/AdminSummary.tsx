import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import AdminHeader from "../components/AdminHeader";
import { useNavigate } from "react-router-dom";

const YEAR = new Date().getFullYear() + 1;

export default function AdminSummary() {
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["summary", YEAR],
    queryFn: async () => {
      const res = await api.get("/admin/summary", { params: { year: YEAR } });
      return res.data;
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
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{YEAR} 지망 현황</h2>
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
        {isLoading && <p>로딩...</p>}
        {data && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h3>1지망 현황</h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "1rem",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>학년</th>
                    <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>지망 인원</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.first_choice_counts || {}).map(([grade, count]: [string, any]) => (
                    <tr key={grade}>
                      <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>
                        {grade}학년
                      </td>
                      <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>{count}명</td>
                    </tr>
                  ))}
                  {(!data.first_choice_counts || Object.keys(data.first_choice_counts).length === 0) && (
                    <tr>
                      <td colSpan={2} style={{ padding: "1rem", textAlign: "center", color: "#999" }}>
                        아직 지망이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3>2지망 현황</h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "1rem",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>학년</th>
                    <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>지망 인원</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.second_choice_counts || {}).map(([grade, count]: [string, any]) => (
                    <tr key={grade}>
                      <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>
                        {grade}학년
                      </td>
                      <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>{count}명</td>
                    </tr>
                  ))}
                  {(!data.second_choice_counts || Object.keys(data.second_choice_counts).length === 0) && (
                    <tr>
                      <td colSpan={2} style={{ padding: "1rem", textAlign: "center", color: "#999" }}>
                        아직 지망이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h3>3지망 현황</h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "1rem",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>학년</th>
                    <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>지망 인원</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.third_choice_counts || {}).map(([grade, count]: [string, any]) => (
                    <tr key={grade}>
                      <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>
                        {grade}학년
                      </td>
                      <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>{count}명</td>
                    </tr>
                  ))}
                  {(!data.third_choice_counts || Object.keys(data.third_choice_counts).length === 0) && (
                    <tr>
                      <td colSpan={2} style={{ padding: "1rem", textAlign: "center", color: "#999" }}>
                        아직 지망이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

