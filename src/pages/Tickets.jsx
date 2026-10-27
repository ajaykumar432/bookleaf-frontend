import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useLive } from '../hooks.js';
import { Badge, Empty, ErrorNote, Spinner, ago, ftime } from '../ui.jsx';

export function Thread({ ticket, viewer }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [ticket.responses.length]);
  const msg = (key, who, mine, time, text) => (
    <div key={key} className={`msg ${mine ? 'mine' : 'theirs'}`}>
      <div className="msg-meta"><strong>{who}</strong><span>{time}</span></div>
      <p>{text}</p>
    </div>
  );
  return (
    <div className="thread">
      {msg('orig', viewer === 'author' ? 'You' : ticket.author?.name || 'Author', true, ftime(ticket.createdAt), ticket.description)}
      {ticket.responses.map((r) => msg(r.id, r.role === viewer ? 'You' : r.role === 'admin' ? `BookLeaf · ${r.senderName}` : r.senderName, r.role === viewer, ftime(r.createdAt), r.message))}
      <div ref={endRef} />
    </div>
  );
}

function Detail({ id, onChanged }) {
  const [t, setT] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setT((await api.get(`/tickets/${id}`)).ticket); setError(''); } catch (e) { setError(e.message); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useLive((type, p) => { if (type === 'poll' || p.ticketId === id) load(); });

  const send = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { setT((await api.post(`/tickets/${id}/replies`, { message: text })).ticket); setText(''); onChanged(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (error && !t) return <ErrorNote>{error}</ErrorNote>;
  if (!t) return <Spinner />;
  return (
    <div className="detail">
      <Link to="/tickets" className="back">← All tickets</Link>
      <header className="detail-head">
        <div><span className="muted small">{t.ticketNumber}</span><h2>{t.subject}</h2></div>
        <Badge kind="st" value={t.status} />
      </header>
      <p className="muted small">{t.book ? t.book.title : 'General / Account level'} · {t.category}</p>
      {t.responses.length === 0 && <p className="note">We've received your query. Our team will reply here. You don't need to refresh; replies appear automatically.</p>}
      <Thread ticket={t} viewer="author" />
      {t.status === 'Closed' ? <p className="muted">This ticket is closed. <Link to="/tickets/new">Open a new query</Link> if you need more help.</p> : (
        <form className="reply" onSubmit={send}>
          <label className="sr">Your reply</label>
          <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.status === 'Resolved' ? 'Not resolved? Reply to reopen this ticket' : 'Write a reply'} required maxLength={5000} />
          <ErrorNote>{error}</ErrorNote>
          <button className="btn" disabled={busy || !text.trim()}>{busy ? 'Sending…' : 'Send reply'}</button>
        </form>
      )}
    </div>
  );
}

export default function Tickets() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setList((await api.get('/tickets?limit=100')).items); setError(''); } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useLive(load);

  return (
    <div className={`split ${id ? 'has-detail' : ''}`}>
      <aside className="split-list">
        <div className="split-head"><h1>My tickets</h1><Link className="btn sm" to="/tickets/new">New query</Link></div>
        <ErrorNote>{error}</ErrorNote>
        {!list ? <Spinner /> : list.length === 0 ? <Empty title="No tickets yet">Raise a query and our team will answer here.</Empty> : (
          <ul className="tlist">
            {list.map((t) => (
              <li key={t.id}>
                <Link to={`/tickets/${t.id}`} className={t.id === id ? 'active' : ''}>
                  <div className="row"><strong>{t.subject}</strong><Badge kind="st" value={t.status} /></div>
                  <span className="muted small">{t.ticketNumber} · {t.responses.length} {t.responses.length === 1 ? 'reply' : 'replies'} · {ago(t.updatedAt)} ago</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <section className="split-detail">
        {id ? <Detail key={id} id={id} onChanged={load} /> : <Empty title="Select a ticket">Pick a ticket to see the conversation.</Empty>}
      </section>
    </div>
  );
}
