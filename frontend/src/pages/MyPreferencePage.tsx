import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { useState, useEffect } from "react";
import TeacherHeader from "../components/TeacherHeader";

const YEAR = new Date().getFullYear() + 1;

export default function MyPreferencePage() {
  const qc = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [first, setFirst] = useState<number | "subject">(1);
  const [second, setSecond] = useState<number | "subject" | "">("");
  const [third, setThird] = useState<number | "subject" | "">("");
  const [wantsGradeHead, setWantsGradeHead] = useState(false);
  const [wantsDutyHead, setWantsDutyHead] = useState(false);
  const [dutyHeadDetailInStep2, setDutyHeadDetailInStep2] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const { data: teacherData, refetch: refetchTeacher } = useQuery({
    queryKey: ["teacher"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });

  const [currentGrade, setCurrentGrade] = useState<number | "">("");
  const [currentClass, setCurrentClass] = useState<string>("");
  const [schoolJoinYear, setSchoolJoinYear] = useState<number | "">("");
  const [hireYear, setHireYear] = useState<number | "">("");
  const [isHomeroomCurrent, setIsHomeroomCurrent] = useState(false);
  const [isSubjectTeacher, setIsSubjectTeacher] = useState(false);
  const [wantsDutyHeadInStep1, setWantsDutyHeadInStep1] = useState(false);
  const [dutyHeadDetail, setDutyHeadDetail] = useState<string>("");
  const [wantsGradeHeadInStep1, setWantsGradeHeadInStep1] = useState(false);
  const [gradeHistory, setGradeHistory] = useState<Array<{ year: number; grade: number }>>([]);
  const [newHistoryYear, setNewHistoryYear] = useState<number | "">("");
  const [newHistoryGrade, setNewHistoryGrade] = useState<number | "">("");

  // 동일 학년을 2번 이상 담임한 학년 목록 계산
  const getBannedGrades = (): Set<number> => {
    const gradeCounts: { [key: number]: number } = {};
    gradeHistory.forEach((h) => {
      gradeCounts[h.grade] = (gradeCounts[h.grade] || 0) + 1;
    });
    const banned = new Set<number>();
    Object.entries(gradeCounts).forEach(([grade, count]) => {
      if (count >= 2) {
        banned.add(Number(grade));
      }
    });
    return banned;
  };

  const bannedGrades = getBannedGrades();

  // 제한된 학년이 선택되어 있으면 초기화
  useEffect(() => {
    if (typeof first === "number" && bannedGrades.has(first)) {
      setFirst(1);
      alert(`${first}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다. 다른 학년을 선택해주세요.`);
    }
    if (typeof second === "number" && bannedGrades.has(second)) {
      setSecond("");
      alert(`${second}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
    }
    if (typeof third === "number" && bannedGrades.has(third)) {
      setThird("");
      alert(`${third}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
    }
  }, [bannedGrades.size, gradeHistory.length]);

  // teacherData가 로드되면 폼에 값 설정
  useEffect(() => {
    if (teacherData) {
      setCurrentGrade(teacherData.current_grade || "");
      setCurrentClass(teacherData.current_class || "");
      setSchoolJoinYear(teacherData.school_join_year || "");
      setHireYear(teacherData.hire_year || "");
      setIsHomeroomCurrent(teacherData.is_homeroom_current || false);
      setIsSubjectTeacher(teacherData.is_subject_teacher || false);
      const isDutyHead = teacherData.duty_role && teacherData.duty_role.startsWith("업무부장");
      setWantsDutyHeadInStep1(isDutyHead || false);
      setDutyHeadDetail(isDutyHead && teacherData.duty_role.includes(":") ? teacherData.duty_role.split(":")[1].trim() : "");
      setWantsGradeHeadInStep1(teacherData.duty_role === "학년부장" || false);
      // grade_history 파싱
      if (teacherData.grade_history) {
        try {
          const parsed = typeof teacherData.grade_history === "string" 
            ? JSON.parse(teacherData.grade_history) 
            : teacherData.grade_history;
          if (Array.isArray(parsed)) {
            setGradeHistory(parsed);
          }
        } catch (e) {
          console.error("Failed to parse grade_history:", e);
        }
      }
    }
  }, [teacherData]);

  const validateForm = (): string | null => {
    // 교과전담과 담임 중 하나는 반드시 선택해야 함
    if (!isSubjectTeacher && !isHomeroomCurrent) {
      return "교과전담 또는 담임 중 하나를 선택해주세요.";
    }

    // 교과전담과 담임은 동시에 선택할 수 없음
    if (isSubjectTeacher && isHomeroomCurrent) {
      return "교과전담과 담임은 동시에 선택할 수 없습니다.";
    }

    // 담임인 경우 학년과 학급 필수
    if (isHomeroomCurrent) {
      if (currentGrade === "") {
        return "담임인 경우 올해 학년을 선택해주세요.";
      }
      if (!currentClass || currentClass.trim() === "") {
        return "담임인 경우 올해 학급을 입력해주세요.";
      }
    }

    // 본교 근무 시작 연도 필수
    if (schoolJoinYear === "") {
      return "본교 근무 시작 연도를 입력해주세요.";
    }

    // 총 경력(발령 연도) 필수
    if (hireYear === "") {
      return "총 경력(발령 연도)을 입력해주세요.";
    }

    return null;
  };

  const updateTeacherMutation = useMutation({
    mutationFn: async () => {
      // 폼 검증
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      // duty_role 결정: 업무부장 > 학년부장 우선순위
      let dutyRole: string | null = null;
      if (wantsDutyHeadInStep1) {
        dutyRole = dutyHeadDetail.trim() ? `업무부장: ${dutyHeadDetail.trim()}` : "업무부장";
      } else if (wantsGradeHeadInStep1) {
        dutyRole = "학년부장";
      }

      const payload: any = {
        is_homeroom_current: isHomeroomCurrent,
        is_subject_teacher: isSubjectTeacher,
      };

      // 담임인 경우에만 학년, 학급 추가
      if (isHomeroomCurrent) {
        payload.current_grade = currentGrade === "" ? null : Number(currentGrade);
        payload.current_class = currentClass === "" ? null : currentClass;
      } else {
        // 담임이 아니면 학년, 학급 초기화
        payload.current_grade = null;
        payload.current_class = null;
      }

      // 항상 포함되는 필드
      payload.school_join_year = schoolJoinYear === "" ? null : Number(schoolJoinYear);
      payload.hire_year = hireYear === "" ? null : Number(hireYear);
      payload.duty_role = dutyRole;
      payload.grade_history = gradeHistory.length > 0 ? JSON.stringify(gradeHistory) : null;

      console.log("Sending teacher update:", payload);
      return api.put("/auth/me", payload);
    },
    onSuccess: () => {
      console.log("Teacher update success");
      refetchTeacher();
      setStep(2);
    },
    onError: (error: any) => {
      console.error("Teacher update error:", error);
      const errorMessage = error.response?.data?.detail || error.message || "저장 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  const { data: _prefData } = useQuery({
    queryKey: ["pref", YEAR],
    queryFn: async () => {
      const res = await api.get("/preferences/me", { params: { year: YEAR } });
      if (res.data) {
        // wants_subject_teacher가 true이고 해당 지망의 grade가 null이면 "subject"로 설정
        if (res.data.wants_subject_teacher) {
          if (res.data.first_choice_grade === null) {
            setFirst("subject");
            setSecond(res.data.second_choice_grade || "");
            setThird(res.data.third_choice_grade || "");
          } else if (res.data.second_choice_grade === null) {
            setFirst(res.data.first_choice_grade || 1);
            setSecond("subject");
            setThird(res.data.third_choice_grade || "");
          } else if (res.data.third_choice_grade === null) {
            setFirst(res.data.first_choice_grade || 1);
            setSecond(res.data.second_choice_grade || "");
            setThird("subject");
          } else {
            // 모든 지망이 학년인 경우 (이상한 경우지만 처리)
            setFirst(res.data.first_choice_grade || 1);
            setSecond(res.data.second_choice_grade || "");
            setThird(res.data.third_choice_grade || "");
          }
        } else {
          setFirst(res.data.first_choice_grade || 1);
          setSecond(res.data.second_choice_grade || "");
          setThird(res.data.third_choice_grade || "");
        }
        setWantsGradeHead(res.data.wants_grade_head || false);
        setWantsDutyHead(res.data.wants_duty_head || false);
        // comment에서 업무부장 상세 정보 추출 (형식: "업무부장: {상세정보}" 또는 그냥 상세정보)
        if (res.data.comment) {
          if (res.data.comment.startsWith("업무부장:")) {
            setDutyHeadDetailInStep2(res.data.comment.replace("업무부장:", "").trim());
          } else {
            setDutyHeadDetailInStep2(res.data.comment);
          }
        }
        setSubmitted(true);
        setStep(3);
      }
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // 교과전담이 선택된 지망 찾기
      const subjectInFirst = first === "subject";
      const subjectInSecond = second === "subject";
      const subjectInThird = third === "subject";
      const wantsSubjectTeacher = subjectInFirst || subjectInSecond || subjectInThird;

      // 업무부장 희망 시 comment에 상세 정보 저장
      const comment = wantsDutyHead && dutyHeadDetailInStep2.trim() 
        ? `업무부장: ${dutyHeadDetailInStep2.trim()}` 
        : null;

      const payload = {
        year: YEAR,
        first_choice_grade: subjectInFirst ? null : (typeof first === "number" ? first : Number(first)),
        second_choice_grade: subjectInSecond ? null : (second === "" ? null : typeof second === "number" ? second : Number(second)),
        third_choice_grade: subjectInThird ? null : (third === "" ? null : typeof third === "number" ? third : Number(third)),
        wants_grade_head: wantsGradeHead,
        wants_subject_teacher: wantsSubjectTeacher,
        wants_duty_head: wantsDutyHead,
        comment: comment,
      };
      
      console.log("Submitting preference:", payload);
      return api.post("/preferences/me", payload);
    },
    onSuccess: () => {
      console.log("Preference submission success");
      qc.invalidateQueries({ queryKey: ["pref", YEAR] });
      setSubmitted(true);
      setStep(3);
    },
    onError: (error: any) => {
      console.error("Preference submission error:", error);
      const errorMessage = error.response?.data?.detail || error.message || "제출 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  // const currentYear = new Date().getFullYear();
  // const yearsAtSchool = teacherData?.school_join_year
  //   ? currentYear - teacherData.school_join_year + 1
  //   : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      {teacherData && <TeacherHeader teacherName={teacherData.name} />}
      <div
        style={{
          flex: 1,
          padding: "clamp(1rem, 3vw, 2rem)",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Progress Indicator */}
        <div style={{ marginBottom: "2rem", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            {/* 연결선 */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                right: "20px",
                height: "2px",
                backgroundColor: step >= 2 ? "#4caf50" : "#e0e0e0",
                zIndex: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: step >= 1 ? "#4caf50" : "#e0e0e0",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
{step > 1 ? "" : "1"}
              </div>
              <div style={{ fontSize: "0.9rem", color: step >= 1 ? "#4caf50" : "#999" }}>내 정보 확인</div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: step >= 2 ? (step === 2 ? "#2196f3" : "#4caf50") : "#e0e0e0",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
{step > 2 ? "" : "2"}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: step >= 2 ? (step === 2 ? "#2196f3" : "#4caf50") : "#999",
                }}
              >
                지망 입력
              </div>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: step >= 3 ? "#4caf50" : "#e0e0e0",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
{step >= 3 ? "" : "3"}
              </div>
              <div style={{ fontSize: "0.9rem", color: step >= 3 ? "#4caf50" : "#999" }}>제출 완료</div>
            </div>
          </div>
        </div>

        {/* Step 1: 내 정보 입력 */}
        {step === 1 && teacherData && (
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "600" }}>내 정보</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTeacherMutation.mutate();
              }}
            >
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <div style={{ color: "#666", fontSize: "0.9rem", marginBottom: "0.25rem" }}>이름</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "500", padding: "0.5rem 0" }}>{teacherData.name}</div>
                </div>

                {/* 교과전담, 담임 여부 체크박스 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isSubjectTeacher}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsSubjectTeacher(checked);
                        if (checked) {
                          // 교과전담 선택 시 담임 해제
                          setIsHomeroomCurrent(false);
                        }
                        if (!checked) {
                          setWantsDutyHeadInStep1(false);
                          setDutyHeadDetail("");
                        }
                      }}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.95rem" }}>교과전담</span>
                  </label>
                  {isSubjectTeacher && (
                    <div style={{ marginLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={wantsDutyHeadInStep1}
                          onChange={(e) => {
                            setWantsDutyHeadInStep1(e.target.checked);
                            if (!e.target.checked) {
                              setDutyHeadDetail("");
                            }
                          }}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "0.95rem" }}>업무부장</span>
                      </label>
                      {wantsDutyHeadInStep1 && (
                        <input
                          type="text"
                          value={dutyHeadDetail}
                          onChange={(e) => setDutyHeadDetail(e.target.value)}
                          placeholder="내 업무를 입력하세요"
                          style={{
                            marginLeft: "1.5rem",
                            width: "calc(100% - 1.5rem)",
                            padding: "0.5rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                          }}
                        />
                      )}
                    </div>
                  )}
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isHomeroomCurrent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsHomeroomCurrent(checked);
                        if (checked) {
                          // 담임 선택 시 교과전담 해제
                          setIsSubjectTeacher(false);
                          setWantsDutyHeadInStep1(false);
                          setDutyHeadDetail("");
                        }
                      }}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.95rem" }}>담임</span>
                  </label>
                </div>

                {/* 담임이면 학년, 학급 입력 필드 표시 */}
                {isHomeroomCurrent && (
                  <>
                    <div>
                      <label style={{ display: "block", color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        올해 학년
                      </label>
                      <select
                        value={currentGrade}
                        onChange={(e) => setCurrentGrade(e.target.value === "" ? "" : Number(e.target.value))}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "1rem",
                        }}
                      >
                        <option value="">선택 안 함</option>
                        {[1, 2, 3, 4, 5, 6].map((g) => (
                          <option key={g} value={g}>
                            {g}학년
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        올해 학급
                      </label>
                      <input
                        type="text"
                        value={currentClass}
                        onChange={(e) => setCurrentClass(e.target.value)}
                        placeholder="예: 가람반, 나리반"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={wantsGradeHeadInStep1}
                          onChange={(e) => setWantsGradeHeadInStep1(e.target.checked)}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "0.95rem" }}>학년부장</span>
                      </label>
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: "block", color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    본교 근무 시작 연도
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={schoolJoinYear}
                    onChange={(e) => setSchoolJoinYear(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="예: 2020"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    총 경력(발령 연도)
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={hireYear}
                    onChange={(e) => setHireYear(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="예: 2015"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                {/* 본교 근무 기간 동안 담임한 학년 이력 */}
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #eee" }}>
                  <label style={{ display: "block", color: "#333", fontSize: "0.95rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                    본교 근무 기간 동안 담임한 학년 이력
                  </label>
                  <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
                    동일 학년을 2번까지만 담임할 수 있습니다. 본교에서 담임했던 학년을 입력해주세요.
                  </p>
                  
                  {/* 이력 추가 폼 */}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <input
                      type="number"
                      min="2000"
                      max={new Date().getFullYear()}
                      value={newHistoryYear}
                      onChange={(e) => setNewHistoryYear(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="연도 (예: 2023)"
                      style={{
                        flex: "1",
                        minWidth: "120px",
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                      }}
                    />
                    <select
                      value={newHistoryGrade}
                      onChange={(e) => setNewHistoryGrade(e.target.value === "" ? "" : Number(e.target.value))}
                      style={{
                        flex: "1",
                        minWidth: "100px",
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                      }}
                    >
                      <option value="">학년 선택</option>
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          {g}학년
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (newHistoryYear !== "" && newHistoryGrade !== "") {
                          // 중복 체크
                          const exists = gradeHistory.some(
                            (h) => h.year === Number(newHistoryYear) && h.grade === Number(newHistoryGrade)
                          );
                          if (!exists) {
                            setGradeHistory([...gradeHistory, { year: Number(newHistoryYear), grade: Number(newHistoryGrade) }]);
                            setNewHistoryYear("");
                            setNewHistoryGrade("");
                          } else {
                            alert("이미 등록된 이력입니다.");
                          }
                        }
                      }}
                      disabled={newHistoryYear === "" || newHistoryGrade === ""}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: newHistoryYear === "" || newHistoryGrade === "" ? "not-allowed" : "pointer",
                        fontSize: "0.9rem",
                        opacity: newHistoryYear === "" || newHistoryGrade === "" ? 0.5 : 1,
                      }}
                    >
                      추가
                    </button>
                  </div>

                  {/* 입력된 이력 목록 */}
                  {gradeHistory.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>등록된 이력:</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {gradeHistory
                          .sort((a, b) => b.year - a.year || b.grade - a.grade)
                          .map((h, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.5rem",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "4px",
                                fontSize: "0.9rem",
                              }}
                            >
                              <span>
                                {h.year}년 {h.grade}학년
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setGradeHistory(gradeHistory.filter((_, i) => i !== gradeHistory.indexOf(h)));
                                }}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  backgroundColor: "#f44336",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                }}
                              >
                                삭제
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={updateTeacherMutation.status === "pending"}
                style={{
                  marginTop: "2rem",
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: updateTeacherMutation.status === "pending" ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  opacity: updateTeacherMutation.status === "pending" ? 0.6 : 1,
                }}
              >
                {updateTeacherMutation.status === "pending" ? "저장 중..." : "다음 단계"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: 지망 입력 */}
        {step === 2 && (
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: "600" }}>희망 학년 입력</h3>
            
            {/* 제한된 학년 안내 */}
            {bannedGrades.size > 0 && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffc107",
                  borderRadius: "4px",
                  color: "#856404",
                }}
              >
                <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>⚠️ 선택 불가능한 학년</div>
                <div style={{ fontSize: "0.9rem" }}>
                  본교에서 동일 학년을 2번 이상 담임하신 학년은 선택할 수 없습니다:{" "}
                  {Array.from(bannedGrades)
                    .sort()
                    .map((g) => `${g}학년`)
                    .join(", ")}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // 제한된 학년 체크
                const firstGrade = typeof first === "number" ? first : null;
                const secondGrade = typeof second === "number" ? second : null;
                const thirdGrade = typeof third === "number" ? third : null;
                
                if (firstGrade && bannedGrades.has(firstGrade)) {
                  alert(`${firstGrade}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
                  return;
                }
                if (secondGrade && bannedGrades.has(secondGrade)) {
                  alert(`${secondGrade}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
                  return;
                }
                if (thirdGrade && bannedGrades.has(thirdGrade)) {
                  alert(`${thirdGrade}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
                  return;
                }
                
                mutation.mutate();
              }}
            >
              <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>1지망</label>
                  <select
                    value={first}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "subject") {
                        setFirst("subject");
                      } else {
                        const grade = Number(value);
                        if (bannedGrades.has(grade)) {
                          alert(`${grade}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
                          return;
                        }
                        setFirst(grade);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g} disabled={bannedGrades.has(g)}>
                        {g}학년 {bannedGrades.has(g) ? "(선택 불가)" : ""}
                      </option>
                    ))}
                    <option value="subject">교과전담</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>2지망</label>
                  <select
                    value={second}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setSecond("");
                      } else if (value === "subject") {
                        setSecond("subject");
                      } else {
                        const grade = Number(value);
                        if (bannedGrades.has(grade)) {
                          alert(`${grade}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
                          return;
                        }
                        setSecond(grade);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="">선택 안 함</option>
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g} disabled={bannedGrades.has(g)}>
                        {g}학년 {bannedGrades.has(g) ? "(선택 불가)" : ""}
                      </option>
                    ))}
                    <option value="subject">교과전담</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>3지망</label>
                  <select
                    value={third}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setThird("");
                      } else if (value === "subject") {
                        setThird("subject");
                      } else {
                        const grade = Number(value);
                        if (bannedGrades.has(grade)) {
                          alert(`${grade}학년은 동일 학년을 2번 이상 담임하셔서 선택할 수 없습니다.`);
                          return;
                        }
                        setThird(grade);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="">선택 안 함</option>
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g} disabled={bannedGrades.has(g)}>
                        {g}학년 {bannedGrades.has(g) ? "(선택 불가)" : ""}
                      </option>
                    ))}
                    <option value="subject">교과전담</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <div style={{ marginBottom: "0.75rem", fontWeight: "500", fontSize: "0.95rem" }}>추가 희망</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={wantsGradeHead}
                      onChange={(e) => setWantsGradeHead(e.target.checked)}
                    />
                    <span>학년부장</span>
                  </label>
                  {(first === "subject" || second === "subject" || third === "subject") && (
                    <div style={{ marginLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          type="checkbox"
                          checked={wantsDutyHead}
                          onChange={(e) => {
                            setWantsDutyHead(e.target.checked);
                            if (!e.target.checked) {
                              setDutyHeadDetailInStep2("");
                            }
                          }}
                        />
                        <span>업무부장 희망</span>
                      </label>
                      {wantsDutyHead && (
                        <input
                          type="text"
                          value={dutyHeadDetailInStep2}
                          onChange={(e) => setDutyHeadDetailInStep2(e.target.value)}
                          placeholder="원하는 업무를 입력하세요"
                          style={{
                            marginLeft: "1.5rem",
                            width: "calc(100% - 1.5rem)",
                            padding: "0.5rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#f5f5f5",
                    color: "#333",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  이전 단계
                </button>
                <button
                  type="submit"
                  disabled={mutation.status === "pending"}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: mutation.status === "pending" ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                  }}
                >
                  {mutation.status === "pending" ? "제출 중..." : "제출하기"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: 제출 완료 */}
        {step === 3 && submitted && (
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                backgroundColor: "#e8f5e9",
                border: "1px solid #4caf50",
                borderRadius: "4px",
                padding: "1rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: "#2e7d32", fontSize: "0.95rem", fontWeight: "500" }}>
                희망 학년이 제출되었습니다. 마감 전까지 수정이 가능합니다.
              </span>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "600" }}>제출된 희망</h4>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div>
                  <span style={{ color: "#666" }}>1지망: </span>
                  <span style={{ fontWeight: "500" }}>{first === "subject" ? "교과전담" : `${first}학년`}</span>
                </div>
                {second && (
                  <div>
                    <span style={{ color: "#666" }}>2지망: </span>
                    <span style={{ fontWeight: "500" }}>{second === "subject" ? "교과전담" : `${second}학년`}</span>
                  </div>
                )}
                {third && (
                  <div>
                    <span style={{ color: "#666" }}>3지망: </span>
                    <span style={{ fontWeight: "500" }}>{third === "subject" ? "교과전담" : `${third}학년`}</span>
                  </div>
                )}
                {(wantsGradeHead || first === "subject" || second === "subject" || third === "subject") && (
                  <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #e0e0e0" }}>
                    {wantsGradeHead && <div style={{ color: "#666" }}>• 학년부장</div>}
                    {(first === "subject" || second === "subject" || third === "subject") && (
                      <div style={{ color: "#666" }}>
                        • 교과전담 희망
                        {wantsDutyHead && (
                          <div style={{ marginLeft: "1rem", fontSize: "0.9rem" }}>
                            - 업무부장 희망{dutyHeadDetailInStep2.trim() && ` (${dutyHeadDetailInStep2.trim()})`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#f5f5f5",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              수정하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
