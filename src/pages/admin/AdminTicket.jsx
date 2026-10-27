import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api.js";
import { useLive } from "../../hooks.js";
import { Badge, ErrorNote, Spinner, ftime } from "../../ui.jsx";
import { Thread } from "../Tickets.jsx";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const CATEGORIES = ["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const sourceLabel = { ai: "AI suggested", fallback: "Auto (AI offline)", admin: "Set by team", pending: "Classifying…" };

export default function AdminTicket() {
  const { id } = useParams();
  const [state, setState] = useState({
    t: null, error: "", reply: "", after: "In Progress", draft: null,
    drafting: false, fromDraft: false, instruction: "", note: "", sending: false,
  });
  const autoFor = useRef(null);
  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      updateState({ t: res.ticket, error: "" });
    } catch (e) {
      updateState({ error: e.message });
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useLive((type, p) => {
    if (type === "poll" || p.ticketId === id) load();
  });

  const getDraft = async (opts = {}) => {
    updateState({ drafting: true, error: "" });
    try {
      const res = await api.post(`/admin/tickets/${id}/draft`, opts);
      setState((prev) => ({
        ...prev, draft: res.draft,
        reply: !prev.reply || opts.regenerate || opts.instruction ? res.draft.text : prev.reply,
        fromDraft: true,
      }));
    } catch (e) {
      updateState({ error: e.message });
    } finally {
      updateState({ drafting: false });
    }
  };

  useEffect(() => {
    const ticket = state.t;
    if (!ticket || autoFor.current === ticket.id) return;
    autoFor.current = ticket.id;
    const last = ticket.responses.at(-1);

    if (ticket.status !== "Closed" && (!last || last.role === "author")) getDraft();
    else if (ticket.aiDraft) updateState({ draft: { ...ticket.aiDraft, cached: true } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.t]);

  const patch = async (body) => {
    updateState({ error: "" });
    try {
      const res = await api.patch(`/admin/tickets/${id}`, body);
      updateState({ t: res.ticket });
    } catch (e) {
      updateState({ error: e.message });
    }
  };

  const send = async (e) => {
    e.preventDefault();
    updateState({ sending: true, error: "" });
    try {
      const res = await api.post(`/tickets/${id}/replies`, {
        message: state.reply, status: state.after, fromDraft: state.fromDraft,
      });
      updateState({ t: res.ticket, reply: "", draft: null, fromDraft: false });
    } catch (e) {
      updateState({ error: e.message });
    } finally {
      updateState({ sending: false });
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/admin/tickets/${id}/notes`, { note: state.note });
      updateState({ t: res.ticket, note: "", error: "" });
    } catch (e) {
      updateState({ error: e.message });
    }
  };

  const reclassify = async () => {
    updateState({ error: "" });
    try {
      const res = await api.post(`/admin/tickets/${id}/reclassify`, {});
      updateState({ t: res.ticket });
    } catch (e) {
      updateState({ error: e.message });
    }
  };

  const t = state.t;
  if (!t) return state.error ? <ErrorNote>{state.error}</ErrorNote> : <Spinner />;

  const closed = t.status === "Closed";

  return (
    <div className="admin-ticket">
      <section className="main-col">
        <Link to="/admin" className="back">← Queue</Link>

        <header className="detail-head">
          <div>
            <span className="muted small">
              {t.ticketNumber} · {t.author.name} ({t.author.email}) · {ftime(t.createdAt)}
            </span>
            <h2>{t.subject}</h2>
            <span className="muted small">
              {t.book ? t.book.title : "General / Account level"}
              {t.attachments.length > 0 &&
                ` · ${t.attachments.length} attachment(s): ${t.attachments.map((a) => a.name).join(", ")}`}
            </span>
          </div>
          <Badge kind="st" value={t.status} />
        </header>

        <ErrorNote>{state.error}</ErrorNote>
        <Thread ticket={t} viewer="admin" />

        {closed ? (
          <p className="muted">This ticket is closed. Reopen it from the sidebar to reply.</p>
        ) : (
          <form className="composer card" onSubmit={send}>
            <div className="composer-head">
              <h3>Reply to author</h3>
              {state.drafting && <span className="muted small" role="status">Drafting with AI…</span>}
            </div>

            {state.draft?.source === "template" && (
              <p className="note">
                AI drafting is unavailable right now, so this is a template.
                Fill in the [bracketed] parts and edit before sending.
              </p>
            )}
            {state.draft?.source === "ai" && (
              <p className="muted small">
                AI draft from our knowledge base{state.draft.cached ? " (saved)" : ""}. Check the facts before sending.
              </p>
            )}

            <textarea rows={10} value={state.reply}
              onChange={(e) => updateState({ reply: e.target.value })}
              placeholder="Write your reply, or generate an AI draft" required maxLength={5000} />

            <div className="row wrap gap">
              <input className="grow" value={state.instruction}
                onChange={(e) => updateState({ instruction: e.target.value })}
                placeholder="Optional: guide the draft (e.g. shorter, ask for photos)" maxLength={300} />
              <button type="button" className="btn ghost sm" disabled={state.drafting}
                onClick={() => getDraft({ regenerate: true, instruction: state.instruction || undefined })}>
                {state.draft ? "Regenerate draft" : "Generate AI draft"}
              </button>
            </div>

            <div className="row wrap gap">
              <label className="inline">
                After sending
                <select value={state.after} onChange={(e) => updateState({ after: e.target.value })}>
                  <option value="In Progress">keep In Progress</option>
                  <option value="Resolved">mark Resolved</option>
                  <option value="Closed">mark Closed</option>
                </select>
              </label>
              <button className="btn" disabled={state.sending || !state.reply.trim()}>
                {state.sending ? "Sending…" : "Send reply"}
              </button>
            </div>
          </form>
        )}
      </section>

      <aside className="side-col">
        <div className="card side">
          <label>
            Status
            <select value={t.status} onChange={(e) => patch({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label>
            Category <em className="src">{sourceLabel[t.categorySource]}</em>
            <select value={t.category} onChange={(e) => patch({ category: e.target.value })}>
              {CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label>
            Priority <em className="src">{sourceLabel[t.prioritySource]}</em>
            <select value={t.priority} onChange={(e) => patch({ priority: e.target.value })}>
              {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <div>
            <span className="lbl">Assigned to</span>
            <p>{t.assignedTo?.name || "Nobody yet"}</p>
            <button type="button" className="btn ghost sm" onClick={() => patch({ assignedTo: "me" })}>
              Assign to me
            </button>
          </div>

          {t.ai?.reason && (
            <p className="muted small">
              AI note: {t.ai.reason}
              {t.ai.confidence != null && ` (confidence ${Math.round(t.ai.confidence * 100)}%)`}
            </p>
          )}
          {t.ai?.status === "fallback" && (
            <p className="note">AI triage was unavailable; keyword rules were used.</p>
          )}
          <button type="button" className="btn ghost sm" onClick={reclassify}>Re-run AI triage</button>
        </div>

        <div className="card side">
          <h3>Internal notes</h3>
          <p className="muted small">Only the BookLeaf team can see these.</p>
          <ul className="notes">
            {t.internalNotes.map((n) => (
              <li key={n.id}>
                <p>{n.note}</p>
                <span className="muted small">{n.adminName} · {ftime(n.createdAt)}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={addNote}>
            <textarea rows={3} value={state.note}
              onChange={(e) => updateState({ note: e.target.value })}
              placeholder="Add a note" required maxLength={2000} />
            <button className="btn ghost sm" disabled={!state.note.trim()}>Add note</button>
          </form>
        </div>
      </aside>
    </div>
  );
}