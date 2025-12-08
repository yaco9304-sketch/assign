import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../lib/api";
import AdminHeader from "../components/AdminHeader";

const YEAR = new Date().getFullYear() + 1;

export default function AdminDashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [totalTeachersInput, setTotalTeachersInput] = useState<number | "">("");
  const [isEditingTotalTeachers, setIsEditingTotalTeachers] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success_count: number; error_count: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", YEAR],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/dashboard", { params: { year: YEAR } });
        return res.data;
      } catch (err: any) {
        console.error("Dashboard API error:", err);
        throw err;
      }
    },
    retry: 1,
  });

  useEffect(() => {
    if (data && data.total_teachers) {
      setTotalTeachersInput(data.total_teachers);
    }
  }, [data]);

  const updateTotalTeachersMutation = useMutation({
    mutationFn: async (total: number) =>
      api.put("/admin/dashboard/total-teachers", { year: YEAR, total_teachers: total }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", YEAR] });
      setIsEditingTotalTeachers(false);
      alert("전체 교사 수가 저장되었습니다.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "저장 중 오류가 발생했습니다.");
    },
  });

  const uploadTeachersMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/upload-teachers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setUploadResult(data);
      qc.invalidateQueries({ queryKey: ["dashboard", YEAR] });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "업로드 중 오류가 발생했습니다.");
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadTeachersMutation.mutate(file);
    }
  };

  const assignMutation = useMutation({
    mutationFn: async () => api.post("/admin/assign", null, { params: { year: YEAR } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", YEAR] });
      alert("배정이 완료되었습니다.");
      nav("/admin/assignments");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "배정 중 오류가 발생했습니다.";
      alert(msg);
    },
  });

  // 제출 명단 조회
  const { data: preferencesData, refetch: refetchPreferences, isLoading: isLoadingPreferences, error: preferencesError } = useQuery({
    queryKey: ["preferences", YEAR],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/preferences", { params: { year: YEAR } });
        console.log("제출 명단 API 응답:", res.data);
        return res.data;
      } catch (err: any) {
        console.error("제출 명단 API 오류:", err);
        throw err;
      }
    },
    refetchInterval: 30000, // 30초마다 자동 새로고침
    retry: 1,
  });

  // 희망 초기화
  const clearPreferencesMutation = useMutation({
    mutationFn: async () => api.delete("/admin/preferences", { params: { year: YEAR } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", YEAR] });
      qc.invalidateQueries({ queryKey: ["preferences", YEAR] });
      alert("희망서가 모두 초기화되었습니다.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "초기화 중 오류가 발생했습니다.");
    },
  });

  if (isLoading) {
    return (
      <div>
        <AdminHeader />
        <div style={{ padding: "2rem", textAlign: "center" }}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      (error as any)?.response?.data?.detail ||
      (error as any)?.message ||
      "알 수 없는 오류가 발생했습니다.";
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: "8px",
              padding: "2rem",
              textAlign: "center",
              color: "#c62828",
              maxWidth: "500px",
              width: "100%",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>오류가 발생했습니다</h3>
            <p style={{ marginBottom: "1.5rem", wordBreak: "break-word" }}>{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
              }}
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dashboardData = data || {
    year: YEAR,
    total_teachers: 0,
    submitted_count: 0,
    required_homerooms: 0,
    grade_class_counts: {},
    first_choice_counts: {},
    second_choice_counts: {},
    third_choice_counts: {},
  };

  const submissionRate = dashboardData.total_teachers > 0 ? Math.round((dashboardData.submitted_count / dashboardData.total_teachers) * 100) : 0;
  const notSubmitted = dashboardData.total_teachers - dashboardData.submitted_count;

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
        <h2 style={{ marginBottom: "2rem", fontSize: "1.8rem", fontWeight: "bold" }}>관리자 대시보드</h2>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600" }}>학년 배정 관리</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div>
                <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>전체 교사</div>
                {isEditingTotalTeachers ? (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="number"
                      min="1"
                      value={totalTeachersInput}
                      onChange={(e) => setTotalTeachersInput(e.target.value === "" ? "" : Number(e.target.value))}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "1rem",
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (totalTeachersInput !== "" && totalTeachersInput > 0) {
                          updateTotalTeachersMutation.mutate(Number(totalTeachersInput));
                        } else {
                          alert("1 이상의 숫자를 입력해주세요.");
                        }
                      }}
                      disabled={updateTotalTeachersMutation.status === "pending"}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: updateTotalTeachersMutation.status === "pending" ? "not-allowed" : "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        opacity: updateTotalTeachersMutation.status === "pending" ? 0.6 : 1,
                      }}
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTotalTeachers(false);
                        setTotalTeachersInput(dashboardData.total_teachers || 0);
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#f5f5f5",
                        color: "#333",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{dashboardData.total_teachers}명</div>
                    <button
                      onClick={() => setIsEditingTotalTeachers(true)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#f5f5f5",
                        color: "#333",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      수정
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div>
                <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: "0.25rem" }}>희망 제출</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {dashboardData.submitted_count}/{dashboardData.total_teachers}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div>
                <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: "0.25rem" }}>필요 담임 수</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{dashboardData.required_homerooms}명</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600" }}>교사 희망 제출률</h3>
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>{submissionRate}%</div>
            <div
              style={{
                width: "100%",
                height: "24px",
                backgroundColor: "#e0e0e0",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: `${submissionRate}%`,
                  height: "100%",
                  backgroundColor: "#ff9800",
                  transition: "width 0.3s",
                }}
              />
            </div>
            {notSubmitted > 0 && (
              <div style={{ color: "#ff5722", fontSize: "0.9rem" }}>
                {notSubmitted}명의 교사가 아직 제출하지 않았습니다.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600" }}>내년도 학년별 학급 수</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <div
                key={grade}
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem" }}>{grade}학년</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2" }}>
                  {dashboardData.grade_class_counts?.[grade] || 0} 학급
                </div>
              </div>
            ))}
          </div>
          {notSubmitted > 0 && (
            <div style={{ marginTop: "1rem", color: "#ff5722", fontSize: "0.9rem" }}>
아직 {notSubmitted}명의 교사가 희망을 제출하지 않았습니다.
            </div>
          )}
        </div>

        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            <div
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>희망 현황 보기</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>교사별 희망 학년 제출 현황을 확인합니다.</div>
              </div>
              <button
                onClick={() => nav("/admin/summary")}
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
                  marginBottom: "0.5rem",
                }}
              >
                현황 보기
              </button>
              <button
                onClick={() => {
                  if (confirm("모든 교사의 희망서를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                    clearPreferencesMutation.mutate();
                  }
                }}
                disabled={clearPreferencesMutation.status === "pending"}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: clearPreferencesMutation.status === "pending" ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  opacity: clearPreferencesMutation.status === "pending" ? 0.6 : 1,
                }}
              >
                {clearPreferencesMutation.status === "pending" ? "초기화 중..." : "희망서 초기화"}
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
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>학급 수 설정</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>내년도 학년별 학급 수를 입력합니다.</div>
              </div>
              <button
                onClick={() => nav("/admin/settings")}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#757575",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                설정하기
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
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>자동 배정 실행</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>규정에 따라 자동으로 학년을 배정합니다.</div>
              </div>
              <button
                onClick={() => {
                  if (confirm("배정을 실행하시겠습니까?")) {
                    assignMutation.mutate();
                  }
                }}
                disabled={assignMutation.status === "pending"}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: assignMutation.status === "pending" ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  opacity: assignMutation.status === "pending" ? 0.6 : 1,
                }}
              >
                {assignMutation.status === "pending" ? "배정 중..." : "배정 실행"}
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
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>배정 결과</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>배정 결과를 확인하고 수정합니다.</div>
              </div>
              <button
                onClick={() => nav("/admin/assignments")}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#757575",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                결과 보기
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
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>교사 정보 일괄 업로드</div>
                <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>엑셀 파일로 교사 정보를 일괄 등록/수정합니다.</div>
                <a
                  href="/교사정보_업로드_양식.xlsx"
                  download="교사정보_업로드_양식.xlsx"
                  style={{
                    color: "#1976d2",
                    fontSize: "0.85rem",
                    textDecoration: "underline",
                    display: "inline-block",
                    marginTop: "0.25rem",
                  }}
                >
                  📥 엑셀 양식 다운로드
                </a>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadTeachersMutation.status === "pending"}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#9c27b0",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: uploadTeachersMutation.status === "pending" ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  opacity: uploadTeachersMutation.status === "pending" ? 0.6 : 1,
                }}
              >
                {uploadTeachersMutation.status === "pending" ? "업로드 중..." : "엑셀 파일 업로드"}
              </button>
              {uploadResult && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: uploadResult.error_count > 0 ? "#fff3e0" : "#e8f5e9",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                  }}
                >
                  <div style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    업로드 완료: 성공 {uploadResult.success_count}건, 실패 {uploadResult.error_count}건
                  </div>
                  {uploadResult.errors.length > 0 && (
                    <div style={{ marginTop: "0.5rem", color: "#d32f2f" }}>
                      <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>오류 내역:</div>
                      {uploadResult.errors.map((err, idx) => (
                        <div key={idx} style={{ fontSize: "0.85rem" }}>
                          {err}
                        </div>
                      ))}
                      {uploadResult.error_count > uploadResult.errors.length && (
                        <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                          ... 외 {uploadResult.error_count - uploadResult.errors.length}건
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 제출 명단 */}
        <div style={{ marginTop: "2rem" }}>
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                제출 명단 {preferencesData && `(${preferencesData.length}명)`}
              </h3>
              <button
                onClick={() => refetchPreferences()}
                disabled={isLoadingPreferences}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isLoadingPreferences ? "#e0e0e0" : "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: isLoadingPreferences ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  opacity: isLoadingPreferences ? 0.6 : 1,
                }}
              >
                {isLoadingPreferences ? "새로고침 중..." : "새로고침"}
              </button>
            </div>
            {preferencesError && (
              <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "4px", fontSize: "0.9rem" }}>
                오류: {preferencesError.response?.data?.detail || preferencesError.message || "제출 명단을 불러올 수 없습니다."}
              </div>
            )}
            {isLoadingPreferences ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>로딩 중...</div>
            ) : preferencesData && preferencesData.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                      <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center", minWidth: "100px" }}>
                        교사명
                      </th>
                      <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center", minWidth: "100px" }}>
                        1지망
                      </th>
                      <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center", minWidth: "100px" }}>
                        2지망
                      </th>
                      <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center", minWidth: "100px" }}>
                        3지망
                      </th>
                      <th style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center", minWidth: "120px" }}>
                        추가 희망
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preferencesData.map((pref: any) => (
                      <tr key={pref.id}>
                        <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>
                          {pref.teacher_name}
                        </td>
                        <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>
                          {pref.first_choice_grade
                            ? `${pref.first_choice_grade}학년`
                            : pref.wants_subject_teacher
                            ? "교과전담"
                            : "-"}
                        </td>
                        <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>
                          {pref.second_choice_grade
                            ? `${pref.second_choice_grade}학년`
                            : pref.second_choice_grade === null && pref.first_choice_grade
                            ? "교과전담"
                            : "-"}
                        </td>
                        <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center" }}>
                          {pref.third_choice_grade
                            ? `${pref.third_choice_grade}학년`
                            : pref.third_choice_grade === null && pref.second_choice_grade === null && pref.first_choice_grade
                            ? "교과전담"
                            : "-"}
                        </td>
                        <td style={{ padding: "0.75rem", border: "1px solid #ddd", textAlign: "center", fontSize: "0.85rem" }}>
                          {[
                            pref.wants_grade_head && "학년부장",
                            pref.wants_duty_head && "업무부장",
                          ]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                아직 제출된 희망서가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
