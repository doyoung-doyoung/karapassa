import { useState, useRef, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────


const INITIAL_LESSONS = {
  "5/23": {
    label:"5월 23일", topic:"클리닉 소개 · 날씨 · 식사",
    sentences:[
      {id:"s1",thai:"넝 콘니 츠 크리스 캅",korean:"이 동생 이름은 크리스입니다",vocab:[{thai:"넝",korean:"동생"},{thai:"콘니",korean:"이 사람"},{thai:"츠",korean:"이름"}]},
      {id:"s2",thai:"뻰머~ 까올리 츠 크리닉 셀리닉 티 청담캅",korean:"한국 의사고 청담에 셀리닉이라는 클리닉이 있어요",vocab:[{thai:"뻰",korean:"~이다"},{thai:"머~",korean:"의사"},{thai:"티",korean:"장소"}]},
      {id:"s3",thai:"뺀머~ 푸'치여우찬 필러 래 스템셀 캅",korean:"필러와 줄기세포 전문가입니다",vocab:[{thai:"뺀머~",korean:"의사이다"},{thai:"푸'치여우찬",korean:"전문가"},{thai:"래",korean:"그리고"}]},
      {id:"s4",thai:"츤 탕니캅, 똡므!",korean:"이쪽으로 모실게요, 박수!",vocab:[{thai:"츤",korean:"모시다"},{thai:"탕니",korean:"이쪽"},{thai:"똡므",korean:"박수"}]},
      {id:"s5",thai:"폼 깜랑 리안 파싸타이 캅! 풋 차차 너이캅!",korean:"전 태국어를 배우고 있어요! 조금 천천히 말해주세요!",vocab:[{thai:"폼",korean:"나"},{thai:"깜랑",korean:"~하고 있어"},{thai:"리안",korean:"배우다"},{thai:"파싸타이",korean:"태국어"},{thai:"풋",korean:"말하다"},{thai:"차차",korean:"천천히"},{thai:"너이캅",korean:"조금"}]},
      {id:"s6",thai:"낀 카우 마 양 캅?",korean:"식사는 먹고 오셨나요?",vocab:[{thai:"낀",korean:"먹다"},{thai:"카우",korean:"밥"},{thai:"양",korean:"아직"},{thai:"마",korean:"오다"}]},
      {id:"s7",thai:"아깟 완니 런 막막 캅",korean:"오늘 날씨가 엄청 덥네요",vocab:[{thai:"아깟",korean:"날씨"},{thai:"완니",korean:"오늘"},{thai:"런",korean:"덥다"}]},
      {id:"s8",thai:"뺀 머~ 느어이 마이캅?",korean:"의사 생활 힘드신가요?",vocab:[{thai:"뺀 머~",korean:"의사이다"},{thai:"느어이",korean:"피곤하다"},{thai:"마이캅?",korean:"질문"}]},
    ],
  },
  "5/25": {
    label:"5월 25일", topic:"감사 인사 · 발표",
    sentences:[
      {id:"p1",thai:"컵쿤 막막 캅",korean:"정말 감사합니다",vocab:[{thai:"컵쿤",korean:"감사하다"},{thai:"막막",korean:"엄청"}]},
      {id:"p2",thai:"완니 디 짠 마이 캅?",korean:"오늘 즐거우셨나요?",vocab:[{thai:"완니",korean:"오늘"},{thai:"디",korean:"좋다"},{thai:"짠",korean:"기쁘다"}]},
      {id:"p3",thai:"폼 인디 막 캅",korean:"저는 정말 기뻐요",vocab:[{thai:"폼",korean:"나"},{thai:"인디",korean:"기쁘다"},{thai:"막",korean:"매우"}]},
    ],
  },
};

const PALETTE = ["#D85A30","#2D7DD2","#3B9E52","#7B52A8","#E67E22","#16A085","#C0392B","#8E44AD"];
const PIN = "1234";
const genId = () => Math.random().toString(36).slice(2,9);

// ─── SHARED COMPONENTS (defined outside to prevent remounting) ───

function Karaoke({ text, active, size = 22 }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px",justifyContent:"center",alignItems:"center",lineHeight:1.8}}>
      {text.split(" ").map((w, i) => (
        <span key={i} style={{
          fontSize:`${size}px`, fontWeight:active===i?600:400,
          color:active===i?"#D85A30":"var(--color-text-primary)",
          background:active===i?"#FAECE7":"transparent",
          padding:"2px 8px", borderRadius:"6px", transition:"all 0.15s",
          boxShadow:active===i?"0 2px 0 #D85A30":"none"
        }}>{w}</span>
      ))}
    </div>
  );
}

function Pills({ vocab, onSpeak }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px",justifyContent:"center"}}>
      {vocab.map((v, i) => (
        <span key={i} style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"20px",padding:"5px 12px",fontSize:"13px",display:"flex",gap:"6px",alignItems:"center"}}>
          <span style={{color:"#D85A30",fontWeight:500}}>{v.thai}</span>
          {v.thaiScript && <span style={{color:"#1A936F",fontWeight:500,fontSize:"12px"}}>{v.thaiScript}</span>}
          <span style={{color:"var(--color-text-tertiary)"}}>·</span>
          <span style={{color:"var(--color-text-secondary)"}}>{v.korean}</span>
          {v.thaiScript && onSpeak && (
            <button onClick={() => onSpeak(v.thaiScript)} style={{background:"none",border:"none",cursor:"pointer",color:"#1A936F",fontSize:"13px",padding:"0",lineHeight:1,display:"flex",alignItems:"center"}}>
              <i className="ti ti-volume" aria-hidden="true" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

// CheckCard is outside ThaiApp so it doesn't remount on parent state changes
function CheckCard({ type, id, thai, thaiScript, korean, jokeNote, isUsed, isEntering, record, draft, draftMeaning, uColor, onStartCheck, onSaveCheck, onEditCheck, onUncheck, onSpeak, onDraftChange, onDraftMeaningChange }) {
  return (
    <div style={{background:"var(--color-background-primary)",border:`0.5px solid ${isUsed?"#97C459":isEntering?uColor:"var(--color-border-tertiary)"}`,borderRadius:"var(--border-radius-lg)",padding:"16px",marginBottom:"12px",transition:"border-color 0.2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
        <div style={{flex:1}}>
          {jokeNote && <span style={{fontSize:"11px",background:"#FAEEDA",color:"#854F0B",padding:"2px 8px",borderRadius:"10px",marginBottom:"6px",display:"inline-block"}}>농담 · {jokeNote}</span>}
          <p style={{margin:jokeNote?"4px 0 0":0,fontSize:"18px",color:uColor,fontWeight:500,lineHeight:1.5}}>{thai}</p>
          {thaiScript && (
            <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"4px 0 2px"}}>
              <span style={{fontSize:"15px",color:"#1A936F",fontWeight:500}}>{thaiScript}</span>
              <button onClick={() => onSpeak?.(thaiScript)} style={{background:"none",border:"none",cursor:"pointer",color:"#1A936F",fontSize:"14px",padding:"0",lineHeight:1,display:"flex",alignItems:"center"}}>
                <i className="ti ti-volume" aria-hidden="true" />
              </button>
            </div>
          )}
          <p style={{margin:"2px 0 0",fontSize:"12px",color:"var(--color-text-secondary)"}}>{korean}</p>
        </div>
        {!isUsed ? (
          <button onClick={onStartCheck} style={{background:isEntering?"#FAECE7":"var(--color-background-secondary)",border:`0.5px solid ${isEntering?uColor:"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",padding:"8px 14px",fontSize:"12px",cursor:"pointer",color:isEntering?uColor:"var(--color-text-secondary)",display:"flex",alignItems:"center",gap:"5px",whiteSpace:"nowrap",flexShrink:0}}>
            <i className="ti ti-checkbox" aria-hidden="true" /> 사용했음
          </button>
        ) : (
          <span style={{background:"#EAF3DE",color:"#3B6D11",borderRadius:"20px",padding:"5px 12px",fontSize:"12px",display:"flex",alignItems:"center",gap:"5px",flexShrink:0}}>
            <i className="ti ti-check" aria-hidden="true" /> {record?.time}
            <button onClick={onUncheck} title="체크 취소" style={{background:"none",border:"none",cursor:"pointer",color:"#3B6D11",fontSize:"14px",lineHeight:1,padding:"0 0 0 2px",opacity:0.6}}>×</button>
          </span>
        )}
      </div>

      {isEntering && (
        <div style={{marginTop:"14px",padding:"14px",background:"#FAECE7",borderRadius:"var(--border-radius-md)",border:`0.5px solid ${uColor}`}}>
          <p style={{margin:"0 0 10px",fontSize:"13px",color:"#712B13",fontWeight:500}}>상대방이 뭐라고 답했나요?</p>
          <input value={draft} onChange={e => onDraftChange(e.target.value)} autoFocus
            onKeyDown={e => e.key === "Enter" && onSaveCheck()}
            style={{width:"100%",padding:"10px 12px",border:`0.5px solid ${uColor}`,borderRadius:"var(--border-radius-md)",fontSize:"15px",boxSizing:"border-box",marginBottom:"8px",outline:"none",background:"#fff"}} />
          <p style={{margin:"0 0 6px",fontSize:"12px",color:"#993C1D"}}>뜻을 알면 입력해봐요 (선택)</p>
          <input value={draftMeaning} onChange={e => onDraftMeaningChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSaveCheck()}
            placeholder="한국어 뜻"
            style={{width:"100%",padding:"9px 12px",border:"0.5px solid #D8A090",borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",marginBottom:"10px",outline:"none",background:"#fff",color:"#633806"}} />
          <button onClick={onSaveCheck} style={{background:uColor,color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"9px 20px",fontSize:"13px",cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:"6px"}}>
            <i className="ti ti-check" aria-hidden="true" /> 저장
          </button>
        </div>
      )}

      {isUsed && (
        <div style={{marginTop:"12px",paddingTop:"12px",borderTop:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <p style={{margin:"0 0 6px",fontSize:"11px",color:"var(--color-text-tertiary)"}}>상대방 답변</p>
              {record?.answer
                ? <div>
                    <p style={{margin:0,fontSize:"16px",color:"#633806",fontWeight:500,background:"#FAEEDA",padding:"10px 14px",borderRadius:"var(--border-radius-md)"}}>{record.answer}</p>
                    {record.answerMeaning && (
                      <p style={{margin:"6px 0 0",fontSize:"13px",color:"var(--color-text-secondary)",paddingLeft:"4px"}}>뜻: {record.answerMeaning}</p>
                    )}
                  </div>
                : <p style={{margin:0,fontSize:"13px",color:"var(--color-text-tertiary)",fontStyle:"italic"}}>답변 없음</p>}
            </div>
            <button onClick={onEditCheck} style={{background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"5px 10px",fontSize:"11px",cursor:"pointer",color:"var(--color-text-secondary)",marginLeft:"10px",flexShrink:0,display:"flex",alignItems:"center",gap:"3px"}}>
              <i className="ti ti-edit" aria-hidden="true" /> 수정
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// LessonForm manages its own form state — typing doesn't cause parent remount
function LessonForm({ existingLessons, uColor, onSave, onClose }) {
  const blank = () => ({ thai:"", thaiScript:"", korean:"", vocab:[{thai:"",thaiScript:"",korean:""}] });
  const [mode, setMode] = useState("existing");
  const [targetKey, setTargetKey] = useState(Object.keys(existingLessons)[0] || "");
  const [newKey, setNewKey] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [sents, setSents] = useState([blank()]);
  const [customJokes, setCustomJokes] = useState([]);

  const addCustomJoke = () =>
    setCustomJokes(p => [...p, {thai:"", thaiScript:"", korean:"", note:"", vocab:[{thai:"",thaiScript:"",korean:""}]}]);
  const removeCustomJoke = ji =>
    setCustomJokes(p => p.filter((_, i) => i !== ji));
  const updateCustomJoke = (ji, field, val) =>
    setCustomJokes(p => p.map((j, i) => i === ji ? {...j, [field]: val} : j));
  const addJokeVocab = ji =>
    setCustomJokes(p => p.map((j, i) => i === ji ? {...j, vocab:[...j.vocab,{thai:"",korean:""}]} : j));
  const removeJokeVocab = (ji, vi) =>
    setCustomJokes(p => p.map((j, i) => i !== ji ? j : {...j, vocab:j.vocab.filter((_,k)=>k!==vi)}));
  const updateJokeVocab = (ji, vi, field, val) =>
    setCustomJokes(p => p.map((j, i) => i !== ji ? j : {...j, vocab:j.vocab.map((v,k)=>k===vi?{...v,[field]:val}:v)}));

  const updateSent = (si, field, val) =>
    setSents(p => p.map((s, i) => i === si ? {...s, [field]: val} : s));
  const updateVocab = (si, vi, field, val) =>
    setSents(p => p.map((s, i) => i !== si ? s : {...s, vocab: s.vocab.map((v, j) => j === vi ? {...v, [field]: val} : v)}));
  const addVocab = si =>
    setSents(p => p.map((s, i) => i !== si ? s : {...s, vocab: [...s.vocab, {thai:"",thaiScript:"",korean:""}]}));
  const removeVocab = (si, vi) =>
    setSents(p => p.map((s, i) => i !== si ? s : {...s, vocab: s.vocab.filter((_, j) => j !== vi)}));
  const addSent = () => setSents(p => [...p, blank()]);
  const removeSent = si => setSents(p => p.filter((_, i) => i !== si));

  // ── 기존 문장 편집 ──
  const [editSents, setEditSents] = useState(() =>
    mode === "existing" && targetKey
      ? (existingLessons[targetKey]?.sentences||[]).map(s=>({...s,vocab:[...(s.vocab||[]).map(v=>({...v}))]}))
      : []
  );
  // ── 기존 농담 편집 ──
  const [editJokes, setEditJokes] = useState(() =>
    mode === "existing" && targetKey
      ? (existingLessons[targetKey]?.lessonJokes||[]).map(j=>({...j,vocab:[...(j.vocab||[]).map(v=>({...v}))]}))
      : []
  );
  useEffect(() => {
    if (mode === "existing" && targetKey) {
      setEditSents((existingLessons[targetKey]?.sentences||[]).map(s=>({...s,vocab:[...(s.vocab||[]).map(v=>({...v}))]})));
      setEditJokes((existingLessons[targetKey]?.lessonJokes||[]).map(j=>({...j,vocab:[...(j.vocab||[]).map(v=>({...v}))]})));
    } else {
      setEditSents([]);
      setEditJokes([]);
    }
  }, [targetKey, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateEditJoke = (ji, field, val) =>
    setEditJokes(p => p.map((j, i) => i === ji ? {...j, [field]: val} : j));
  const removeEditJoke = ji =>
    setEditJokes(p => p.filter((_, i) => i !== ji));
  const updateEditJokeVocab = (ji, vi, field, val) =>
    setEditJokes(p => p.map((j, i) => i !== ji ? j : {...j, vocab: (j.vocab||[]).map((v, k) => k === vi ? {...v, [field]: val} : v)}));
  const addEditJokeVocab = ji =>
    setEditJokes(p => p.map((j, i) => i !== ji ? j : {...j, vocab: [...(j.vocab||[]), {thai:"",thaiScript:"",korean:""}]}));
  const removeEditJokeVocab = (ji, vi) =>
    setEditJokes(p => p.map((j, i) => i !== ji ? j : {...j, vocab: (j.vocab||[]).filter((_, k) => k !== vi)}));

  const updateExistSent = (si, field, val) =>
    setEditSents(p => p.map((s, i) => i === si ? {...s, [field]: val} : s));
  const updateExistVocab = (si, vi, field, val) =>
    setEditSents(p => p.map((s, i) => i !== si ? s : {...s, vocab: (s.vocab||[]).map((v, j) => j === vi ? {...v, [field]: val} : v)}));
  const addExistVocab = si =>
    setEditSents(p => p.map((s, i) => i !== si ? s : {...s, vocab: [...(s.vocab||[]), {thai:"",thaiScript:"",korean:""}]}));
  const removeExistVocab = (si, vi) =>
    setEditSents(p => p.map((s, i) => i !== si ? s : {...s, vocab: (s.vocab||[]).filter((_, j) => j !== vi)}));

  const handleSave = () => {
    const key = mode === "new" ? newKey.trim() : targetKey;
    if (!key) return;
    const validSents = sents.filter(s => s.thai.trim()).map((s, i) => ({
      id: `t_${key}_${Date.now()}_${i}`,
      thai: s.thai.trim(), thaiScript: s.thaiScript?.trim()||"", korean: s.korean.trim(),
      vocab: s.vocab.filter(v => v.thai.trim()).map(v => ({thai:v.thai.trim(), thaiScript:v.thaiScript?.trim()||"", korean:v.korean.trim()}))
    }));
    if (mode === "new" && !validSents.length) return;
    onSave({ mode, key, topic: newTopic, sents: validSents,
      editSents: mode === "existing" ? editSents : undefined,
      editJokes: mode === "existing" ? editJokes : undefined,
      customJokes: customJokes.filter(j => j.thai.trim()).map(j => ({
        ...j, vocab: j.vocab.filter(v => v.thai.trim())
      })) });
  };

  const isBtnActive = (k) => mode === "existing" && targetKey === k;

  return (
    <div style={{background:"var(--color-background-primary)",border:`0.5px solid ${uColor}`,borderRadius:"var(--border-radius-lg)",padding:"18px",marginTop:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <p style={{margin:0,fontSize:"14px",fontWeight:500}}>새 수업 추가</p>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:"20px",lineHeight:1,padding:"0 4px"}}>×</button>
      </div>

      {/* 날짜 선택 */}
      <div style={{marginBottom:"16px"}}>
        <p style={{margin:"0 0 8px",fontSize:"12px",fontWeight:500,color:"var(--color-text-secondary)"}}>날짜 선택</p>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"8px"}}>
          {Object.keys(existingLessons).sort((a, b) => {
            const toNum = s => {
              if (!s) return 0;
              if (s.includes('/')) { const [m, d] = s.split('/').map(Number); return (m||0)*100+(d||0); }
              const m = parseInt(s); const d = parseInt(s.replace(/^\d+월\s*/, ''));
              return (m||0)*100+(d||0);
            };
            return toNum(b) - toNum(a);
          }).map(k => (
            <button key={k} onClick={() => { setMode("existing"); setTargetKey(k); }}
              style={{background:isBtnActive(k)?uColor:"var(--color-background-secondary)",color:isBtnActive(k)?"#fff":"var(--color-text-secondary)",border:`0.5px solid ${isBtnActive(k)?uColor:"var(--color-border-tertiary)"}`,borderRadius:"20px",padding:"6px 14px",fontSize:"12px",cursor:"pointer",fontWeight:isBtnActive(k)?500:400}}>
              {existingLessons[k].label}
            </button>
          ))}
          <button onClick={() => setMode("new")}
            style={{background:mode==="new"?uColor:"var(--color-background-secondary)",color:mode==="new"?"#fff":"var(--color-text-secondary)",border:`0.5px solid ${mode==="new"?uColor:"var(--color-border-tertiary)"}`,borderRadius:"20px",padding:"6px 14px",fontSize:"12px",cursor:"pointer"}}>
            + 새 날짜
          </button>
        </div>
        {mode === "new" && (
          <div style={{display:"flex",gap:"8px"}}>
            <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="날짜 (예: 5/30)"
              style={{flex:1,padding:"8px 12px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none"}} />
            <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="주제 (예: 음식 주문)"
              style={{flex:2,padding:"8px 12px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none"}} />
          </div>
        )}
        {mode === "existing" && targetKey && (
          <p style={{margin:"6px 0 0",fontSize:"12px",color:"var(--color-text-secondary)"}}>{existingLessons[targetKey]?.label} 수업에 문장을 추가해요</p>
        )}
      </div>

      {/* 기존 문장 수정 (existing 모드에서만 표시) */}
      {mode === "existing" && editSents.length > 0 && (
        <div style={{marginBottom:"16px"}}>
          <p style={{margin:"0 0 10px",fontSize:"12px",fontWeight:500,color:"var(--color-text-secondary)"}}>기존 문장 수정</p>
          {editSents.map((s, si) => (
            <div key={s.id||si} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"14px",marginBottom:"10px",border:`0.5px solid ${uColor}30`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                <span style={{fontSize:"12px",fontWeight:500,color:"var(--color-text-secondary)"}}>문장 {si + 1}</span>
                <button onClick={() => setEditSents(p => p.filter((_, i) => i !== si))} style={{background:"none",border:"none",cursor:"pointer",color:"#C0392B",fontSize:"12px",padding:"2px 6px"}}>× 문장 삭제</button>
              </div>
              <div style={{marginBottom:"8px"}}>
                <label style={{display:"block",fontSize:"11px",color:"var(--color-text-tertiary)",marginBottom:"4px",fontWeight:500}}>태국어 (한글 발음)</label>
                <input value={s.thai} onChange={e => updateExistSent(si, "thai", e.target.value)}
                  style={{width:"100%",padding:"9px 12px",border:`0.5px solid ${s.thai?uColor:"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"16px",boxSizing:"border-box",outline:"none",fontWeight:500,color:uColor,background:"var(--color-background-primary)"}} />
              </div>
              <div style={{marginBottom:"8px"}}>
                <label style={{display:"block",fontSize:"11px",color:"#1A936F",marginBottom:"4px",fontWeight:500}}>태국 문자 (선택사항 · 듣기 기능용)</label>
                <input value={s.thaiScript||""} onChange={e => updateExistSent(si, "thaiScript", e.target.value)}
                  placeholder="예: กินข้าวมาแล้วหรือยังครับ"
                  style={{width:"100%",padding:"9px 12px",border:`0.5px solid ${s.thaiScript?"#1A936F":"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"16px",boxSizing:"border-box",outline:"none",fontWeight:500,color:"#1A936F",background:"var(--color-background-primary)"}} />
              </div>
              <div style={{marginBottom:"12px"}}>
                <label style={{display:"block",fontSize:"11px",color:"var(--color-text-tertiary)",marginBottom:"4px",fontWeight:500}}>뜻 (한국어)</label>
                <input value={s.korean} onChange={e => updateExistSent(si, "korean", e.target.value)}
                  style={{width:"100%",padding:"9px 12px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",outline:"none",background:"var(--color-background-primary)"}} />
              </div>
              <div>
                <label style={{display:"block",fontSize:"11px",color:"var(--color-text-tertiary)",marginBottom:"8px",fontWeight:500}}>단어</label>
                {(s.vocab||[]).map((v, vi) => (
                  <div key={vi} style={{marginBottom:"8px"}}>
                    <div style={{display:"flex",gap:"6px",marginBottom:"4px",alignItems:"center"}}>
                      <input value={v.thai} onChange={e => updateExistVocab(si, vi, "thai", e.target.value)} placeholder="발음"
                        style={{flex:1,padding:"7px 10px",border:`0.5px solid ${v.thai?uColor:"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none",color:uColor,fontWeight:v.thai?500:400,background:"var(--color-background-primary)"}} />
                      <span style={{color:"var(--color-text-tertiary)",fontSize:"13px",flexShrink:0}}>→</span>
                      <input value={v.korean} onChange={e => updateExistVocab(si, vi, "korean", e.target.value)} placeholder="뜻"
                        style={{flex:1,padding:"7px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none",background:"var(--color-background-primary)"}} />
                      {(s.vocab||[]).length > 1 && (
                        <button onClick={() => removeExistVocab(si, vi)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:"18px",padding:"0 4px",flexShrink:0,lineHeight:1}}>×</button>
                      )}
                    </div>
                    <input value={v.thaiScript||""} onChange={e => updateExistVocab(si, vi, "thaiScript", e.target.value)} placeholder="태국 문자 (예: กิน)"
                      style={{width:"100%",padding:"6px 10px",border:`0.5px solid ${v.thaiScript?"#1A936F":"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none",color:"#1A936F",fontWeight:v.thaiScript?500:400,background:"var(--color-background-primary)",boxSizing:"border-box"}} />
                  </div>
                ))}
                <button onClick={() => addExistVocab(si)}
                  style={{width:"100%",background:"none",border:`0.5px dashed ${uColor}`,borderRadius:"var(--border-radius-md)",padding:"6px",fontSize:"12px",cursor:"pointer",color:uColor,marginTop:"4px"}}>
                  + 단어 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 문장 추가 */}
      {sents.map((s, si) => (
        <div key={si} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"14px",marginBottom:"10px",border:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
            <span style={{fontSize:"12px",fontWeight:500,color:"var(--color-text-secondary)"}}>문장 {si + 1}</span>
            {sents.length > 1 && (
              <button onClick={() => removeSent(si)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:"13px",padding:"2px 6px"}}>× 삭제</button>
            )}
          </div>

          <div style={{marginBottom:"8px"}}>
            <label style={{display:"block",fontSize:"11px",color:"var(--color-text-tertiary)",marginBottom:"4px",fontWeight:500}}>태국어 (한글 발음)</label>
            <input value={s.thai} onChange={e => updateSent(si, "thai", e.target.value)}
              placeholder="예: 낀 카우 마 양 캅?"
              style={{width:"100%",padding:"9px 12px",border:`0.5px solid ${s.thai?uColor:"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"16px",boxSizing:"border-box",outline:"none",fontWeight:500,color:uColor,background:"var(--color-background-primary)"}} />
          </div>

          <div style={{marginBottom:"8px"}}>
            <label style={{display:"block",fontSize:"11px",color:"#1A936F",marginBottom:"4px",fontWeight:500}}>태국 문자 (선택사항 · 듣기 기능용)</label>
            <input value={s.thaiScript||""} onChange={e => updateSent(si, "thaiScript", e.target.value)}
              placeholder="예: กินข้าวมาแล้วหรือยังครับ"
              style={{width:"100%",padding:"9px 12px",border:`0.5px solid ${s.thaiScript?"#1A936F":"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"16px",boxSizing:"border-box",outline:"none",fontWeight:500,color:"#1A936F",background:"var(--color-background-primary)"}} />
          </div>

          <div style={{marginBottom:"12px"}}>
            <label style={{display:"block",fontSize:"11px",color:"var(--color-text-tertiary)",marginBottom:"4px",fontWeight:500}}>뜻 (한국어)</label>
            <input value={s.korean} onChange={e => updateSent(si, "korean", e.target.value)}
              placeholder="예: 식사는 먹고 오셨나요?"
              style={{width:"100%",padding:"9px 12px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",outline:"none",background:"var(--color-background-primary)"}} />
          </div>

          <div>
            <label style={{display:"block",fontSize:"11px",color:"var(--color-text-tertiary)",marginBottom:"8px",fontWeight:500}}>단어</label>
            {s.vocab.map((v, vi) => (
              <div key={vi} style={{marginBottom:"8px"}}>
                <div style={{display:"flex",gap:"6px",marginBottom:"4px",alignItems:"center"}}>
                  <input value={v.thai} onChange={e => updateVocab(si, vi, "thai", e.target.value)} placeholder="발음"
                    style={{flex:1,padding:"7px 10px",border:`0.5px solid ${v.thai?uColor:"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none",color:uColor,fontWeight:v.thai?500:400,background:"var(--color-background-primary)"}} />
                  <span style={{color:"var(--color-text-tertiary)",fontSize:"13px",flexShrink:0}}>→</span>
                  <input value={v.korean} onChange={e => updateVocab(si, vi, "korean", e.target.value)} placeholder="뜻"
                    style={{flex:1,padding:"7px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none",background:"var(--color-background-primary)"}} />
                  {s.vocab.length > 1 && (
                    <button onClick={() => removeVocab(si, vi)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:"18px",padding:"0 4px",flexShrink:0,lineHeight:1}}>×</button>
                  )}
                </div>
                <input value={v.thaiScript||""} onChange={e => updateVocab(si, vi, "thaiScript", e.target.value)} placeholder="태국 문자 (예: กิน)"
                  style={{width:"100%",padding:"6px 10px",border:`0.5px solid ${v.thaiScript?"#1A936F":"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none",color:"#1A936F",fontWeight:v.thaiScript?500:400,background:"var(--color-background-primary)",boxSizing:"border-box"}} />
              </div>
            ))}
            <button onClick={() => addVocab(si)}
              style={{width:"100%",background:"none",border:`0.5px dashed ${uColor}`,borderRadius:"var(--border-radius-md)",padding:"6px",fontSize:"12px",cursor:"pointer",color:uColor,marginTop:"4px"}}>
              + 단어 추가
            </button>
          </div>
        </div>
      ))}

      {mode === "existing" && (
        <p style={{margin:"0 0 8px",fontSize:"12px",fontWeight:500,color:"var(--color-text-secondary)"}}>새 문장 추가 (선택사항)</p>
      )}
      <button onClick={addSent}
        style={{width:"100%",background:"none",border:"0.5px dashed var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px",fontSize:"13px",cursor:"pointer",color:"var(--color-text-secondary)",marginBottom:"14px"}}>
        + 문장 추가
      </button>

      {/* 기존 농담 수정 (existing 모드에서만 표시) */}
      {mode === "existing" && editJokes.length > 0 && (
        <div style={{marginBottom:"14px"}}>
          <p style={{margin:"0 0 10px",fontSize:"12px",fontWeight:500,color:"var(--color-text-secondary)"}}>기존 농담 수정</p>
          {editJokes.map((j, ji) => (
            <div key={j.id||ji} style={{background:"#FAEEDA",border:"0.5px solid #EF9F27",borderRadius:"var(--border-radius-md)",padding:"12px",marginBottom:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                <span style={{fontSize:"12px",fontWeight:500,color:"#854F0B",display:"flex",alignItems:"center",gap:"5px"}}>
                  <span style={{background:"#D85A30",color:"#fff",fontSize:"10px",padding:"1px 6px",borderRadius:"10px"}}>농담</span>
                  {ji + 1}
                </span>
                <button onClick={() => removeEditJoke(ji)} style={{background:"none",border:"none",cursor:"pointer",color:"#C0392B",fontSize:"12px",padding:"2px 6px"}}>× 농담 삭제</button>
              </div>
              <div style={{marginBottom:"6px"}}>
                <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"3px",fontWeight:500}}>태국어 (한글 발음)</label>
                <input value={j.thai||""} onChange={e => updateEditJoke(ji,"thai",e.target.value)}
                  style={{width:"100%",padding:"8px 10px",border:`0.5px solid ${j.thai?"#EF9F27":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",outline:"none",background:"#fff",color:"#633806",fontWeight:j.thai?500:400}} />
              </div>
              <div style={{marginBottom:"6px"}}>
                <label style={{display:"block",fontSize:"11px",color:"#1A936F",marginBottom:"3px",fontWeight:500}}>태국 문자 (선택사항)</label>
                <input value={j.thaiScript||""} onChange={e => updateEditJoke(ji,"thaiScript",e.target.value)} placeholder="예: วันนี้สวยมากครับ"
                  style={{width:"100%",padding:"8px 10px",border:`0.5px solid ${j.thaiScript?"#1A936F":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",outline:"none",background:"#fff",color:"#1A936F",fontWeight:j.thaiScript?500:400}} />
              </div>
              <div style={{marginBottom:"6px"}}>
                <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"3px",fontWeight:500}}>뜻 (한국어)</label>
                <input value={j.korean||""} onChange={e => updateEditJoke(ji,"korean",e.target.value)}
                  style={{width:"100%",padding:"8px 10px",border:"0.5px solid #D8BF90",borderRadius:"var(--border-radius-md)",fontSize:"13px",boxSizing:"border-box",outline:"none",background:"#fff"}} />
              </div>
              <div style={{marginBottom:"6px"}}>
                <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"3px",fontWeight:500}}>메모</label>
                <input value={j.note||""} onChange={e => updateEditJoke(ji,"note",e.target.value)}
                  style={{width:"100%",padding:"8px 10px",border:"0.5px solid #D8BF90",borderRadius:"var(--border-radius-md)",fontSize:"13px",boxSizing:"border-box",outline:"none",background:"#fff"}} />
              </div>
              <div>
                <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"6px",fontWeight:500}}>단어</label>
                {(j.vocab||[]).map((v, vi) => (
                  <div key={vi} style={{marginBottom:"8px"}}>
                    <div style={{display:"flex",gap:"6px",marginBottom:"4px",alignItems:"center"}}>
                      <input value={v.thai||""} onChange={e => updateEditJokeVocab(ji,vi,"thai",e.target.value)} placeholder="발음"
                        style={{flex:1,padding:"6px 8px",border:`0.5px solid ${v.thai?"#EF9F27":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"12px",outline:"none",color:"#633806",fontWeight:v.thai?500:400,background:"#fff"}} />
                      <span style={{color:"#B08040",fontSize:"12px",flexShrink:0}}>→</span>
                      <input value={v.korean||""} onChange={e => updateEditJokeVocab(ji,vi,"korean",e.target.value)} placeholder="뜻"
                        style={{flex:1,padding:"6px 8px",border:"0.5px solid #D8BF90",borderRadius:"var(--border-radius-md)",fontSize:"12px",outline:"none",background:"#fff"}} />
                      {(j.vocab||[]).length > 1 && (
                        <button onClick={() => removeEditJokeVocab(ji,vi)} style={{background:"none",border:"none",cursor:"pointer",color:"#B08040",fontSize:"16px",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
                      )}
                    </div>
                    <input value={v.thaiScript||""} onChange={e => updateEditJokeVocab(ji,vi,"thaiScript",e.target.value)} placeholder="태국 문자 (예: กิน)"
                      style={{width:"100%",padding:"5px 8px",border:`0.5px solid ${v.thaiScript?"#1A936F":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"12px",outline:"none",color:"#1A936F",fontWeight:v.thaiScript?500:400,background:"#fff",boxSizing:"border-box"}} />
                  </div>
                ))}
                <button onClick={() => addEditJokeVocab(ji)}
                  style={{width:"100%",background:"none",border:"0.5px dashed #EF9F27",borderRadius:"var(--border-radius-md)",padding:"5px",fontSize:"11px",cursor:"pointer",color:"#854F0B",marginTop:"2px"}}>
                  + 단어 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 농담 추가 */}
      <div style={{marginBottom:"14px"}}>
        <p style={{margin:"0 0 10px",fontSize:"12px",fontWeight:500,color:"var(--color-text-secondary)"}}>{mode === "existing" ? "새 농담 추가 (선택사항)" : "농담 추가 (선택사항)"}</p>
        {customJokes.map((j, ji) => (
          <div key={ji} style={{background:"#FAEEDA",border:"0.5px solid #EF9F27",borderRadius:"var(--border-radius-md)",padding:"12px",marginBottom:"8px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <span style={{fontSize:"12px",fontWeight:500,color:"#854F0B",display:"flex",alignItems:"center",gap:"5px"}}>
                <span style={{background:"#D85A30",color:"#fff",fontSize:"10px",padding:"1px 6px",borderRadius:"10px"}}>농담</span>
                {ji + 1}
              </span>
              <button onClick={() => removeCustomJoke(ji)} style={{background:"none",border:"none",cursor:"pointer",color:"#854F0B",fontSize:"13px",padding:"2px 6px"}}>× 삭제</button>
            </div>
            <div style={{marginBottom:"6px"}}>
              <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"3px",fontWeight:500}}>태국어 (한글 발음)</label>
              <input value={j.thai} onChange={e => updateCustomJoke(ji,"thai",e.target.value)} placeholder="예: 완니 쑤~어이 막캅?"
                style={{width:"100%",padding:"8px 10px",border:`0.5px solid ${j.thai?"#EF9F27":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",outline:"none",background:"#fff",color:"#633806",fontWeight:j.thai?500:400}} />
            </div>
            <div style={{marginBottom:"6px"}}>
              <label style={{display:"block",fontSize:"11px",color:"#1A936F",marginBottom:"3px",fontWeight:500}}>태국 문자 (선택사항 · 듣기 기능용)</label>
              <input value={j.thaiScript||""} onChange={e => updateCustomJoke(ji,"thaiScript",e.target.value)} placeholder="예: วันนี้สวยมากครับ"
                style={{width:"100%",padding:"8px 10px",border:`0.5px solid ${j.thaiScript?"#1A936F":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",outline:"none",background:"#fff",color:"#1A936F",fontWeight:j.thaiScript?500:400}} />
            </div>
            <div style={{marginBottom:"6px"}}>
              <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"3px",fontWeight:500}}>뜻 (한국어)</label>
              <input value={j.korean} onChange={e => updateCustomJoke(ji,"korean",e.target.value)} placeholder="예: 오늘 예쁘네요?"
                style={{width:"100%",padding:"8px 10px",border:"0.5px solid #D8BF90",borderRadius:"var(--border-radius-md)",fontSize:"13px",boxSizing:"border-box",outline:"none",background:"#fff"}} />
            </div>
            <div>
              <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"3px",fontWeight:500}}>메모 (예: 여자한테만)</label>
              <input value={j.note} onChange={e => updateCustomJoke(ji,"note",e.target.value)} placeholder="사용 대상이나 상황"
                style={{width:"100%",padding:"8px 10px",border:"0.5px solid #D8BF90",borderRadius:"var(--border-radius-md)",fontSize:"13px",boxSizing:"border-box",outline:"none",background:"#fff"}} />
            </div>
            <div style={{marginTop:"8px"}}>
              <label style={{display:"block",fontSize:"11px",color:"#854F0B",marginBottom:"6px",fontWeight:500}}>단어 (선택사항)</label>
              {j.vocab.map((v, vi) => (
                <div key={vi} style={{marginBottom:"8px"}}>
                  <div style={{display:"flex",gap:"6px",marginBottom:"4px",alignItems:"center"}}>
                    <input value={v.thai} onChange={e => updateJokeVocab(ji,vi,"thai",e.target.value)} placeholder="발음"
                      style={{flex:1,padding:"6px 8px",border:`0.5px solid ${v.thai?"#EF9F27":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"12px",outline:"none",color:"#633806",fontWeight:v.thai?500:400,background:"#fff"}} />
                    <span style={{color:"#B08040",fontSize:"12px",flexShrink:0}}>→</span>
                    <input value={v.korean} onChange={e => updateJokeVocab(ji,vi,"korean",e.target.value)} placeholder="뜻"
                      style={{flex:1,padding:"6px 8px",border:"0.5px solid #D8BF90",borderRadius:"var(--border-radius-md)",fontSize:"12px",outline:"none",background:"#fff"}} />
                    {j.vocab.length > 1 && (
                      <button onClick={() => removeJokeVocab(ji,vi)} style={{background:"none",border:"none",cursor:"pointer",color:"#B08040",fontSize:"16px",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
                    )}
                  </div>
                  <input value={v.thaiScript||""} onChange={e => updateJokeVocab(ji,vi,"thaiScript",e.target.value)} placeholder="태국 문자 (예: กิน)"
                    style={{width:"100%",padding:"5px 8px",border:`0.5px solid ${v.thaiScript?"#1A936F":"#D8BF90"}`,borderRadius:"var(--border-radius-md)",fontSize:"12px",outline:"none",color:"#1A936F",fontWeight:v.thaiScript?500:400,background:"#fff",boxSizing:"border-box"}} />
                </div>
              ))}
              <button onClick={() => addJokeVocab(ji)}
                style={{width:"100%",background:"none",border:"0.5px dashed #EF9F27",borderRadius:"var(--border-radius-md)",padding:"5px",fontSize:"11px",cursor:"pointer",color:"#854F0B",marginTop:"2px"}}>
                + 단어 추가
              </button>
            </div>
          </div>
        ))}
        <button onClick={addCustomJoke}
          style={{width:"100%",background:"none",border:"0.5px dashed #EF9F27",borderRadius:"var(--border-radius-md)",padding:"8px",fontSize:"12px",cursor:"pointer",color:"#854F0B"}}>
          + 농담 추가
        </button>
      </div>

      <button onClick={handleSave}
        style={{width:"100%",background:uColor,color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"12px",fontSize:"14px",cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
        <i className="ti ti-device-floppy" aria-hidden="true" /> 수업에 저장하기
      </button>
      <p style={{margin:"8px 0 0",fontSize:"11px",color:"var(--color-text-tertiary)",textAlign:"center"}}>
        저장하면 배우기 · 사용체크 · 단어게임 · 단어사전에 바로 반영돼요
      </p>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────
// ─── localStorage helpers ────────────────────────────────
const LS = {
  get: (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  del: (key) => { try { localStorage.removeItem(key); } catch {} },
};

// 앱 버전
const APP_VERSION = "v2";

// ─── Google Sheets API helpers ────────────────────────────
const GS_URL = import.meta.env.VITE_GS_API || "";

const gsLoad = async () => {
  if (!GS_URL) return null;
  try {
    const res = await fetch(`${GS_URL}?t=${Date.now()}`, { redirect: "follow" });
    const json = await res.json();
    return json.ok ? json.data : null;
  } catch { return null; }
};

const gsSave = (() => {
  const timers = {};
  return (key, value) => {
    if (!GS_URL) return;
    clearTimeout(timers[key]);
    timers[key] = setTimeout(() => {
      fetch(GS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ key, value }),
      }).catch(() => {});
    }, 1500);
  };
})();

export default function ThaiApp() {
  const [users, setUsers] = useState(() => LS.get("kp_users", [{id:"u1",name:"지노 대표님",ci:0}]));
  const [currentUserId, setCurrentUserId] = useState(null);
  const [newUserName, setNewUserName] = useState("");
  const [addingUser, setAddingUser] = useState(false);

  const [allData, setAllData] = useState(() => LS.get("kp_allData", {u1:{used:{},jokeUsed:{},gameHistory:[]}}));
  const [tab, setTab] = useState("learn");
  const [lessonKey, setLessonKey] = useState(() => {
    const saved = LS.get("kp_lessons", null);
    const keys = saved ? Object.keys(saved) : Object.keys(INITIAL_LESSONS);
    return keys.sort((a, b) => {
      const toNum = s => {
        if (!s) return 0;
        if (s.includes('/')) { const [m, d] = s.split('/').map(Number); return (m||0)*100+(d||0); }
        const m = parseInt(s); const d = parseInt(s.replace(/^\d+월\s*/, ''));
        return (m||0)*100+(d||0);
      };
      return toNum(b) - toNum(a);
    })[0] || "5/23";
  });
  const [lessons, setLessons] = useState(() => LS.get("kp_lessons", INITIAL_LESSONS));
  const [idx, setIdx] = useState(0);
  const [kIdx, setKIdx] = useState(-1);
  const [speaking, setSpeaking] = useState(false);
  const [showKo, setShowKo] = useState(true);
  const [dictCat, setDictCat] = useState("전체");
  const [dictSearch, setDictSearch] = useState("");
  const [entering, setEntering] = useState(null); // {type,id}
  const [draft, setDraft] = useState("");
  const [draftMeaning, setDraftMeaning] = useState("");
  const [game, setGame] = useState(null);
  const [teacher, setTeacher] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [tViewUid, setTViewUid] = useState("all");
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [loadingData, setLoadingData] = useState(!!GS_URL);
  const [syncing, setSyncing] = useState(false);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);

  const timers = useRef([]);

  const myRaw = allData[currentUserId] || {used:{},jokeUsed:{},gameHistory:[]};
  const updMyData = (fn) => {
    const uid = currentUserId;
    setAllData(p => ({...p, [uid]: fn(p[uid] || {used:{},jokeUsed:{},gameHistory:[]})}));
  };

  // 날짜 키를 최신순(내림차순)으로 정렬
  const sortedLessonKeys = Object.keys(lessons).sort((a, b) => {
    const toNum = s => {
      if (!s) return 0;
      if (s.includes('/')) { const [m, d] = s.split('/').map(Number); return (m||0)*100+(d||0); }
      const m = parseInt(s); const d = parseInt(s.replace(/^\d+월\s*/, ''));
      return (m||0)*100+(d||0);
    };
    return toNum(b) - toNum(a);
  });

  const lesson = lessons[lessonKey];
  const sentences = lesson?.sentences || [];
  const cur = sentences[idx] || sentences[0];
  const lessonJokes = lesson?.lessonJokes || [];
  const usedL = myRaw.used?.[lessonKey] || {};
  const jokeUsedL = myRaw.jokeUsed?.[lessonKey] || {};
  const totalChecks = sentences.length + lessonJokes.length;
  const doneCount = Object.keys(usedL).length + Object.keys(jokeUsedL).length;

  const curUser = users.find(u => u.id === currentUserId);
  const uColor = curUser ? PALETTE[curUser.ci % PALETTE.length] : "#D85A30";

  const getDictCats = () => {
    const lessonV = Object.values(lessons).flatMap(l => l.sentences.flatMap(s => s.vocab || []));
    const uniqueL = [...new Map(lessonV.map(v => [v.thai, v])).values()];
    return uniqueL.length ? { "📚 수업 단어": uniqueL } : {};
  };
  const dictCats = getDictCats();
  const allDictVocab = (() => {
    const base = dictCat === "전체"
      ? [...new Map(Object.values(dictCats).flat().map(v => [v.thai, v])).values()]
      : (dictCats[dictCat] || []);
    if (!dictSearch.trim()) return base;
    const q = dictSearch.trim().toLowerCase();
    return base.filter(v => v.thai.toLowerCase().includes(q) || v.korean.includes(q));
  })();

  // ── TTS (태국어) ──
  const clearT = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const speak = (thaiScript) => {
    if (!window.speechSynthesis || !thaiScript?.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(thaiScript);
    u.lang = "th-TH";
    window.speechSynthesis.speak(u);
  };
  const stopSpeak = () => { window.speechSynthesis?.cancel(); };

  // ── Check ──
  const startCheck = (type, id) => { setEntering({type, id}); setDraft(""); setDraftMeaning(""); };
  const saveCheck = (type, id) => {
    const time = new Date().toLocaleTimeString("ko-KR", {hour:"2-digit",minute:"2-digit"});
    const key = lessonKey;
    if (type === "sent") {
      updMyData(d => ({...d, used:{...d.used, [key]:{...(d.used?.[key]||{}), [id]:{time, answer:draft, answerMeaning:draftMeaning}}}}));
    } else {
      updMyData(d => ({...d, jokeUsed:{...d.jokeUsed, [key]:{...(d.jokeUsed?.[key]||{}), [id]:{time, answer:draft, answerMeaning:draftMeaning}}}}));
    }
    setEntering(null); setDraft(""); setDraftMeaning("");
  };
  const editCheck = (type, id) => {
    const rec = (type === "sent" ? usedL : jokeUsedL)[id];
    setDraft(rec?.answer || "");
    setDraftMeaning(rec?.answerMeaning || "");
    setEntering({type, id});
  };

  // ── Game ──
  const getAllVocab = () => {
    const all = Object.values(lessons).flatMap(l => l.sentences.flatMap(s => s.vocab || []));
    return [...new Map(all.map(v => [v.thai, v])).values()];
  };

  const MASTERY_THRESHOLD = 5;

  const startGame = () => {
    const masteredWords = myRaw.masteredWords || {};
    const allVocab = getAllVocab();
    if (allVocab.length < 4) { alert("단어가 4개 이상 있어야 해요! 선생님이 단어를 추가해주세요."); return; }
    const todayVocab = [...new Map(sentences.flatMap(x => x.vocab || []).map(v => [v.thai, v])).values()];
    const todayKeys = new Set(todayVocab.map(v => v.thai));
    const todayPool = todayVocab.filter(v => (masteredWords[v.thai]||0) < MASTERY_THRESHOLD).sort(() => Math.random() - 0.5);
    const otherPool = allVocab.filter(v => !todayKeys.has(v.thai) && (masteredWords[v.thai]||0) < MASTERY_THRESHOLD).sort(() => Math.random() - 0.5);
    const pool = [...todayPool, ...otherPool].slice(0, 8);
    if (pool.length < 2) { alert("학습할 단어가 부족해요! 이미 대부분 암기했거나 단어를 추가해주세요. 🎉"); return; }
    setGame({
      q: pool.map(v => ({ ...v, opts: [...allVocab.filter(x => x.thai !== v.thai).sort(() => Math.random() - 0.5).slice(0, 3), v].sort(() => Math.random() - 0.5), ans: null })),
      cur: 0, score: 0, done: false, totalVocab: allVocab.length
    });
  };

  const pickAns = (opt) => {
    if (!game || game.done || game.cur >= game.q.length || game.q[game.cur].ans !== null) return;
    const qIdx = game.cur;
    const correct = opt.korean === game.q[qIdx].korean;
    const newQ = game.q.map((q, i) => i === qIdx ? {...q, ans: opt.korean} : q);
    const newScore = correct ? game.score + 1 : game.score;
    const next = qIdx + 1;
    const done = next >= game.q.length;
    setGame(g => ({...g, q: newQ, score: newScore}));
    if (correct) {
      const thai = game.q[qIdx].thai;
      const uid = currentUserId;
      setAllData(p => { const prev = p[uid] || {used:{},jokeUsed:{},gameHistory:[],masteredWords:{}}; const mw = {...(prev.masteredWords||{}), [thai]: (prev.masteredWords?.[thai]||0) + 1}; return {...p, [uid]: {...prev, masteredWords: mw}}; });
    }
    setTimeout(() => {
      setGame(g => g ? {...g, cur: next, done} : g);
      if (done) {
        const wrong = newQ.filter(q => q.ans && q.ans !== q.korean).map(q => ({thai:q.thai, correct:q.korean, picked:q.ans}));
        const sc = newQ.filter(q => q.ans === q.korean).length;
        const uid = currentUserId; const lk = lessonKey;
        setAllData(p => { const prev = p[uid] || {used:{},jokeUsed:{},gameHistory:[],masteredWords:{}}; return {...p, [uid]: {...prev, gameHistory:[...(prev.gameHistory||[]), {id:Date.now(), date:new Date().toLocaleDateString("ko-KR"), lessonKey:lk, score:sc, total:newQ.length, wrong}]}}; });
      }
    }, 700);
  };

  // ── Lesson save ──
  const handleLessonSave = ({mode, key, topic, sents, customJokes, editSents, editJokes}) => {
    const newLessonJokes = (customJokes||[]).filter(j => j.thai.trim()).map((j, i) => ({
      id: `lj_${key}_${Date.now()}_${i}`,
      thai: j.thai.trim(), thaiScript: j.thaiScript?.trim()||"", korean: j.korean.trim(), note: j.note?.trim()||"",
      vocab: (j.vocab||[]).filter(v => v.thai.trim()).map(v => ({thai:v.thai.trim(), thaiScript:v.thaiScript?.trim()||"", korean:v.korean.trim()}))
    }));
    if (mode === "new") {
      setLessons(p => ({...p, [key]: {label:key, topic:topic||"새 수업", sentences:sents, lessonJokes:newLessonJokes}}));
      setLessonKey(key);
    } else {
      setLessons(p => {
        const existing = p[key];
        // 기존 농담은 editJokes로 교체(수정/삭제 반영), 새 농담은 뒤에 추가
        const updatedJokes = editJokes !== undefined
          ? [...editJokes, ...newLessonJokes]
          : [...(existing.lessonJokes||[]), ...newLessonJokes];
        const updatedExisting = editSents
          ? editSents.map(s => ({...s, vocab: (s.vocab||[]).filter(v => v.thai.trim())}))
          : existing.sentences;
        return {...p, [key]: {...existing, sentences:[...updatedExisting, ...sents], lessonJokes:updatedJokes}};
      });
      setLessonKey(key);
    }
    setShowLessonForm(false);
    setIdx(0);
  };

  // ── Users ──
  const addUser = () => {
    if (!newUserName.trim()) return;
    const id = genId();
    setUsers(p => [...p, {id, name:newUserName.trim(), ci:p.length % PALETTE.length}]);
    setAllData(p => ({...p, [id]: {used:{},jokeUsed:{},gameHistory:[]}}));
    setNewUserName(""); setAddingUser(false);
  };

  // ── 앱 시작 시 Google Sheets에서 데이터 불러오기 ──
  useEffect(() => {
    if (!GS_URL) return;
    setLoadingData(true);
    gsLoad().then(data => {
      if (data) {
        if (data.kp_users)   { setUsers(data.kp_users);     LS.set("kp_users",   data.kp_users);   }
        if (data.kp_allData) { setAllData(data.kp_allData); LS.set("kp_allData", data.kp_allData); }
        if (data.kp_lessons) { setLessons(data.kp_lessons); LS.set("kp_lessons", data.kp_lessons); }
      }
    }).finally(() => setLoadingData(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── localStorage + Google Sheets 자동 저장 ──
  const isFirstRender = useRef({ users: true, allData: true, lessons: true });
  useEffect(() => {
    if (isFirstRender.current.users) { isFirstRender.current.users = false; return; }
    LS.set("kp_users", users);
    setSyncing(true);
    gsSave("kp_users", users);
    setTimeout(() => setSyncing(false), 2000);
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isFirstRender.current.allData) { isFirstRender.current.allData = false; return; }
    LS.set("kp_allData", allData);
    gsSave("kp_allData", allData);
  }, [allData]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isFirstRender.current.lessons) { isFirstRender.current.lessons = false; return; }
    LS.set("kp_lessons", lessons);
    setSyncing(true);
    gsSave("kp_lessons", lessons);
    setTimeout(() => setSyncing(false), 2000);
  }, [lessons]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 버전 마이그레이션 (앱 업데이트 시 1회 실행) ──
  useEffect(() => {
    if (LS.get("kp_app_version", "") === APP_VERSION) return;
    setUsers(prev => {
      const updated = prev.map(u => u.name === "크리스" ? {...u, name:"지노 대표님"} : u);
      LS.set("kp_users", updated);
      return updated;
    });
    LS.set("kp_app_version", APP_VERSION);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 엑셀(CSV) 내보내기 ──
  const exportCSV = () => {
    const rows = [["사용자","수업","유형","태국어","한국어","사용시간","상대방 답변","뜻"]];
    users.forEach(u => {
      const ud = allData[u.id] || {};
      Object.entries(ud.used || {}).forEach(([lk, sentMap]) => {
        const lesson = lessons[lk];
        Object.entries(sentMap).forEach(([sid, rec]) => {
          const sent = lesson?.sentences?.find(s => s.id === sid);
          rows.push([u.name, lesson?.label||lk, "문장", sent?.thai||sid, sent?.korean||"", rec.time||"", rec.answer||"", rec.answerMeaning||""]);
        });
      });
      Object.entries(ud.jokeUsed || {}).forEach(([lk, jokeMap]) => {
        const lesson = lessons[lk];
        Object.entries(jokeMap).forEach(([jid, rec]) => {
          const joke = (lesson?.lessonJokes||[]).find(j => j.id === jid);
          rows.push([u.name, lesson?.label||lk, "농담", joke?.thai||jid, joke?.korean||"", rec.time||"", rec.answer||"", rec.answerMeaning||""]);
        });
      });
      (ud.gameHistory || []).forEach(g => {
        rows.push([u.name, lessons[g.lessonKey]?.label||g.lessonKey, "게임", `${g.score}/${g.total}점`, g.date, "", "", ""]);
      });
    });
    const bom = "﻿";
    const csv = bom + rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
    a.download = `카라파싸_${new Date().toLocaleDateString("ko-KR").replace(/\. /g,"-").replace(".","")}_.csv`;
    a.click();
  };

  // ── 수업별 데이터 삭제 ──
  const deleteLesson = (lk) => {
    // 수업 자체 + 학습 기록 모두 삭제
    setLessons(p => { const n = {...p}; delete n[lk]; return n; });
    setAllData(p => {
      const next = {...p};
      Object.keys(next).forEach(uid => {
        const d = {...(next[uid] || {})};
        d.used = {...(d.used||{})}; delete d.used[lk];
        d.jokeUsed = {...(d.jokeUsed||{})}; delete d.jokeUsed[lk];
        d.gameHistory = (d.gameHistory||[]).filter(g => g.lessonKey !== lk);
        next[uid] = d;
      });
      return next;
    });
    setConfirmDeleteKey(null);
  };

  const resetAll = () => {
    const blank = {};
    users.forEach(u => { blank[u.id] = {used:{},jokeUsed:{},gameHistory:[]}; });
    setAllData(blank);
    setConfirmResetAll(false);
  };

  // Clear entering/draft when tab or lesson changes to prevent stale state
  useEffect(() => { setEntering(null); setDraft(""); setDraftMeaning(""); }, [tab]);
  useEffect(() => { setIdx(0); setEntering(null); setDraft(""); setDraftMeaning(""); }, [lessonKey]);
  useEffect(() => { setMemoText(myRaw.notes?.[lessonKey] || ""); setMemoSaved(false); }, [lessonKey, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { clearT(); window.speechSynthesis?.cancel(); }, []);

  // Un-check a sentence or joke (undo accidental check)
  const uncheckItem = (type, id) => {
    if (type === "sent") {
      updMyData(d => {
        const lk = lessonKey;
        const cur = {...(d.used?.[lk] || {})};
        delete cur[id];
        return {...d, used: {...d.used, [lk]: cur}};
      });
    } else {
      updMyData(d => {
        const lk = lessonKey;
        const cur = {...(d.jokeUsed?.[lk] || {})};
        delete cur[id];
        return {...d, jokeUsed: {...d.jokeUsed, [lk]: cur}};
      });
    }
  };

  const TABS = [
    {id:"learn",label:"배우기",icon:"ti-book"},
    {id:"practice",label:"사용 체크",icon:"ti-checkbox"},
    {id:"dict",label:"단어 사전",icon:"ti-vocabulary"},
    {id:"game",label:"단어 게임",icon:"ti-puzzle"},
    {id:"teacher",label:"선생님",icon:"ti-eye"},
  ];

  // ────────── LOADING ──────────
  if (loadingData) return (
    <div style={{minHeight:"500px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:"16px"}}>
      <p style={{fontSize:"32px",margin:0}}>🇹🇭</p>
      <p style={{fontSize:"16px",fontWeight:500,margin:0}}>카라파싸</p>
      <div style={{display:"flex",alignItems:"center",gap:"8px",color:"var(--color-text-secondary)",fontSize:"13px"}}>
        <div style={{width:"16px",height:"16px",border:"2px solid #D85A30",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
        Google Sheets에서 불러오는 중...
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ────────── USER SELECT ──────────
  if (!currentUserId) return (
    <div style={{minHeight:"500px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <p style={{fontSize:"32px",margin:"0 0 8px"}}>🇹🇭</p>
      <h1 style={{fontSize:"22px",fontWeight:500,margin:"0 0 4px"}}>태국어 배우기</h1>
      <p style={{fontSize:"14px",color:"var(--color-text-secondary)",margin:"0 0 32px"}}>누구로 시작할까요?</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:"10px",justifyContent:"center",marginBottom:"20px",maxWidth:"400px"}}>
        {users.map(u => (
          <button key={u.id} onClick={() => setCurrentUserId(u.id)}
            style={{background:PALETTE[u.ci%PALETTE.length],color:"#fff",border:"none",borderRadius:"var(--border-radius-lg)",padding:"14px 22px",fontSize:"15px",cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:"8px",minWidth:"120px",justifyContent:"center"}}>
            <span style={{width:"28px",height:"28px",borderRadius:"50%",background:"rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:600}}>{u.name[0]}</span>
            {u.name}
          </button>
        ))}
      </div>
      {addingUser ? (
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="이름 입력" autoFocus
            onKeyDown={e => e.key === "Enter" && addUser()}
            style={{padding:"10px 14px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"14px",outline:"none",width:"160px"}} />
          <button onClick={addUser} style={{background:"#D85A30",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"10px 16px",fontSize:"13px",cursor:"pointer"}}>추가</button>
          <button onClick={() => { setAddingUser(false); setNewUserName(""); }} style={{background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"10px 14px",fontSize:"13px",cursor:"pointer",color:"var(--color-text-secondary)"}}>취소</button>
        </div>
      ) : (
        <button onClick={() => setAddingUser(true)} style={{background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"10px 20px",fontSize:"13px",cursor:"pointer",color:"var(--color-text-secondary)",display:"flex",alignItems:"center",gap:"6px"}}>
          <i className="ti ti-plus" aria-hidden="true" /> 새 사용자 추가
        </button>
      )}
    </div>
  );

  // ────────── MAIN RENDER ──────────
  return (
    <div style={{minHeight:"600px",paddingBottom:"28px"}}>

      {/* HEADER */}
      <div style={{background:uColor,color:"#fff",padding:"16px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <button onClick={() => setCurrentUserId(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:"32px",height:"32px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-chevron-left" aria-hidden="true" />
            </button>
            <div>
              <p style={{margin:0,fontSize:"11px",opacity:0.8}}>สวัสดี · 태국어 배우기</p>
              <h1 style={{margin:"2px 0 0",fontSize:"17px",fontWeight:500}}>{curUser?.name} · {lesson?.label}</h1>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            {GS_URL && (
              <p style={{margin:"0 0 2px",fontSize:"10px",opacity:0.75,display:"flex",alignItems:"center",gap:"4px",justifyContent:"flex-end"}}>
                {syncing
                  ? <><div style={{width:"8px",height:"8px",border:"1.5px solid rgba(255,255,255,0.5)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} /> 저장 중</>
                  : <><span style={{fontSize:"8px"}}>●</span> 동기화됨</>}
              </p>
            )}
            <p style={{margin:0,fontSize:"11px",opacity:0.8}}>체크 완료</p>
            <p style={{margin:0,fontSize:"20px",fontWeight:500}}>{doneCount}<span style={{fontSize:"13px",opacity:0.7}}>/{totalChecks}</span></p>
          </div>
        </div>
        <div style={{display:"flex",gap:"5px",marginBottom:"10px",flexWrap:"wrap"}}>
          {sortedLessonKeys.map(k => (
            <button key={k} onClick={() => setLessonKey(k)}
              style={{background:k===lessonKey?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.2)",color:k===lessonKey?uColor:"rgba(255,255,255,0.9)",border:"none",borderRadius:"12px",padding:"4px 12px",fontSize:"12px",cursor:"pointer",fontWeight:k===lessonKey?500:400}}>
              {lessons[k].label}
            </button>
          ))}
        </div>
        <div style={{background:"rgba(255,255,255,0.3)",height:"3px",borderRadius:"2px"}}>
          <div style={{background:"#fff",height:"3px",borderRadius:"2px",width:`${totalChecks > 0 ? (doneCount/totalChecks)*100 : 0}%`,transition:"width 0.5s"}} />
        </div>
        <div style={{display:"flex",marginTop:"12px",gap:"2px",overflowX:"auto"}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{background:tab===t.id?"rgba(255,255,255,0.95)":"transparent",color:tab===t.id?uColor:"rgba(255,255,255,0.85)",border:"none",padding:"8px 11px",fontSize:"11px",cursor:"pointer",borderRadius:"8px 8px 0 0",display:"flex",alignItems:"center",gap:"4px",fontWeight:tab===t.id?500:400,whiteSpace:"nowrap",flexShrink:0}}>
              <i className={`ti ${t.icon}`} aria-hidden="true" style={{fontSize:"13px"}} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 16px"}}>

        {/* ════ LEARN ════ */}
        {tab === "learn" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <button onClick={() => { stopSpeak(); setIdx(i => Math.max(0, i-1)); }} disabled={idx === 0}
              style={{background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"8px 14px",cursor:"pointer",fontSize:"13px",color:idx===0?"var(--color-text-tertiary)":"var(--color-text-primary)",display:"flex",alignItems:"center",gap:"4px"}}>
              <i className="ti ti-chevron-left" aria-hidden="true" /> 이전
            </button>
            <div style={{display:"flex",gap:"7px",alignItems:"center"}}>
              {sentences.map((_, i) => (
                <div key={i} onClick={() => { stopSpeak(); setIdx(i); }}
                  style={{width:i===idx?"10px":"7px",height:i===idx?"10px":"7px",borderRadius:"50%",cursor:"pointer",transition:"all 0.2s",background:i===idx?uColor:usedL[sentences[i].id]?"#639922":"var(--color-border-secondary)"}} />
              ))}
            </div>
            <button onClick={() => { stopSpeak(); setIdx(i => Math.min(sentences.length-1, i+1)); }} disabled={idx === sentences.length-1}
              style={{background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"8px 14px",cursor:"pointer",fontSize:"13px",color:idx===sentences.length-1?"var(--color-text-tertiary)":"var(--color-text-primary)",display:"flex",alignItems:"center",gap:"4px"}}>
              다음 <i className="ti ti-chevron-right" aria-hidden="true" />
            </button>
          </div>

          {cur && <>
            <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"24px 20px",marginBottom:"12px"}}>
              {usedL[cur.id] && (
                <div style={{background:"#EAF3DE",color:"#3B6D11",padding:"4px 12px",borderRadius:"20px",width:"fit-content",fontSize:"12px",marginBottom:"18px",display:"flex",alignItems:"center",gap:"6px"}}>
                  <i className="ti ti-check" aria-hidden="true" /> 사용 완료 · {usedL[cur.id].time}
                </div>
              )}
              <Karaoke text={cur.thai} active={-1} size={26} />
              {cur.thaiScript && <p style={{textAlign:"center",fontSize:"18px",color:"#1A936F",margin:"10px 0 0",fontWeight:500,lineHeight:1.6}}>{cur.thaiScript}</p>}
              {showKo && <p style={{textAlign:"center",fontSize:"14px",color:"var(--color-text-secondary)",margin:"10px 0 0",lineHeight:1.7}}>{cur.korean}</p>}
              <div style={{display:"flex",gap:"8px",justifyContent:"center",marginTop:"18px"}}>
                {cur.thaiScript && (
                  <button onClick={() => speak(cur.thaiScript)}
                    style={{background:"#E8F7F2",color:"#1A936F",border:"0.5px solid #1A936F",borderRadius:"var(--border-radius-md)",padding:"10px 20px",fontSize:"14px",cursor:"pointer",display:"flex",alignItems:"center",gap:"7px",fontWeight:500}}>
                    <i className="ti ti-volume" aria-hidden="true" /> 듣기
                  </button>
                )}
                <button onClick={() => setShowKo(v => !v)}
                  style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"10px 14px",fontSize:"16px",cursor:"pointer",color:"var(--color-text-secondary)"}}>
                  <i className={`ti ${showKo?"ti-eye-off":"ti-eye"}`} aria-hidden="true" />
                </button>
              </div>
            </div>
            {cur.vocab?.length > 0 && (
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"16px",marginBottom:"12px"}}>
                <p style={{margin:"0 0 12px",fontSize:"12px",color:"var(--color-text-secondary)",fontWeight:500}}>단어 정리</p>
                <Pills vocab={cur.vocab} onSpeak={speak} />
              </div>
            )}
          </>}

          {lessonJokes.map(j => (
            <div key={j.id} style={{background:"#FAEEDA",border:"0.5px solid #EF9F27",borderRadius:"var(--border-radius-lg)",padding:"16px",marginBottom:"12px"}}>
              <p style={{margin:"0 0 12px",fontSize:"12px",color:"#854F0B",fontWeight:500}}>오늘의 농담 · {j.note}</p>
              <div style={{background:"rgba(255,255,255,0.55)",borderRadius:"var(--border-radius-md)",padding:"14px",marginBottom:"8px"}}>
                <Karaoke text={j.thai} active={-1} size={17} />
                {j.thaiScript && <p style={{textAlign:"center",fontSize:"16px",color:"#1A936F",margin:"8px 0 0",fontWeight:500}}>{j.thaiScript}</p>}
              </div>
              <p style={{fontSize:"13px",color:"#633806",textAlign:"center",margin:"0 0 12px"}}>{j.korean}</p>
              <Pills vocab={j.vocab} onSpeak={speak} />
              {j.thaiScript && (
                <div style={{display:"flex",justifyContent:"center",marginTop:"10px"}}>
                  <button onClick={() => speak(j.thaiScript)}
                    style={{background:"none",border:"0.5px solid #1A936F",color:"#1A936F",borderRadius:"var(--border-radius-md)",padding:"7px 16px",fontSize:"13px",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}}>
                    <i className="ti ti-volume" aria-hidden="true" /> 듣기
                  </button>
                </div>
              )}
            </div>
          ))}
        </>}

        {/* ════ PRACTICE ════ */}
        {tab === "practice" && <>
          <p style={{margin:"0 0 18px",fontSize:"13px",color:"var(--color-text-secondary)",lineHeight:1.7}}>실제로 사용한 문장을 체크하고, 상대방 답변을 기록해봐요.</p>
          {sentences.map(s => (
            <CheckCard key={s.id} type="sent" id={s.id} thai={s.thai} thaiScript={s.thaiScript} korean={s.korean}
              isUsed={!!usedL[s.id]} isEntering={entering?.type==="sent" && entering?.id===s.id}
              record={usedL[s.id]} draft={draft} draftMeaning={draftMeaning} uColor={uColor}
              onStartCheck={() => startCheck("sent", s.id)}
              onSaveCheck={() => saveCheck("sent", s.id)}
              onEditCheck={() => editCheck("sent", s.id)}
              onUncheck={() => uncheckItem("sent", s.id)}
              onSpeak={speak} onDraftChange={setDraft} onDraftMeaningChange={setDraftMeaning} />
          ))}
          {lessonJokes.length > 0 && <>
            <div style={{display:"flex",alignItems:"center",gap:"12px",margin:"20px 0 14px"}}>
              <div style={{flex:1,height:"0.5px",background:"var(--color-border-tertiary)"}} />
              <p style={{margin:0,fontSize:"12px",color:"var(--color-text-secondary)",fontWeight:500}}>오늘의 농담</p>
              <div style={{flex:1,height:"0.5px",background:"var(--color-border-tertiary)"}} />
            </div>
            {lessonJokes.map(j => (
              <CheckCard key={j.id} type="joke" id={j.id} thai={j.thai} thaiScript={j.thaiScript} korean={j.korean} jokeNote={j.note}
                isUsed={!!jokeUsedL[j.id]} isEntering={entering?.type==="joke" && entering?.id===j.id}
                record={jokeUsedL[j.id]} draft={draft} draftMeaning={draftMeaning} uColor={uColor}
                onStartCheck={() => startCheck("joke", j.id)}
                onSaveCheck={() => saveCheck("joke", j.id)}
                onEditCheck={() => editCheck("joke", j.id)}
                onUncheck={() => uncheckItem("joke", j.id)}
                onSpeak={speak} onDraftChange={setDraft} onDraftMeaningChange={setDraftMeaning} />
            ))}
          </>}

          {/* ── 메모 ── */}
          <div style={{marginTop:"24px",background:"var(--color-background-primary)",border:`0.5px solid ${memoSaved?"#2D7DD2":"var(--color-border-tertiary)"}`,borderRadius:"var(--border-radius-lg)",padding:"16px",transition:"border-color 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
              <p style={{margin:0,fontSize:"13px",fontWeight:500,display:"flex",alignItems:"center",gap:"6px"}}>
                <i className="ti ti-notes" aria-hidden="true" style={{color:"#2D7DD2"}} /> 메모
              </p>
              {memoSaved && <span style={{fontSize:"12px",color:"#2D7DD2",display:"flex",alignItems:"center",gap:"4px"}}><i className="ti ti-check" aria-hidden="true" /> 저장됨</span>}
            </div>
            <p style={{margin:"0 0 10px",fontSize:"12px",color:"var(--color-text-secondary)",lineHeight:1.6}}>궁금한 단어·표현, 헷갈리는 것을 적어두세요. 선생님이 확인해요.</p>
            <textarea
              value={memoText}
              onChange={e => { setMemoText(e.target.value); setMemoSaved(false); }}
              placeholder={"예: '마이캅'이랑 '마이카' 언제 쓰나요?"}
              style={{width:"100%",padding:"10px 12px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"13px",resize:"vertical",minHeight:"80px",boxSizing:"border-box",outline:"none",lineHeight:1.6,background:"var(--color-background-primary)",color:"var(--color-text-primary)",fontFamily:"inherit"}}
            />
            <button
              onClick={() => {
                updMyData(d => ({...d, notes: {...(d.notes||{}), [lessonKey]: memoText}}));
                setMemoSaved(true);
              }}
              style={{marginTop:"10px",width:"100%",background:"#2D7DD2",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"10px",fontSize:"13px",cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
              <i className="ti ti-device-floppy" aria-hidden="true" /> 선생님께 메모 전달
            </button>
          </div>
        </>}

        {/* ════ DICT ════ */}
        {tab === "dict" && <>
          {/* Search bar */}
          <div style={{position:"relative",marginBottom:"14px"}}>
            <i className="ti ti-search" aria-hidden="true" style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"var(--color-text-tertiary)",fontSize:"15px",pointerEvents:"none"}} />
            <input
              value={dictSearch}
              onChange={e => setDictSearch(e.target.value)}
              placeholder="단어 검색 (태국어 또는 한국어)"
              style={{width:"100%",padding:"10px 12px 10px 36px",border:`0.5px solid ${dictSearch?"var(--color-border-secondary)":"var(--color-border-tertiary)"}`,borderRadius:"var(--border-radius-md)",fontSize:"14px",boxSizing:"border-box",outline:"none",background:"var(--color-background-primary)"}}
            />
            {dictSearch && (
              <button onClick={() => setDictSearch("")} style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:"16px",lineHeight:1,padding:"2px"}}>×</button>
            )}
          </div>

          {/* Category tabs — hidden when searching */}
          {!dictSearch && (
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"16px"}}>
              {["전체", ...Object.keys(dictCats)].map(cat => (
                <button key={cat} onClick={() => setDictCat(cat)}
                  style={{background:dictCat===cat?uColor:"var(--color-background-secondary)",color:dictCat===cat?"#fff":"var(--color-text-secondary)",border:`0.5px solid ${dictCat===cat?uColor:"var(--color-border-tertiary)"}`,borderRadius:"20px",padding:"6px 14px",fontSize:"12px",cursor:"pointer",fontWeight:dictCat===cat?500:400}}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          {allDictVocab.length === 0
            ? <p style={{textAlign:"center",color:"var(--color-text-tertiary)",padding:"40px 0",fontSize:"14px"}}>
                {dictSearch ? `"${dictSearch}" 검색 결과가 없어요` : "단어가 없어요. 선생님이 수업을 추가하면 여기에 나타나요."}
              </p>
            : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                {allDictVocab.map((v, i) => {
                  const masteryCount = (myRaw.masteredWords || {})[v.thai] || 0;
                  const isMastered = masteryCount >= MASTERY_THRESHOLD;
                  return (
                    <div key={i}
                      style={{background:"var(--color-background-primary)",border:`0.5px solid ${isMastered?"#639922":"var(--color-border-tertiary)"}`,borderRadius:"var(--border-radius-md)",padding:"12px 14px",display:"flex",flexDirection:"column",gap:"4px",transition:"border-color 0.15s"}}
                      onMouseEnter={e => e.currentTarget.style.borderColor = isMastered ? "#639922" : uColor}
                      onMouseLeave={e => e.currentTarget.style.borderColor = isMastered ? "#639922" : "var(--color-border-tertiary)"}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <span style={{fontSize:"18px",fontWeight:500,color:isMastered?"#3B9E52":uColor}}>{v.thai}</span>
                        {isMastered && <span style={{fontSize:"10px",background:"#EAF3DE",color:"#3B6D11",padding:"2px 7px",borderRadius:"10px",whiteSpace:"nowrap",flexShrink:0,fontWeight:500}}>암기 완료</span>}
                      </div>
                      {v.thaiScript && <span style={{fontSize:"15px",fontWeight:500,color:"#1A936F"}}>{v.thaiScript}</span>}
                      <span style={{fontSize:"13px",color:"var(--color-text-secondary)"}}>{v.korean}</span>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"2px"}}>
                        {v.thaiScript
                          ? <button onClick={() => speak(v.thaiScript)} style={{background:"#E8F7F2",color:"#1A936F",border:"0.5px solid #1A936F",borderRadius:"var(--border-radius-md)",padding:"4px 10px",fontSize:"11px",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",fontWeight:500}}>
                              <i className="ti ti-volume" aria-hidden="true" /> 듣기
                            </button>
                          : <span style={{fontSize:"11px",color:"var(--color-text-tertiary)"}}> </span>
                        }
                        {masteryCount > 0 && !isMastered && <span style={{color:"#639922",fontSize:"11px",fontWeight:500}}>{masteryCount}/5</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
          }
          <p style={{textAlign:"center",fontSize:"12px",color:"var(--color-text-tertiary)",marginTop:"16px"}}>총 {allDictVocab.length}개</p>
        </>}

        {/* ════ GAME ════ */}
        {tab === "game" && (
          !game ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <p style={{fontSize:"52px",margin:"0 0 16px"}}>🎮</p>
              <h2 style={{fontSize:"20px",fontWeight:500,margin:"0 0 8px"}}>단어 맞추기</h2>
              <p style={{color:"var(--color-text-secondary)",fontSize:"14px",margin:"0 0 6px"}}>이번 수업 단어들로 게임해봐요!</p>
              <p style={{color:"var(--color-text-tertiary)",fontSize:"12px",margin:"0 0 24px"}}>
                {(() => {
                  const mw = myRaw.masteredWords || {};
                  const all = getAllVocab();
                  const unmastered = all.filter(v => (mw[v.thai]||0) < MASTERY_THRESHOLD).length;
                  const mastered = all.length - unmastered;
                  return mastered > 0
                    ? `전체 ${all.length}개 · 암기 완료 ${mastered}개 · 학습 중 ${unmastered}개`
                    : `전체 ${all.length}개 준비됨 (모든 수업 통합)`;
                })()}
              </p>
              {myRaw.gameHistory?.length > 0 && (
                <p style={{color:"var(--color-text-secondary)",fontSize:"13px",margin:"0 0 20px"}}>
                  최근 성적: {myRaw.gameHistory[myRaw.gameHistory.length-1].score}/{myRaw.gameHistory[myRaw.gameHistory.length-1].total}점
                </p>
              )}
              <button onClick={startGame} style={{background:uColor,color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"12px 36px",fontSize:"16px",cursor:"pointer",fontWeight:500}}>시작하기</button>
            </div>
          ) : game.done ? (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <p style={{fontSize:"56px",margin:"0 0 16px"}}>{game.score>=game.q.length*0.8?"🏆":game.score>=game.q.length*0.5?"👍":"💪"}</p>
              <h2 style={{fontSize:"26px",fontWeight:500,margin:"0 0 8px"}}>{game.score}/{game.q.length} 정답!</h2>
              <p style={{color:"var(--color-text-secondary)",fontSize:"14px",margin:"0 0 24px"}}>{game.score>=game.q.length*0.8?"완벽해요!":game.score>=game.q.length*0.5?"좋아요, 조금 더!":"다시 도전!"}</p>
              {game.q.filter(q => q.ans && q.ans !== q.korean).length > 0 && (
                <div style={{textAlign:"left",marginBottom:"24px"}}>
                  <p style={{fontSize:"13px",fontWeight:500,margin:"0 0 10px",color:"var(--color-text-secondary)"}}>틀린 단어</p>
                  {game.q.filter(q => q.ans && q.ans !== q.korean).map((q, i) => (
                    <div key={i} style={{background:"#FCEBEB",border:"0.5px solid #E24B4A",borderRadius:"var(--border-radius-md)",padding:"10px 14px",marginBottom:"6px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <p style={{margin:0,fontSize:"16px",fontWeight:500,color:"#E24B4A"}}>{q.thai}</p>
                          {q.thaiScript && <p style={{margin:"2px 0 0",fontSize:"14px",fontWeight:500,color:"#1A936F"}}>{q.thaiScript}</p>}
                          <p style={{margin:"4px 0 0",fontSize:"12px",color:"#501313"}}>내가 선택: <b>{q.ans}</b> → 정답: <b style={{color:"#1E4D08"}}>{q.korean}</b></p>
                        </div>
                        {q.thaiScript && (
                          <button onClick={() => speak(q.thaiScript)}
                            style={{background:"#E8F7F2",color:"#1A936F",border:"0.5px solid #1A936F",borderRadius:"var(--border-radius-md)",padding:"5px 10px",fontSize:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",flexShrink:0,marginLeft:"8px"}}>
                            <i className="ti ti-volume" aria-hidden="true" /> 듣기
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setGame(null)} style={{background:uColor,color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"12px 28px",fontSize:"15px",cursor:"pointer"}}>다시하기</button>
            </div>
          ) : game.cur < game.q.length ? (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
                <span style={{fontSize:"13px",color:"var(--color-text-secondary)"}}>{game.cur+1}/{game.q.length}</span>
                <span style={{background:"#EAF3DE",color:"#27500A",padding:"5px 16px",borderRadius:"20px",fontSize:"13px",fontWeight:500}}>점수: {game.score}</span>
              </div>
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"32px 20px",textAlign:"center",marginBottom:"20px"}}>
                <p style={{fontSize:"11px",color:"var(--color-text-tertiary)",margin:"0 0 10px"}}>이 단어의 뜻은?</p>
                <p style={{fontSize:"36px",fontWeight:600,color:uColor,margin:0,lineHeight:1.3}}>{game.q[game.cur].thai}</p>
                {game.q[game.cur].thaiScript && (
                  <p style={{fontSize:"22px",fontWeight:500,color:"#1A936F",margin:"8px 0 0"}}>{game.q[game.cur].thaiScript}</p>
                )}
                {game.q[game.cur].thaiScript && (
                  <button onClick={() => speak(game.q[game.cur].thaiScript)}
                    style={{marginTop:"14px",background:"#E8F7F2",color:"#1A936F",border:"0.5px solid #1A936F",borderRadius:"var(--border-radius-md)",padding:"7px 18px",fontSize:"13px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"6px",fontWeight:500}}>
                    <i className="ti ti-volume" aria-hidden="true" /> 듣기
                  </button>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                {game.q[game.cur].opts.map((opt, i) => {
                  const q = game.q[game.cur];
                  const answered = q.ans !== null;
                  const isChosen = q.ans === opt.korean;
                  const isCorrect = opt.korean === q.korean;
                  let bg = "var(--color-background-primary)", border = "0.5px solid var(--color-border-tertiary)", color = "var(--color-text-primary)";
                  if (answered && isCorrect) { bg="#EAF3DE"; border="0.5px solid #639922"; color="#1E4D08"; }
                  else if (answered && isChosen) { bg="#FCEBEB"; border="0.5px solid #E24B4A"; color="#501313"; }
                  return (
                    <button key={i} onClick={() => !answered && pickAns(opt)} disabled={answered}
                      style={{background:bg,border,borderRadius:"var(--border-radius-md)",padding:"20px 12px",fontSize:"16px",cursor:answered?"default":"pointer",color,transition:"all 0.15s",fontWeight:answered&&isCorrect?500:400}}>
                      {opt.korean}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null
        )}

        {/* ════ TEACHER ════ */}
        {tab === "teacher" && (
          !teacher ? (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <i className="ti ti-lock" aria-hidden="true" style={{fontSize:"40px",color:"var(--color-text-tertiary)",display:"block",marginBottom:"16px"}} />
              <h2 style={{fontSize:"18px",fontWeight:500,margin:"0 0 8px"}}>선생님 전용</h2>
              <br />
              <input type="password" value={pin} onChange={e => { setPin(e.target.value); setPinErr(false); }} maxLength={4} placeholder="••••"
                onKeyDown={e => { if (e.key === "Enter") { if (pin === PIN) { setTeacher(true); } else { setPinErr(true); setPin(""); } } }}
                style={{width:"110px",textAlign:"center",padding:"12px",fontSize:"22px",letterSpacing:"0.4em",border:`0.5px solid ${pinErr?"#E24B4A":"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-md)",display:"block",margin:"0 auto 8px",outline:"none"}} />
              {pinErr && <p style={{fontSize:"12px",color:"#E24B4A",margin:"0 0 8px"}}>PIN이 틀렸어요</p>}
              <button onClick={() => { if (pin === PIN) { setTeacher(true); } else { setPinErr(true); setPin(""); } }}
                style={{background:"#D85A30",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"10px 26px",fontSize:"14px",cursor:"pointer",marginTop:"4px"}}>
                확인
              </button>
            </div>
          ) : (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
                <h2 style={{margin:0,fontSize:"16px",fontWeight:500}}>선생님 대시보드</h2>
                <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                  <button onClick={exportCSV}
                    style={{background:"#3B9E52",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"6px 12px",fontSize:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
                    <i className="ti ti-file-spreadsheet" aria-hidden="true" /> 엑셀 다운로드
                  </button>
                  <button onClick={() => { setTeacher(false); setPin(""); setShowLessonForm(false); }}
                    style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-secondary)",fontSize:"12px",display:"flex",alignItems:"center",gap:"4px"}}>
                    <i className="ti ti-lock" aria-hidden="true" /> 잠금
                  </button>
                </div>
              </div>

              {/* 유저 탭 */}
              <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
                <button onClick={() => setTViewUid("all")}
                  style={{background:tViewUid==="all"?"#333":"var(--color-background-secondary)",color:tViewUid==="all"?"#fff":"var(--color-text-secondary)",border:"none",borderRadius:"20px",padding:"6px 14px",fontSize:"12px",cursor:"pointer",fontWeight:tViewUid==="all"?500:400}}>
                  전체 요약
                </button>
                {users.map(u => (
                  <button key={u.id} onClick={() => setTViewUid(u.id)}
                    style={{background:tViewUid===u.id?PALETTE[u.ci%PALETTE.length]:"var(--color-background-secondary)",color:tViewUid===u.id?"#fff":"var(--color-text-secondary)",border:"none",borderRadius:"20px",padding:"6px 14px",fontSize:"12px",cursor:"pointer",fontWeight:tViewUid===u.id?500:400}}>
                    {u.name}
                  </button>
                ))}
              </div>

              {/* ── 전체 요약 ── */}
              {tViewUid === "all" && <>
                <div style={{display:"grid",gap:"8px",marginBottom:"16px"}}>
                  {users.map(u => {
                    const ud = allData[u.id] || {used:{},jokeUsed:{},gameHistory:[]};
                    const ul = ud.used?.[lessonKey] || {};
                    const jl = ud.jokeUsed?.[lessonKey] || {};
                    const dc = Object.keys(ul).length + Object.keys(jl).length;
                    const lastG = ud.gameHistory?.[ud.gameHistory.length-1];
                    const uC = PALETTE[u.ci%PALETTE.length];
                    return (
                      <div key={u.id} style={{background:"var(--color-background-primary)",border:`0.5px solid ${uC}`,borderRadius:"var(--border-radius-md)",padding:"14px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:uC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"13px",fontWeight:600}}>{u.name[0]}</div>
                            <span style={{fontWeight:500}}>{u.name}</span>
                          </div>
                          <span style={{fontSize:"13px",color:"var(--color-text-secondary)"}}>{dc}/{totalChecks} 체크</span>
                        </div>
                        <div style={{background:"rgba(0,0,0,0.06)",height:"4px",borderRadius:"2px"}}>
                          <div style={{background:uC,height:"4px",borderRadius:"2px",width:`${totalChecks>0?(dc/totalChecks)*100:0}%`,transition:"width 0.4s"}} />
                        </div>
                        {lastG && <p style={{margin:"8px 0 0",fontSize:"12px",color:"var(--color-text-secondary)"}}>최근 게임: {lastG.score}/{lastG.total}점 · 틀린 단어 {lastG.wrong.length}개</p>}
                        {Object.entries(ud.notes||{}).filter(([,v])=>v?.trim()).length > 0 && (
                          <div style={{marginTop:"8px"}}>
                            {Object.entries(ud.notes).filter(([,v])=>v?.trim()).map(([lk, note]) => (
                              <div key={lk} style={{padding:"8px 10px",background:"#EEF4FF",borderRadius:"var(--border-radius-md)",borderLeft:"3px solid #2D7DD2",marginBottom:"6px"}}>
                                <p style={{margin:"0 0 3px",fontSize:"11px",color:"#2D7DD2",fontWeight:500}}>📝 {lessons[lk]?.label || lk}</p>
                                <p style={{margin:0,fontSize:"12px",color:"var(--color-text-primary)",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{note}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>


                {/* 사용자 관리 */}
                <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"16px",marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                    <p style={{margin:0,fontSize:"13px",fontWeight:500}}>사용자 관리</p>
                    <button onClick={() => setAddingUser(v => !v)} style={{background:"none",border:"none",cursor:"pointer",color:"#D85A30",fontSize:"12px"}}>+ 추가</button>
                  </div>
                  {addingUser && (
                    <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
                      <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="이름" autoFocus
                        onKeyDown={e => e.key === "Enter" && addUser()}
                        style={{flex:1,padding:"8px 12px",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",fontSize:"13px",outline:"none"}} />
                      <button onClick={addUser} style={{background:"#D85A30",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",padding:"8px 14px",fontSize:"13px",cursor:"pointer"}}>추가</button>
                      <button onClick={() => { setAddingUser(false); setNewUserName(""); }} style={{background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"8px 12px",fontSize:"13px",cursor:"pointer",color:"var(--color-text-secondary)"}}>취소</button>
                    </div>
                  )}
                  {users.map(u => (
                    <div key={u.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                      <div style={{width:"24px",height:"24px",borderRadius:"50%",background:PALETTE[u.ci%PALETTE.length],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"11px",fontWeight:600}}>{u.name[0]}</div>
                      <span style={{flex:1,fontSize:"14px"}}>{u.name}</span>
                      {users.length > 1 && <button onClick={() => setUsers(p => p.filter(x => x.id !== u.id))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:"12px",padding:"2px 6px"}}><i className="ti ti-trash" aria-hidden="true" /></button>}
                    </div>
                  ))}
                </div>

                {/* 새 수업 추가 */}
                {showLessonForm
                  ? <LessonForm existingLessons={lessons} uColor={uColor} onSave={handleLessonSave} onClose={() => setShowLessonForm(false)} />
                  : <button onClick={() => setShowLessonForm(true)}
                      style={{width:"100%",background:"none",border:`0.5px solid ${uColor}`,borderRadius:"var(--border-radius-lg)",padding:"14px",fontSize:"14px",cursor:"pointer",color:uColor,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                      <i className="ti ti-plus" aria-hidden="true" /> 새 수업 추가
                    </button>
                }
              </>}

              {/* ── 개별 유저 ── */}
              {tViewUid !== "all" && (() => {
                const u = users.find(x => x.id === tViewUid);
                if (!u) return null;
                const ud = allData[u.id] || {used:{},jokeUsed:{},gameHistory:[]};
                const ul = ud.used?.[lessonKey] || {};
                const jl = ud.jokeUsed?.[lessonKey] || {};
                const uC = PALETTE[u.ci%PALETTE.length];
                return (
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"50%",background:uC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"16px",fontWeight:600}}>{u.name[0]}</div>
                      <div>
                        <p style={{margin:0,fontSize:"16px",fontWeight:500}}>{u.name}</p>
                        <p style={{margin:0,fontSize:"12px",color:"var(--color-text-secondary)"}}>{Object.keys(ul).length+Object.keys(jl).length}/{totalChecks} 체크 완료</p>
                      </div>
                    </div>

                    <p style={{margin:"0 0 10px",fontSize:"13px",fontWeight:500,color:"var(--color-text-secondary)"}}>문장 사용 현황</p>
                    {sentences.map(s => (
                      <div key={s.id} style={{background:"var(--color-background-primary)",border:`0.5px solid ${ul[s.id]?"#97C459":"var(--color-border-tertiary)"}`,borderRadius:"var(--border-radius-md)",padding:"12px",marginBottom:"8px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1}}>
                            <p style={{margin:0,fontSize:"13px",color:uC,fontWeight:500}}>{s.thai}</p>
                            <p style={{margin:"2px 0 0",fontSize:"11px",color:"var(--color-text-secondary)"}}>{s.korean}</p>
                          </div>
                          {ul[s.id]
                            ? <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"11px",padding:"2px 10px",borderRadius:"12px",marginLeft:"10px",flexShrink:0}}>✓ {ul[s.id].time}</span>
                            : <span style={{background:"var(--color-background-secondary)",color:"var(--color-text-tertiary)",fontSize:"11px",padding:"2px 10px",borderRadius:"12px",marginLeft:"10px",flexShrink:0}}>미사용</span>}
                        </div>
                        {ul[s.id]?.answer && (
                          <div style={{margin:"8px 0 0"}}>
                            <p style={{margin:0,fontSize:"13px",color:"#633806",padding:"8px 12px",background:"#FAEEDA",borderRadius:"var(--border-radius-md)"}}>{ul[s.id].answer}</p>
                            {ul[s.id].answerMeaning && <p style={{margin:"4px 0 0",fontSize:"12px",color:"var(--color-text-secondary)",paddingLeft:"4px"}}>뜻: {ul[s.id].answerMeaning}</p>}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 날짜별 메모 */}
                    <p style={{margin:"16px 0 10px",fontSize:"13px",fontWeight:500,color:"var(--color-text-secondary)"}}>날짜별 메모</p>
                    {Object.entries(ud.notes||{}).filter(([,v])=>v?.trim()).length === 0
                      ? <p style={{fontSize:"13px",color:"var(--color-text-tertiary)",textAlign:"center",padding:"12px 0 4px"}}>메모가 없어요</p>
                      : sortedLessonKeys.map(lk => {
                          const note = ud.notes?.[lk];
                          if (!note?.trim()) return null;
                          return (
                            <div key={lk} style={{background:"var(--color-background-primary)",border:"0.5px solid #2D7DD2",borderRadius:"var(--border-radius-md)",padding:"12px",marginBottom:"8px"}}>
                              <p style={{margin:"0 0 5px",fontSize:"12px",fontWeight:500,color:"#2D7DD2"}}>{lessons[lk]?.label || lk}</p>
                              <p style={{margin:0,fontSize:"13px",color:"var(--color-text-primary)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{note}</p>
                            </div>
                          );
                        })
                    }

                    <p style={{margin:"16px 0 10px",fontSize:"13px",fontWeight:500,color:"var(--color-text-secondary)"}}>단어 게임 성적</p>
                    {!ud.gameHistory?.length
                      ? <p style={{fontSize:"13px",color:"var(--color-text-tertiary)",textAlign:"center",padding:"20px"}}>아직 게임 기록이 없어요</p>
                      : [...ud.gameHistory].reverse().map(g => (
                          <div key={g.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"12px",marginBottom:"8px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:g.wrong.length>0?"10px":0}}>
                              <span style={{fontSize:"13px"}}>{g.date} · {lessons[g.lessonKey]?.label||g.lessonKey}</span>
                              <span style={{background:g.score/g.total>=0.8?"#EAF3DE":"#FCEBEB",color:g.score/g.total>=0.8?"#27500A":"#501313",fontSize:"13px",fontWeight:500,padding:"3px 12px",borderRadius:"12px"}}>{g.score}/{g.total}점</span>
                            </div>
                            {g.wrong.length > 0
                              ? <div>
                                  <p style={{margin:"0 0 6px",fontSize:"11px",color:"#E24B4A",fontWeight:500}}>틀린 단어 ({g.wrong.length}개)</p>
                                  {g.wrong.map((w, i) => (
                                    <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"5px 10px",background:"#FCEBEB",borderRadius:"6px",marginBottom:"4px",fontSize:"12px"}}>
                                      <span style={{color:"#E24B4A",fontWeight:600,minWidth:"60px"}}>{w.thai}</span>
                                      <span style={{color:"#993C1D"}}>선택: {w.picked}</span>
                                      <span style={{color:"var(--color-text-tertiary)"}}>→</span>
                                      <span style={{color:"#1E4D08",fontWeight:500}}>정답: {w.correct}</span>
                                    </div>
                                  ))}
                                </div>
                              : <p style={{margin:0,fontSize:"12px",color:"#3B9E52"}}>🎉 모두 정답!</p>
                            }
                          </div>
                        ))
                    }
                  </div>
                );
              })()}

              {/* ── 데이터 관리 ── */}
              <div style={{marginTop:"28px",borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:"20px"}}>
                <p style={{margin:"0 0 14px",fontSize:"14px",fontWeight:500}}>📁 데이터 관리</p>

                <p style={{margin:"0 0 10px",fontSize:"12px",color:"var(--color-text-secondary)"}}>수업별 삭제 (수업 내용 + 학습 기록 모두 삭제)</p>
                <div style={{display:"grid",gap:"8px",marginBottom:"20px"}}>
                  {sortedLessonKeys.map(lk => {
                    const totalEntries = users.reduce((acc, u) => {
                      const ud = allData[u.id] || {};
                      return acc + Object.keys(ud.used?.[lk]||{}).length + Object.keys(ud.jokeUsed?.[lk]||{}).length;
                    }, 0);
                    const isPending = confirmDeleteKey === lk;
                    return (
                      <div key={lk} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background: isPending ? "#FCEBEB" : "var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px 14px",transition:"background 0.2s"}}>
                        <div>
                          <span style={{fontSize:"13px",fontWeight:500}}>{lessons[lk]?.label || lk}</span>
                          {lessons[lk]?.topic && <span style={{fontSize:"11px",color:"var(--color-text-tertiary)",marginLeft:"8px"}}>{lessons[lk].topic}</span>}
                          <span style={{fontSize:"11px",color:"var(--color-text-secondary)",marginLeft:"8px"}}>({totalEntries}개 기록)</span>
                        </div>
                        <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                          {isPending ? (
                            <>
                              <button onClick={() => setConfirmDeleteKey(null)}
                                style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",padding:"4px 10px",fontSize:"11px",cursor:"pointer",color:"var(--color-text-secondary)"}}>
                                취소
                              </button>
                              <button onClick={() => deleteLesson(lk)}
                                style={{background:"#E24B4A",border:"none",borderRadius:"var(--border-radius-md)",padding:"4px 10px",fontSize:"11px",cursor:"pointer",color:"#fff",fontWeight:600}}>
                                정말 삭제
                              </button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDeleteKey(lk)}
                              style={{background:"none",border:"0.5px solid #E24B4A",borderRadius:"var(--border-radius-md)",padding:"4px 10px",fontSize:"11px",cursor:"pointer",color:"#E24B4A"}}>
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {confirmResetAll ? (
                  <div style={{display:"flex",gap:"8px"}}>
                    <button onClick={() => setConfirmResetAll(false)}
                      style={{flex:1,background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px",fontSize:"13px",cursor:"pointer",color:"var(--color-text-secondary)"}}>
                      취소
                    </button>
                    <button onClick={resetAll}
                      style={{flex:1,background:"#E24B4A",border:"none",borderRadius:"var(--border-radius-md)",padding:"10px",fontSize:"13px",cursor:"pointer",color:"#fff",fontWeight:600}}>
                      정말 초기화
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmResetAll(true)}
                    style={{width:"100%",background:"#FCEBEB",border:"0.5px solid #E24B4A",borderRadius:"var(--border-radius-md)",padding:"10px",fontSize:"13px",cursor:"pointer",color:"#C0392B",fontWeight:500}}>
                    ⚠️ 전체 데이터 초기화
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
