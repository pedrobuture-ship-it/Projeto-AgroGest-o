import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const C = {
  bg: "#0c1410", card: "#111d16", card2: "#152019",
  border: "#1e3028", green: "#3ddc84", lime: "#a8e063",
  amber: "#f5a623", red: "#e05555", blue: "#4fc3f7",
  purple: "#b39ddb", text: "#dff0e8", muted: "#6b9980",
};
const FONT = "'Sora', sans-serif";

const statusColor = (s) =>
  ({ saudavel: C.lime, "saudável": C.lime, prenha: C.amber, tratamento: C.red, morto: C.red, vendido: C.muted }[s] || C.muted);

const hoje = () => new Date().toISOString().slice(0, 10);
const diasEntre = (d1, d2) => {
  const a = new Date(d1), b = new Date(d2);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};
const addDias = (data, dias) => {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
};
const formatData = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v || "");

function Badge({ label, color }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required, disabled = false }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>
          {label}{required && " *"}
        </label>
      )}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{
          width: "100%", background: C.bg, border: `1px solid ${C.border}`,
          borderRadius: 7, padding: "9px 12px", color: C.text,
          fontFamily: FONT, fontSize: 13, boxSizing: "border-box", opacity: disabled ? 0.7 : 1,
        }}
      />
    </div>
  );
}

function Sel({ label, value, onChange, options, disabled = false }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>
          {label}
        </label>
      )}
      <select
        value={value} onChange={onChange} disabled={disabled}
        style={{
          width: "100%", background: C.bg, border: `1px solid ${C.border}`,
          borderRadius: 7, padding: "9px 12px", color: C.text,
          fontFamily: FONT, fontSize: 13, opacity: disabled ? 0.7 : 1,
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>
          {label}
        </label>
      )}
      <textarea
        value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: "100%", minHeight: 80, resize: "vertical", background: C.bg,
          border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 12px",
          color: C.text, fontFamily: FONT, fontSize: 13, boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Modal({ title, onClose, onSave, children, saving }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000b",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 28, width: 480, maxHeight: "90vh", overflowY: "auto",
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>{title}</h2>
        {children}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 8, padding: 10, color: C.muted, cursor: "pointer",
            fontFamily: FONT, fontSize: 13,
          }}>Cancelar</button>
          <button onClick={onSave} disabled={saving} style={{
            flex: 1, background: C.lime, border: "none", borderRadius: 8, padding: 10,
            color: "#0c1410", fontWeight: 700, cursor: saving ? "default" : "pointer",
            fontFamily: FONT, fontSize: 13, opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({ label, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000c",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
    }}>
      <div style={{
        background: C.card, border: `1px solid ${C.red}44`,
        borderRadius: 16, padding: 28, width: 360, textAlign: "center",
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Confirmar exclusão</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
          Tem certeza que deseja excluir <strong style={{ color: C.text }}>{label}</strong>?
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 8, padding: 10, color: C.muted, cursor: "pointer",
            fontFamily: FONT, fontSize: 13,
          }}>Cancelar</button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, background: C.red, border: "none", borderRadius: 8,
            padding: 10, color: "#fff", fontWeight: 700, cursor: "pointer",
            fontFamily: FONT, fontSize: 13, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtns({ onEdit, onDelete, canDelete = true }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={onEdit} style={{
        background: C.lime + "22", border: `1px solid ${C.lime}44`, borderRadius: 6,
        padding: "4px 10px", color: C.lime, cursor: "pointer",
        fontFamily: FONT, fontSize: 11, fontWeight: 600,
      }}>Editar</button>
      {canDelete && (
        <button onClick={onDelete} style={{
          background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 6,
          padding: "4px 10px", color: C.red, cursor: "pointer",
          fontFamily: FONT, fontSize: 11, fontWeight: 600,
        }}>Excluir</button>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 60, color: C.muted, fontSize: 13, gap: 10,
    }}>
      <span style={{
        display: "inline-block", width: 16, height: 16,
        border: `2px solid ${C.green}44`, borderTop: `2px solid ${C.green}`,
        borderRadius: "50%", animation: "spin 0.7s linear infinite",
      }} />
      Carregando...
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{
      padding: "11px 14px", textAlign: "left", color: C.muted,
      fontWeight: 600, fontSize: 10, letterSpacing: 1,
    }}>{children}</th>
  );
}

function Td({ children, bold, color }) {
  return (
    <td style={{ padding: "11px 14px", fontWeight: bold ? 700 : 400, color: color || "inherit" }}>
      {children}
    </td>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modo, setModo] = useState("login");

  const token = new URLSearchParams(window.location.search).get("convite");

  const handleSubmit = async () => {
    if (!email || !senha) return;
    setLoading(true);
    setErro("");

    try {
      let authUser = null;

      if (modo === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        authUser = data.user;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        if (!data.user) {
          setErro("Verifique seu e-mail para confirmar o cadastro.");
          setLoading(false);
          return;
        }
        authUser = data.user;
      }

      if (token && authUser?.id) {
  const { data: convite, error: ec } = await supabase
    .from("convites")
    .select("*")
    .eq("token", token)
    .eq("usado", false)
    .single();

  if (ec || !convite) {
    setErro("Convite inválido ou já utilizado.");
    setLoading(false);
    return;
  }

  if ((convite.email || "").toLowerCase() !== (authUser.email || "").toLowerCase()) {
    setErro(`Este convite foi enviado para ${convite.email}.`);
    setLoading(false);
    return;
  }

  const { error: eu } = await supabase.from("usuarios").upsert({
    id: authUser.id,
    nome: authUser.email,
  });
  if (eu) throw eu;

  const { error: em } = await supabase.from("membros_fazenda").upsert({
    usuario_id: authUser.id,
    fazenda_id: convite.fazenda_id,
    papel: "peao",
  }, { onConflict: "usuario_id,fazenda_id" });
  if (em) throw em;

  const { error: ec2 } = await supabase
    .from("convites")
    .update({ usado: true })
    .eq("id", convite.id);

  if (ec2) throw ec2;

  window.sessionStorage.setItem("fazenda_convite_id", convite.fazenda_id);
  window.history.replaceState({}, "", window.location.pathname);
  window.location.reload();
  return;
}
    } catch (e) {
      setErro(e.message || "Erro ao autenticar.");
    }

    setLoading(false);
  };

  return (
    <div style={{
      fontFamily: FONT, background: C.bg, minHeight: "100vh",
      color: C.text, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} input,select,textarea{outline:none}
      `}</style>
      <div style={{
        width: 360, background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 18, padding: 36,
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌾</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>AgroGestão</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {token ? "Você foi convidado. Faça login ou cadastro com o e-mail do convite." : "Gestão Rural Inteligente"}
          </div>
        </div>
        {token && (
          <div style={{ background: C.amber + "22", border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: C.amber, fontWeight: 600 }}>
            🤠 Convite detectado — após entrar, você será adicionado como peão.
          </div>
        )}
        <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
        <Input label="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" />
        {erro && (
          <div style={{
            fontSize: 12, color: erro.includes("Verifique") ? C.lime : C.red,
            marginBottom: 12, padding: "8px 12px", background: C.bg, borderRadius: 6,
          }}>{erro}</div>
        )}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", background: C.lime, border: "none", borderRadius: 9, padding: "12px 0",
          color: "#0c1410", fontWeight: 800, cursor: "pointer",
          fontFamily: FONT, fontSize: 14, opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Aguarde..." : modo === "login" ? "Entrar" : "Cadastrar"}
        </button>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted }}>
          {modo === "login" ? "Não tem conta? " : "Já tem conta? "}
          <span
            onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setErro(""); }}
            style={{ color: C.lime, cursor: "pointer", fontWeight: 600 }}
          >
            {modo === "login" ? "Cadastre-se" : "Entrar"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SetupFazenda({ user, onSetup }) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [area, setArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const conviteToken = new URLSearchParams(window.location.search).get("convite");

  const handleSave = async () => {
    if (conviteToken) {
      setErro("Usuário convidado não pode criar fazenda.");
      return;
    }

    if (!nome) {
      setErro("Nome obrigatório.");
      return;
    }

    setSaving(true);

    const { data: faz, error: e1 } = await supabase
      .from("fazendas")
      .insert({
        nome,
        cidade: cidade || null,
        estado: estado || null,
        area_total: area ? Number(area) : null,
      })
      .select()
      .single();

    if (e1) {
      setErro(e1.message);
      setSaving(false);
      return;
    }

    const { error: e2 } = await supabase
      .from("usuarios")
      .upsert({
        id: user.id,
        nome: user.email,
      });

    if (e2) {
      setErro(e2.message);
      setSaving(false);
      return;
    }

    const { error: e3 } = await supabase
      .from("membros_fazenda")
      .upsert({
        usuario_id: user.id,
        fazenda_id: faz.id,
        papel: "dono",
      }, { onConflict: "usuario_id,fazenda_id" });

    if (e3) {
      setErro(e3.message);
      setSaving(false);
      return;
    }

    onSetup(faz, "dono");
    setSaving(false);
  };

  if (conviteToken) {
    return (
      <div style={{
        fontFamily: FONT,
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 420,
          background: C.card,
          border: `1px solid ${C.red}44`,
          borderRadius: 18,
          padding: 32,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
            Usuário convidado não pode criar fazenda
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
            Saia e entre novamente com o e-mail do convite.
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: C.amber,
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              color: "#0c1410",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: FONT, background: C.bg, minHeight: "100vh",
      color: C.text, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 380, background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 18, padding: 36,
      }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Configure sua Fazenda</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Preencha os dados para começar</div>
        <Input label="Nome da fazenda" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Fazenda São Bento" required />
        <Input label="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: Uberaba" />
        <Input label="Estado" value={estado} onChange={e => setEstado(e.target.value)} placeholder="Ex: MG" />
        <Input label="Área total (hectares)" type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="Ex: 450" />
        {erro && <div style={{ fontSize: 12, color: C.red, marginBottom: 12 }}>{erro}</div>}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            background: C.lime,
            border: "none",
            borderRadius: 9,
            padding: "12px 0",
            color: "#0c1410",
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 14,
          }}
        >
          {saving ? "Salvando..." : "Começar →"}
        </button>
      </div>
    </div>
  );
}

const eA = { brinco: "", nome: "", raca: "", sexo: "M", peso: "", lote_id: "", status: "saudavel", nascimento: "", observacoes: "" };
const eL = { nome: "", area: "", pasto: "", capacidade: "" };
const eV = { tipo: "", data: hoje(), lote_id: "", qtd_animais: "", responsavel: "", observacoes: "" };
const eF = { tipo: "receita", descricao: "", valor: "", data: hoje(), categoria: "" };
const eR = { animal_id: "", tipo: "IA", data_evento: hoje(), resultado: "pendente", touro_id: "", data_parto_previsto: "", data_parto_real: "", peso_bezerro: "", sexo_bezerro: "", observacoes: "" };
const mkPeso = () => ({ animal_id: "", peso: "", data: hoje(), observacoes: "" });

export default function App() {
  const [session, setSession] = useState(null);
  const [fazenda, setFazenda] = useState(null);
  const [papel, setPapel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [erroGeral, setErroGeral] = useState("");

  const [modalConvite, setModalConvite] = useState(false);
  const [conviteEmail, setConviteEmail] = useState("");
  const [conviteLink, setConviteLink] = useState("");
  const [conviteSaving, setConviteSaving] = useState(false);

  const [animais, setAnimais] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [reproducoes, setReproducoes] = useState([]);
  const [pesagens, setPesagens] = useState([]);
  const [membros, setMembros] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [modalAnimal, setModalAnimal] = useState(false);
  const [modalLote, setModalLote] = useState(false);
  const [modalVacina, setModalVacina] = useState(false);
  const [modalFin, setModalFin] = useState(false);
  const [modalReprod, setModalReprod] = useState(false);
  const [modalPeso, setModalPeso] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fA, setFA] = useState({ ...eA });
  const [fL, setFL] = useState({ ...eL });
  const [fV, setFV] = useState({ ...eV });
  const [fF, setFF] = useState({ ...eF });
  const [fR, setFR] = useState({ ...eR });
  const [fPeso, setFPeso] = useState(mkPeso());

 useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  return () => subscription.unsubscribe();
}, []);

const [conviteToken] = useState(
  new URLSearchParams(window.location.search).get("convite")
);
const [aguardandoConvite, setAguardandoConvite] = useState(false);

useEffect(() => {
  if (!session) {
    setLoading(false);
    return;
  }

  (async () => {
    setErroGeral("");
    setAguardandoConvite(!!conviteToken);

    let fazendaDoConvite =
      window.sessionStorage.getItem("fazenda_convite_id") || null;

    if (!fazendaDoConvite && conviteToken) {
      const { data: convite, error: conviteError } = await supabase
        .from("convites")
        .select("fazenda_id")
        .eq("token", conviteToken)
        .maybeSingle();

      if (conviteError) {
        setErroGeral(conviteError.message);
        setLoading(false);
        setAguardandoConvite(false);
        return;
      }

      fazendaDoConvite = convite?.fazenda_id || null;
    }

    let query = supabase
      .from("membros_fazenda")
      .select("fazenda_id, papel, fazendas(*)")
      .eq("usuario_id", session.user.id)
      .order("created_at", { ascending: false });

    if (fazendaDoConvite) {
      query = query.eq("fazenda_id", fazendaDoConvite);
    }

    const { data: membros, error } = await query.limit(10);

    if (error) {
      setErroGeral(error.message);
      setLoading(false);
      setAguardandoConvite(false);
      return;
    }

    const membro = membros?.[0];

    if (membro?.fazenda_id) {
      setFazenda(membro.fazendas || null);
      setPapel(membro.papel);

      if (fazendaDoConvite) {
        window.sessionStorage.removeItem("fazenda_convite_id");
      }

      setAguardandoConvite(false);
      setLoading(false);
      return;
    }

    if (conviteToken || fazendaDoConvite) {
      setErroGeral("Convite não concluído. Entre com o e-mail convidado.");
      setAguardandoConvite(false);
      setLoading(false);
      return;
    }

    setFazenda(null);
    setPapel(null);
    setAguardandoConvite(false);
    setLoading(false);
  })();
}, [session, conviteToken]);

  const loadData = useCallback(async () => {
    if (!fazenda?.id) return;
    setLoadingData(true);
    setErroGeral("");

    const fid = fazenda.id;
    const [a, l, v, f, r, p, m] = await Promise.all([
      supabase.from("animais").select("*, lotes(nome)").eq("fazenda_id", fid).order("created_at", { ascending: false }),
      supabase.from("lotes").select("*").eq("fazenda_id", fid).order("nome"),
      supabase.from("vacinacoes").select("*, lotes(nome)").eq("fazenda_id", fid).order("data", { ascending: false }),
      supabase.from("financeiro").select("*").eq("fazenda_id", fid).order("data", { ascending: false }),
      supabase.from("reproducoes").select("*, animais:animal_id(nome,brinco), touros:touro_id(nome,brinco)").eq("fazenda_id", fid).order("data_evento", { ascending: false }),
      supabase.from("pesagens").select("*, animais(nome,brinco)").eq("fazenda_id", fid).order("data", { ascending: false }),
      supabase.from("membros_fazenda").select("id, usuario_id, papel, created_at, usuarios(nome)").eq("fazenda_id", fid).order("created_at")
    ]);

    const respostas = [a, l, v, f, r, p, m];
    const comErro = respostas.find(x => x.error);
    if (comErro?.error) {
      setErroGeral(comErro.error.message);
    }

    setAnimais(a.data || []);
    setLotes(l.data || []);
    setVacinas(v.data || []);
    setFinanceiro(f.data || []);
    setReproducoes(r.data || []);
    setPesagens(p.data || []);
    setMembros(m.data || []);
    setLoadingData(false);
  }, [fazenda]);

  useEffect(() => { loadData(); }, [loadData]);

  const isDono = papel === "dono";
  const canEditFinanceiro = isDono;
  const canGerirMembros = isDono;

  const receitas = financeiro.filter(f => f.tipo === "receita").reduce((a, b) => a + Number(b.valor || 0), 0);
  const despesas = financeiro.filter(f => f.tipo === "despesa").reduce((a, b) => a + Number(b.valor || 0), 0);
  const femeas = animais.filter(a => a.sexo === "F");
  const machos = animais.filter(a => a.sexo === "M");

  const editAnimal = (a) => { setFA({ brinco: a.brinco, nome: a.nome || "", raca: a.raca || "", sexo: a.sexo || "M", peso: a.peso || "", lote_id: a.lote_id || "", status: a.status || "saudavel", nascimento: a.nascimento || "", observacoes: a.observacoes || "", _id: a.id }); setModalAnimal("editar"); };
  const editLote = (l) => { setFL({ nome: l.nome, area: l.area || "", pasto: l.pasto || "", capacidade: l.capacidade || "", _id: l.id }); setModalLote("editar"); };
  const editVacina = (v) => { setFV({ tipo: v.tipo, data: v.data, lote_id: v.lote_id || "", qtd_animais: v.qtd_animais || "", responsavel: v.responsavel || "", observacoes: v.observacoes || "", _id: v.id }); setModalVacina("editar"); };
  const editFin = (f) => { setFF({ tipo: f.tipo, descricao: f.descricao, valor: f.valor, data: f.data, categoria: f.categoria || "", _id: f.id }); setModalFin("editar"); };
  const editReprod = (r) => { setFR({ animal_id: r.animal_id || "", tipo: r.tipo || "IA", data_evento: r.data_evento || hoje(), resultado: r.resultado || "pendente", touro_id: r.touro_id || "", data_parto_previsto: r.data_parto_previsto || "", data_parto_real: r.data_parto_real || "", peso_bezerro: r.peso_bezerro || "", sexo_bezerro: r.sexo_bezerro || "", observacoes: r.observacoes || "", _id: r.id }); setModalReprod("editar"); };
  const editPeso = (p) => { setFPeso({ animal_id: p.animal_id || "", peso: p.peso || "", data: p.data || hoje(), observacoes: p.observacoes || "", _id: p.id }); setModalPeso(true); };

  async function salvarTabela(tabela, payload, id) {
    const query = supabase.from(tabela);
    return id ? query.update(payload).eq("id", id) : query.insert(payload);
  }

  const saveAnimal = async () => {
    if (!fA.brinco?.trim()) return alert("Brinco é obrigatório.");
    setSaving(true);
    const p = {
      brinco: fA.brinco.trim(),
      nome: fA.nome?.trim() || null,
      raca: fA.raca?.trim() || null,
      sexo: fA.sexo || null,
      peso: fA.peso ? Number(fA.peso) : null,
      lote_id: isUuid(fA.lote_id) ? fA.lote_id : null,
      status: fA.status,
      nascimento: fA.nascimento || null,
      observacoes: fA.observacoes?.trim() || null,
      fazenda_id: fazenda.id,
    };
    const { error } = await salvarTabela("animais", p, fA._id);
    if (error) { alert("Erro ao salvar animal: " + error.message); setSaving(false); return; }
    await loadData(); setModalAnimal(false); setFA({ ...eA }); setSaving(false);
  };

  const saveLote = async () => {
    if (!fL.nome?.trim()) return alert("Nome do lote é obrigatório.");
    setSaving(true);
    const p = { nome: fL.nome.trim(), area: fL.area ? Number(fL.area) : null, pasto: fL.pasto?.trim() || null, capacidade: fL.capacidade ? Number(fL.capacidade) : null, fazenda_id: fazenda.id };
    const { error } = await salvarTabela("lotes", p, fL._id);
    if (error) { alert("Erro ao salvar lote: " + error.message); setSaving(false); return; }
    await loadData(); setModalLote(false); setFL({ ...eL }); setSaving(false);
  };

  const saveVacina = async () => {
    if (!fV.tipo?.trim() || !fV.data) return alert("Vacina e data são obrigatórios.");
    setSaving(true);
    const p = { tipo: fV.tipo.trim(), data: fV.data, lote_id: isUuid(fV.lote_id) ? fV.lote_id : null, qtd_animais: fV.qtd_animais ? Number(fV.qtd_animais) : null, responsavel: fV.responsavel?.trim() || null, observacoes: fV.observacoes?.trim() || null, fazenda_id: fazenda.id };
    const { error } = await salvarTabela("vacinacoes", p, fV._id);
    if (error) { alert("Erro ao salvar vacinação: " + error.message); setSaving(false); return; }
    await loadData(); setModalVacina(false); setFV({ ...eV }); setSaving(false);
  };

  const saveFin = async () => {
    if (!canEditFinanceiro) return;
    if (!fF.descricao?.trim() || !fF.valor || !fF.data) return alert("Descrição, valor e data são obrigatórios.");
    setSaving(true);
    const p = { tipo: fF.tipo, descricao: fF.descricao.trim(), valor: Number(fF.valor), data: fF.data, categoria: fF.categoria?.trim() || null, fazenda_id: fazenda.id };
    const { error } = await salvarTabela("financeiro", p, fF._id);
    if (error) { alert("Erro ao salvar lançamento: " + error.message); setSaving(false); return; }
    await loadData(); setModalFin(false); setFF({ ...eF }); setSaving(false);
  };

  const saveReprod = async () => {
    if (!isUuid(fR.animal_id)) return alert("Selecione a fêmea.");
    if (!fR.data_evento) return alert("Preencha a data do evento.");
    setSaving(true);
    const p = {
      animal_id: fR.animal_id,
      tipo: fR.tipo,
      data_evento: fR.data_evento,
      resultado: fR.resultado,
      touro_id: isUuid(fR.touro_id) ? fR.touro_id : null,
      data_parto_previsto: fR.data_parto_previsto || null,
      data_parto_real: fR.data_parto_real || null,
      peso_bezerro: fR.peso_bezerro ? Number(fR.peso_bezerro) : null,
      sexo_bezerro: fR.sexo_bezerro || null,
      observacoes: fR.observacoes?.trim() || null,
      fazenda_id: fazenda.id,
    };
    const { error } = await salvarTabela("reproducoes", p, fR._id);
    if (error) { alert("Erro ao salvar reprodução: " + error.message); setSaving(false); return; }
    await loadData(); setModalReprod(false); setFR({ ...eR }); setSaving(false);
  };

  const savePeso = async () => {
    if (!isUuid(fPeso.animal_id)) return alert("Selecione um animal.");
    if (!fPeso.peso || Number(fPeso.peso) <= 0) return alert("Informe um peso válido.");
    if (!fPeso.data) return alert("Informe a data.");
    setSaving(true);
    const p = { animal_id: fPeso.animal_id, peso: Number(fPeso.peso), data: fPeso.data, observacoes: fPeso.observacoes?.trim() || null, fazenda_id: fazenda.id };
    const { error } = await salvarTabela("pesagens", p, fPeso._id);
    if (error) { alert("Erro ao salvar pesagem: " + error.message); setSaving(false); return; }
    await loadData(); setModalPeso(false); setFPeso(mkPeso()); setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from(confirmDel.tabela).delete().eq("id", confirmDel.id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      setDeleting(false);
      return;
    }
    await loadData();
    setConfirmDel(null); setDeleting(false);
  };

  const removerMembro = async (membroId) => {
    if (!isDono) return;
    const { error } = await supabase.from("membros_fazenda").delete().eq("id", membroId);
    if (error) return alert("Erro ao remover membro: " + error.message);
    await loadData();
  };

  const gerarNotificacoes = () => {
    const notifs = [];
    const hj = hoje();

    reproducoes.forEach(r => {
      if (r.data_parto_previsto && !r.data_parto_real) {
        const dias = diasEntre(hj, r.data_parto_previsto);
        if (dias >= 0 && dias <= 30) {
          notifs.push({ tipo: "parto", cor: C.amber, icon: "🐄", titulo: `Parto previsto em ${dias} dia(s)`, desc: `${r.animais?.nome || r.animais?.brinco || "Animal"} — ${formatData(r.data_parto_previsto)}`, urgencia: dias <= 7 ? "alta" : "media" });
        } else if (dias < 0) {
          notifs.push({ tipo: "parto", cor: C.red, icon: "⚠️", titulo: "Parto atrasado", desc: `${r.animais?.nome || r.animais?.brinco || "Animal"} — previsto para ${formatData(r.data_parto_previsto)}`, urgencia: "alta" });
        }
      }
    });

    animais.forEach(a => {
      if (a.status === "tratamento" && a.updated_at) {
        const dias = diasEntre(a.updated_at.slice(0, 10), hj);
        if (dias >= 7) {
          notifs.push({ tipo: "saude", cor: C.red, icon: "💉", titulo: `Animal em tratamento há ${dias} dias`, desc: `${a.nome || a.brinco} — Lote: ${a.lotes?.nome || "sem lote"}`, urgencia: "alta" });
        }
      }
    });

    reproducoes.forEach(r => {
      if (r.resultado === "pendente" && r.data_evento) {
        const dias = diasEntre(r.data_evento, hj);
        if (dias >= 30) {
          notifs.push({ tipo: "ia", cor: C.blue, icon: "🔬", titulo: `Evento sem resultado há ${dias} dias`, desc: `${r.animais?.nome || r.animais?.brinco || "Animal"} — ${r.tipo} em ${formatData(r.data_evento)}`, urgencia: "media" });
        }
      }
    });

    animais.forEach(a => {
      const pesagensAnimal = pesagens.filter(p => p.animal_id === a.id).sort((x, y) => String(y.data).localeCompare(String(x.data)));
      if (pesagensAnimal.length > 0) {
        const ultima = pesagensAnimal[0];
        const dias = diasEntre(ultima.data, hj);
        if (dias > 60) {
          notifs.push({ tipo: "peso", cor: C.purple, icon: "⚖️", titulo: `Sem pesagem há ${dias} dias`, desc: `${a.nome || a.brinco}`, urgencia: "baixa" });
        }
      }
    });

    return notifs.sort((a, b) => ({ alta: 0, media: 1, baixa: 2 }[a.urgencia] - ({ alta: 0, media: 1, baixa: 2 }[b.urgencia])));
  };

  const notificacoes = gerarNotificacoes();
  const logout = () => supabase.auth.signOut();

  if (loading) return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ display: "inline-block", width: 20, height: 20, border: `2px solid ${C.green}44`, borderTop: `2px solid ${C.green}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  if (!session) return <Login />;
  if (!fazenda) return <SetupFazenda user={session.user} onSetup={(faz, p) => { setFazenda(faz); setPapel(p); }} />;

  const navItems = [
  ...(isDono ? [{ id: "dashboard", label: "Painel" }] : []),
  { id: "animais", label: "Animais" },
  { id: "lotes", label: "Lotes" },
  { id: "saude", label: "Saúde" },
  { id: "reproducao", label: "Reprodução" },
  { id: "peso", label: "Pesagens" },
  ...(isDono ? [{ id: "financeiro", label: "Financeiro" }] : []),
  ...(isDono ? [{ id: "membros", label: "Membros" }] : []),
  { id: "notificacoes", label: "Alertas" },
];

  const TH = ({ cols }) => (
    <thead>
      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
        {cols.map(c => <Th key={c}>{c}</Th>)}
      </tr>
    </thead>
  );

  const gerarConvite = async () => {
    if (!isDono) return;
    if (!conviteEmail.trim()) return alert("Informe o e-mail do peão.");
    setConviteSaving(true);
    const token = crypto.randomUUID();
    const { error } = await supabase.from("convites").insert({
      fazenda_id: fazenda.id,
      email: conviteEmail.trim().toLowerCase(),
      token,
      usado: false,
    });
    if (error) {
      alert("Erro ao gerar convite: " + error.message);
      setConviteSaving(false);
      return;
    }
    const link = `${window.location.origin}?convite=${token}`;
    setConviteLink(link);
    setConviteSaving(false);
  };

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: "100vh", color: C.text, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box} input,select,textarea{outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
        tr:hover td{background:${C.lime}08}
      `}</style>

      <aside style={{ width: 210, minHeight: "100vh", background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0 }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.lime, letterSpacing: 3, fontWeight: 700, marginBottom: 3 }}>FAZENDA</div>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{fazenda.nome}</div>
          {fazenda.cidade && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{fazenda.cidade} • {fazenda.estado}</div>}
        </div>
        <nav style={{ flex: 1, marginTop: 6, overflowY: "auto" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
              padding: "10px 16px", border: "none", cursor: "pointer", fontFamily: FONT,
              background: tab === n.id ? C.lime + "18" : "transparent",
              color: tab === n.id ? C.lime : C.muted,
              borderLeft: `3px solid ${tab === n.id ? C.lime : "transparent"}`,
              fontSize: 12, fontWeight: tab === n.id ? 700 : 400, textAlign: "left",
            }}>
              <span>{n.label}</span>
              {n.badge > 0 && <span style={{ background: C.red, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.muted }}>Perfil</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: isDono ? C.amber : C.lime }}>{isDono ? "👑 Dono" : "🤠 Funcionario"}</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{session.user.email}</div>
          {isDono && (
            <button onClick={() => { setConviteEmail(""); setConviteLink(""); setModalConvite(true); }} style={{ marginTop: 8, width: "100%", background: C.amber + "22", border: `1px solid ${C.amber}44`, borderRadius: 7, padding: "6px 0", color: C.amber, cursor: "pointer", fontFamily: FONT, fontSize: 10, fontWeight: 600 }}>
              + Convidar Peão
            </button>
          )}
          <button onClick={logout} style={{ marginTop: 6, width: "100%", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 0", color: C.muted, cursor: "pointer", fontFamily: FONT, fontSize: 10 }}>
            Sair →
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "26px 30px", overflowY: "auto", maxHeight: "100vh" }}>
        {erroGeral && <div style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: C.red }}>{erroGeral}</div>}

        {tab === "dashboard" && isDono &&  (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 4 }}>Painel Geral</h1>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 22 }}>Visão completa da {fazenda.nome}</p>
            {loadingData ? <Loader /> : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Animais", value: animais.length, color: C.lime },
                    { label: "Saldo", value: `R$ ${(receitas - despesas).toLocaleString("pt-BR")}`, color: (receitas - despesas) >= 0 ? C.lime : C.red },
                    { label: "Em Tratamento", value: animais.filter(a => a.status === "tratamento").length, color: C.red },
                    { label: "Alertas Urgentes", value: notificacoes.filter(n => n.urgencia === "alta").length, color: notificacoes.filter(n => n.urgencia === "alta").length > 0 ? C.red : C.lime },
                  ].map(k => (
                    <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 14px" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{k.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "animais" && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>Rebanho</h1>
                <p style={{ color: C.muted, fontSize: 12 }}>{animais.length} animais — {femeas.length} fêmeas, {machos.length} machos</p>
              </div>
              <button onClick={() => { setFA({ ...eA }); setModalAnimal("criar"); }} style={{ background: C.lime, color: "#0c1410", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>+ Novo Animal</button>
            </div>
            {loadingData ? <Loader /> : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {animais.length === 0 ? <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum animal cadastrado.</div> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <TH cols={["BRINCO", "NOME", "RAÇA", "SEXO", "PESO", "LOTE", "STATUS", "AÇÕES"]} />
                    <tbody>
                      {animais.map(a => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <Td bold color={C.lime}>{a.brinco}</Td>
                          <Td>{a.nome || "—"}</Td>
                          <Td color={C.muted}>{a.raca || "—"}</Td>
                          <Td>{a.sexo === "M" ? "♂ M" : "♀ F"}</Td>
                          <Td>{a.peso ? `${a.peso} kg` : "—"}</Td>
                          <Td>{a.lotes?.nome ? <Badge label={a.lotes.nome} color={C.amber} /> : "—"}</Td>
                          <Td><Badge label={a.status} color={statusColor(a.status)} /></Td>
                          <Td><ActionBtns onEdit={() => editAnimal(a)} onDelete={() => setConfirmDel({ tabela: "animais", id: a.id, label: a.nome || a.brinco })} canDelete={isDono} /></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "lotes" && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>Lotes e Pastagens</h1>
                <p style={{ color: C.muted, fontSize: 12 }}>{lotes.length} lotes</p>
              </div>
              {isDono && <button onClick={() => { setFL({ ...eL }); setModalLote("criar"); }} style={{ background: C.lime, color: "#0c1410", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>+ Novo Lote</button>}
            </div>
            {loadingData ? <Loader /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                {lotes.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Nenhum lote.</div>}
                {lotes.map(l => {
                  const count = animais.filter(a => a.lote_id === l.id).length;
                  const pct = Math.min(100, Math.round((count / (l.capacidade || 1)) * 100));
                  const cor = pct > 90 ? C.red : pct > 70 ? C.amber : C.lime;
                  return (
                    <div key={l.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{l.nome}</div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <Badge label={pct + "% ocupado"} color={cor} />
                          {isDono && <ActionBtns onEdit={() => editLote(l)} onDelete={() => setConfirmDel({ tabela: "lotes", id: l.id, label: l.nome })} />}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {[
                          { l: "Área", v: l.area ? `${l.area} ha` : "—" },
                          { l: "Forrageira", v: l.pasto || "—" },
                          { l: "Animais", v: count },
                          { l: "Capacidade", v: l.capacidade || "—" },
                        ].map(x => (
                          <div key={x.l}><div style={{ fontSize: 9, color: C.muted }}>{x.l}</div><div style={{ fontWeight: 700, fontSize: 13 }}>{x.v}</div></div>
                        ))}
                      </div>
                      <div style={{ background: C.border, borderRadius: 4, height: 6 }}><div style={{ width: pct + "%", background: cor, height: 6, borderRadius: 4 }} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "saude" && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>Saúde Animal</h1>
                <p style={{ color: C.muted, fontSize: 12 }}>Vacinações e ocorrências sanitárias</p>
              </div>
              <button onClick={() => { setFV({ ...eV }); setModalVacina("criar"); }} style={{ background: C.lime, color: "#0c1410", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>+ Vacinação</button>
            </div>
            {loadingData ? <Loader /> : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {vacinas.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhuma vacinação registrada.</div> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <TH cols={["DATA", "VACINA", "LOTE", "QTD", "RESPONSÁVEL", "AÇÕES"]} />
                    <tbody>
                      {vacinas.map(v => (
                        <tr key={v.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <Td>{formatData(v.data)}</Td>
                          <Td bold>{v.tipo}</Td>
                          <Td>{v.lotes?.nome ? <Badge label={v.lotes.nome} color={C.amber} /> : "—"}</Td>
                          <Td>{v.qtd_animais || "—"}</Td>
                          <Td color={C.muted}>{v.responsavel || "—"}</Td>
                          <Td><ActionBtns onEdit={() => editVacina(v)} onDelete={() => setConfirmDel({ tabela: "vacinacoes", id: v.id, label: v.tipo })} canDelete={isDono} /></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "reproducao" && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>Reprodução</h1>
                <p style={{ color: C.muted, fontSize: 12 }}>IA, monta natural, partos e bezerros</p>
              </div>
              <button onClick={() => { setFR({ ...eR }); setModalReprod("criar"); }} style={{ background: C.lime, color: "#0c1410", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>+ Evento Reprod.</button>
            </div>
            {loadingData ? <Loader /> : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {reproducoes.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum evento registrado.</div> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <TH cols={["DATA", "FÊMEA", "TIPO", "RESULTADO", "PARTO PREV.", "PARTO REAL", "BEZERRO", "AÇÕES"]} />
                    <tbody>
                      {reproducoes.map(r => {
                        const resultCor = { pendente: C.amber, prenha: C.lime, nao_cobriu: C.red, parto_realizado: C.green }[r.resultado] || C.muted;
                        return (
                          <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <Td>{formatData(r.data_evento)}</Td>
                            <Td bold color={C.lime}>{r.animais?.nome || r.animais?.brinco || "—"}</Td>
                            <Td><Badge label={r.tipo} color={r.tipo === "IA" ? C.blue : C.purple} /></Td>
                            <Td><Badge label={r.resultado?.replaceAll("_", " ")} color={resultCor} /></Td>
                            <Td color={C.muted}>{formatData(r.data_parto_previsto)}</Td>
                            <Td color={r.data_parto_real ? C.lime : C.muted}>{formatData(r.data_parto_real)}</Td>
                            <Td>{r.peso_bezerro ? `${r.peso_bezerro}kg ${r.sexo_bezerro === "M" ? "♂" : r.sexo_bezerro === "F" ? "♀" : ""}` : "—"}</Td>
                            <Td><ActionBtns onEdit={() => editReprod(r)} onDelete={() => setConfirmDel({ tabela: "reproducoes", id: r.id, label: r.animais?.nome || "evento" })} canDelete={isDono} /></Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "peso" && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>Pesagens</h1>
                <p style={{ color: C.muted, fontSize: 12 }}>Controle de peso e ganho diário</p>
              </div>
              <button onClick={() => { setFPeso(mkPeso()); setModalPeso(true); }} style={{ background: C.lime, color: "#0c1410", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>+ Pesagem</button>
            </div>
            {loadingData ? <Loader /> : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {pesagens.length === 0 ? <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhuma pesagem registrada.</div> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <TH cols={["DATA", "ANIMAL", "PESO", "OBSERVAÇÕES", "AÇÕES"]} />
                    <tbody>
                      {pesagens.map((p, i) => {
                        const anterior = pesagens.slice(i + 1).find(x => x.animal_id === p.animal_id);
                        let gpd = null;
                        if (anterior) {
                          const dias = diasEntre(anterior.data, p.data);
                          if (dias > 0) gpd = ((p.peso - anterior.peso) / dias).toFixed(2);
                        }
                        return (
                          <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <Td>{formatData(p.data)}</Td>
                            <Td bold color={C.lime}>{p.animais?.nome || p.animais?.brinco || "—"}</Td>
                            <Td bold color={C.green}>{p.peso} kg {gpd !== null && <span style={{ fontSize: 10, color: Number(gpd) >= 0 ? C.lime : C.red, fontWeight: 400 }}>({Number(gpd) >= 0 ? "+" : ""}{gpd} kg/dia)</span>}</Td>
                            <Td color={C.muted}>{p.observacoes || "—"}</Td>
                            <Td><ActionBtns onEdit={() => editPeso(p)} onDelete={() => setConfirmDel({ tabela: "pesagens", id: p.id, label: `pesagem de ${p.animais?.nome || p.animais?.brinco}` })} canDelete={isDono} /></Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "financeiro" && isDono && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>Financeiro</h1>
                <p style={{ color: C.muted, fontSize: 12 }}>Receitas e despesas</p>
              </div>
              <button onClick={() => { setFF({ ...eF }); setModalFin("criar"); }} style={{ background: C.lime, color: "#0c1410", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>+ Lançamento</button>
            </div>
            {loadingData ? <Loader /> : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Receitas", value: receitas, color: C.lime },
                    { label: "Despesas", value: despesas, color: C.red },
                    { label: "Saldo", value: receitas - despesas, color: (receitas - despesas) >= 0 ? C.green : C.red },
                  ].map(k => (
                    <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}>{k.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>R$ {k.value.toLocaleString("pt-BR")}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                  {financeiro.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum lançamento.</div> : financeiro.map(f => (
                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: f.tipo === "receita" ? C.lime + "22" : C.red + "22" }}>{f.tipo === "receita" ? "↑" : "↓"}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{f.descricao}</div>
                          <div style={{ fontSize: 10, color: C.muted }}>{formatData(f.data)}{f.categoria ? ` • ${f.categoria}` : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: f.tipo === "receita" ? C.lime : C.red }}>{f.tipo === "receita" ? "+" : "-"}R$ {Number(f.valor).toLocaleString("pt-BR")}</div>
                        <ActionBtns onEdit={() => editFin(f)} onDelete={() => setConfirmDel({ tabela: "financeiro", id: f.id, label: f.descricao })} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "membros" && isDono && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 3 }}>Membros da Fazenda</h1>
                <p style={{ color: C.muted, fontSize: 12 }}>Gerencie donos e peões</p>
              </div>
              <button onClick={() => { setConviteEmail(""); setConviteLink(""); setModalConvite(true); }} style={{ background: C.amber, color: "#0c1410", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 12 }}>+ Convidar Peão</button>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              {membros.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum membro encontrado.</div> : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <TH cols={["USUÁRIO", "PAPEL", "ENTRADA", "AÇÕES"]} />
                  <tbody>
                    {membros.map(m => (
                      <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <Td bold>{m.usuarios?.nome || m.usuario_id}</Td>
                        <Td><Badge label={m.papel} color={m.papel === "dono" ? C.amber : C.lime} /></Td>
                        <Td>{m.created_at ? new Date(m.created_at).toLocaleDateString("pt-BR") : "—"}</Td>
                        <Td>{m.papel === "dono" ? "—" : <button onClick={() => removerMembro(m.id)} style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 6, padding: "4px 10px", color: C.red, cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600 }}>Remover</button>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "notificacoes" && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 4 }}>Alertas e Notificações</h1>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 22 }}>Gerados automaticamente com base nos dados da fazenda</p>
            {loadingData ? <Loader /> : notificacoes.length === 0 ? (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Tudo em ordem</div>
                <div style={{ color: C.muted, fontSize: 13 }}>Nenhum alerta ativo no momento.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {notificacoes.map((n, i) => (
                  <div key={i} style={{ background: C.card, border: `1px solid ${n.cor}33`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: n.cor + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{n.titulo}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{n.desc}</div>
                    </div>
                    <Badge label={n.urgencia} color={n.urgencia === "alta" ? C.red : n.urgencia === "media" ? C.amber : C.muted} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {modalAnimal && (
        <Modal title={modalAnimal === "editar" ? "Editar Animal" : "Cadastrar Animal"} onClose={() => { setModalAnimal(false); setFA({ ...eA }); }} onSave={saveAnimal} saving={saving}>
          <Input label="Brinco" value={fA.brinco} onChange={e => setFA({ ...fA, brinco: e.target.value })} placeholder="Ex: BR-001" required />
          <Input label="Nome" value={fA.nome} onChange={e => setFA({ ...fA, nome: e.target.value })} placeholder="Ex: Estrela" />
          <Input label="Raça" value={fA.raca} onChange={e => setFA({ ...fA, raca: e.target.value })} placeholder="Ex: Nelore" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Sel label="Sexo" value={fA.sexo} onChange={e => setFA({ ...fA, sexo: e.target.value })} options={[{ value: "M", label: "Macho" }, { value: "F", label: "Fêmea" }]} />
            <Sel label="Status" value={fA.status} onChange={e => setFA({ ...fA, status: e.target.value })} options={[{ value: "saudavel", label: "Saudável" }, { value: "prenha", label: "Prenha" }, { value: "tratamento", label: "Tratamento" }, { value: "vendido", label: "Vendido" }, { value: "morto", label: "Morto" }]} />
          </div>
          <Input label="Peso (kg)" type="number" value={fA.peso} onChange={e => setFA({ ...fA, peso: e.target.value })} placeholder="Ex: 420" />
          <Sel label="Lote" value={fA.lote_id} onChange={e => setFA({ ...fA, lote_id: e.target.value })} options={[{ value: "", label: "Sem lote" }, ...lotes.map(l => ({ value: l.id, label: l.nome }))]} />
          <Input label="Data de nascimento" type="date" value={fA.nascimento} onChange={e => setFA({ ...fA, nascimento: e.target.value })} />
          <Textarea label="Observações" value={fA.observacoes} onChange={e => setFA({ ...fA, observacoes: e.target.value })} placeholder="Observações do animal" />
        </Modal>
      )}

      {modalLote && (
        <Modal title={modalLote === "editar" ? "Editar Lote" : "Cadastrar Lote"} onClose={() => { setModalLote(false); setFL({ ...eL }); }} onSave={saveLote} saving={saving}>
          <Input label="Nome do Lote" value={fL.nome} onChange={e => setFL({ ...fL, nome: e.target.value })} placeholder="Ex: Lote A1" required />
          <Input label="Área (ha)" type="number" value={fL.area} onChange={e => setFL({ ...fL, area: e.target.value })} placeholder="Ex: 45" />
          <Input label="Forrageira" value={fL.pasto} onChange={e => setFL({ ...fL, pasto: e.target.value })} placeholder="Ex: Brachiaria" />
          <Input label="Capacidade" type="number" value={fL.capacidade} onChange={e => setFL({ ...fL, capacidade: e.target.value })} placeholder="Ex: 50" />
        </Modal>
      )}

      {modalVacina && (
        <Modal title={modalVacina === "editar" ? "Editar Vacinação" : "Registrar Vacinação"} onClose={() => { setModalVacina(false); setFV({ ...eV }); }} onSave={saveVacina} saving={saving}>
          <Input label="Vacina" value={fV.tipo} onChange={e => setFV({ ...fV, tipo: e.target.value })} placeholder="Ex: Febre Aftosa" required />
          <Input label="Data" type="date" value={fV.data} onChange={e => setFV({ ...fV, data: e.target.value })} required />
          <Sel label="Lote" value={fV.lote_id} onChange={e => setFV({ ...fV, lote_id: e.target.value })} options={[{ value: "", label: "Todos" }, ...lotes.map(l => ({ value: l.id, label: l.nome }))]} />
          <Input label="Qtd. Animais" type="number" value={fV.qtd_animais} onChange={e => setFV({ ...fV, qtd_animais: e.target.value })} />
          <Input label="Responsável" value={fV.responsavel} onChange={e => setFV({ ...fV, responsavel: e.target.value })} />
          <Textarea label="Observações" value={fV.observacoes} onChange={e => setFV({ ...fV, observacoes: e.target.value })} placeholder="Lote vacinado, fabricante, lote da vacina etc." />
        </Modal>
      )}

      {modalFin && isDono && (
        <Modal title={modalFin === "editar" ? "Editar Lançamento" : "Novo Lançamento"} onClose={() => { setModalFin(false); setFF({ ...eF }); }} onSave={saveFin} saving={saving}>
          <Sel label="Tipo" value={fF.tipo} onChange={e => setFF({ ...fF, tipo: e.target.value })} options={[{ value: "receita", label: "Receita" }, { value: "despesa", label: "Despesa" }]} />
          <Input label="Descrição" value={fF.descricao} onChange={e => setFF({ ...fF, descricao: e.target.value })} placeholder="Ex: Venda de bois" required />
          <Input label="Valor (R$)" type="number" value={fF.valor} onChange={e => setFF({ ...fF, valor: e.target.value })} required />
          <Input label="Data" type="date" value={fF.data} onChange={e => setFF({ ...fF, data: e.target.value })} required />
          <Input label="Categoria" value={fF.categoria} onChange={e => setFF({ ...fF, categoria: e.target.value })} placeholder="Ex: Alimentação" />
        </Modal>
      )}

      {modalReprod && (
        <Modal title={modalReprod === "editar" ? "Editar Evento" : "Novo Evento Reprodutivo"} onClose={() => { setModalReprod(false); setFR({ ...eR }); }} onSave={saveReprod} saving={saving}>
          <Sel label="Fêmea" value={fR.animal_id} onChange={e => setFR({ ...fR, animal_id: e.target.value })} options={[{ value: "", label: "Selecionar..." }, ...femeas.map(a => ({ value: a.id, label: `${a.brinco}${a.nome ? " - " + a.nome : ""}` }))]} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Sel label="Tipo" value={fR.tipo} onChange={e => {
              const tipo = e.target.value;
              const previsto = fR.data_evento ? addDias(fR.data_evento, tipo === "IA" ? 283 : 285) : "";
              setFR({ ...fR, tipo, data_parto_previsto: previsto });
            }} options={[{ value: "IA", label: "Inseminação Artificial" }, { value: "Monta Natural", label: "Monta Natural" }]} />
            <Sel label="Resultado" value={fR.resultado} onChange={e => setFR({ ...fR, resultado: e.target.value })} options={[{ value: "pendente", label: "Pendente" }, { value: "prenhe", label: "Prenha" }, { value: "nao_cobriu", label: "Não cobriu" }, { value: "parto_realizado", label: "Parto realizado" }]} />
          </div>
          {fR.tipo === "Monta Natural" && <Sel label="Touro" value={fR.touro_id} onChange={e => setFR({ ...fR, touro_id: e.target.value })} options={[{ value: "", label: "Selecionar touro..." }, ...machos.map(a => ({ value: a.id, label: `${a.brinco}${a.nome ? " - " + a.nome : ""}` }))]} />}
          <Input label="Data do Evento" type="date" value={fR.data_evento} onChange={e => {
            const data = e.target.value;
            const previsto = data ? addDias(data, fR.tipo === "IA" ? 283 : 285) : "";
            setFR({ ...fR, data_evento: data, data_parto_previsto: previsto });
          }} required />
          <Input label="Parto Previsto" type="date" value={fR.data_parto_previsto} onChange={e => setFR({ ...fR, data_parto_previsto: e.target.value })} />
          <Input label="Data Parto Real" type="date" value={fR.data_parto_real} onChange={e => setFR({ ...fR, data_parto_real: e.target.value })} />
          {fR.data_parto_real && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Peso do Bezerro (kg)" type="number" value={fR.peso_bezerro} onChange={e => setFR({ ...fR, peso_bezerro: e.target.value })} placeholder="Ex: 35" />
              <Sel label="Sexo do Bezerro" value={fR.sexo_bezerro} onChange={e => setFR({ ...fR, sexo_bezerro: e.target.value })} options={[{ value: "", label: "—" }, { value: "M", label: "Macho" }, { value: "F", label: "Fêmea" }]} />
            </div>
          )}
          <Textarea label="Observações" value={fR.observacoes} onChange={e => setFR({ ...fR, observacoes: e.target.value })} placeholder="Ex: IATF protocolo X" />
        </Modal>
      )}

      {modalPeso && (
        <Modal title={fPeso._id ? "Editar Pesagem" : "Registrar Pesagem"} onClose={() => { setModalPeso(false); setFPeso(mkPeso()); }} onSave={savePeso} saving={saving}>
          <Sel label="Animal" value={fPeso.animal_id} onChange={e => setFPeso({ ...fPeso, animal_id: e.target.value })} options={[{ value: "", label: "Selecionar..." }, ...animais.map(a => ({ value: a.id, label: `${a.brinco}${a.nome ? " - " + a.nome : ""}` }))]} />
          <Input label="Peso (kg)" type="number" value={fPeso.peso} onChange={e => setFPeso({ ...fPeso, peso: e.target.value })} placeholder="Ex: 420" required />
          <Input label="Data" type="date" value={fPeso.data} onChange={e => setFPeso({ ...fPeso, data: e.target.value })} required />
          <Textarea label="Observações" value={fPeso.observacoes} onChange={e => setFPeso({ ...fPeso, observacoes: e.target.value })} placeholder="Ex: pós-desmame" />
        </Modal>
      )}

      {modalConvite && isDono && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 440 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Convidar Peão</h2>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Gere um link de convite para o peão entrar na fazenda <strong style={{ color: C.text }}>{fazenda.nome}</strong>.</p>
            <Input label="E-mail do peão" type="email" value={conviteEmail} onChange={e => setConviteEmail(e.target.value)} placeholder="peao@email.com" />
            {conviteLink && (
              <div style={{ background: C.bg, border: `1px solid ${C.lime}44`, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: C.lime, fontWeight: 700, marginBottom: 6 }}>✅ Link gerado — copie e envie ao peão:</div>
                <div style={{ fontSize: 11, color: C.text, wordBreak: "break-all", marginBottom: 8 }}>{conviteLink}</div>
                <button onClick={() => { navigator.clipboard.writeText(conviteLink); alert("Link copiado!"); }} style={{ background: C.lime, border: "none", borderRadius: 6, padding: "6px 14px", color: "#0c1410", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 11 }}>Copiar Link</button>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setModalConvite(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, color: C.muted, cursor: "pointer", fontFamily: FONT, fontSize: 13 }}>Fechar</button>
              <button onClick={gerarConvite} disabled={conviteSaving} style={{ flex: 1, background: C.amber, border: "none", borderRadius: 8, padding: 10, color: "#0c1410", fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 13, opacity: conviteSaving ? 0.7 : 1 }}>{conviteSaving ? "Gerando..." : "Gerar Link"}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && <ConfirmDelete label={confirmDel.label} onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={deleting} />}
    </div>
  );
}
