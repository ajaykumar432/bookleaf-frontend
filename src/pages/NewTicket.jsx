import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorNote } from '../ui.jsx';

export default function NewTicket() {
  const nav = useNavigate();
  const { state: locationState } = useLocation();
  const [state, setState] = useState({
    books: [], bookId: locationState?.bookId || '', subject: '',
    description: '', files: [], error: '', busy: false,
  });
  const update = (data) => setState((prev) => ({ ...prev, ...data }));

  useEffect(() => {
    api.get('/books').then((r) => update({ books: r.items })).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    update({ busy: true, error: '' });
    try {
      const { ticket } = await api.post('/tickets', {
        bookId: state.bookId || null,
        subject: state.subject,
        description: state.description,
        attachments: state.files.map((f) => ({ name: f.name, size: f.size })),
      });
      nav(`/tickets/${ticket.id}`, { replace: true });
    } catch (err) {
      update({ error: err.message, busy: false });
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h1>New support query</h1>
      <label>Which book is this about?
        <select value={state.bookId} onChange={(e) => update({ bookId: e.target.value })}>
          <option value="">General / Account level</option>
          {state.books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
      </label>

      <label>Subject
        <input value={state.subject} onChange={(e) => update({ subject: e.target.value })}
          maxLength={150} required placeholder="e.g. I haven't received my royalty" />
      </label>

      <label>What's going on?
        <textarea rows={7} value={state.description}
          onChange={(e) => update({ description: e.target.value })}
          maxLength={5000} required
          placeholder="Share dates, numbers and anything you've already tried. The more detail, the faster we can help." />
      </label>

      <label>Attachments (optional)
        <input type="file" multiple accept="image/*,.pdf"
          onChange={(e) => update({ files: [...e.target.files].slice(0, 5) })} />
        {state.files.length > 0 && (
          <span className="muted small">
            {state.files.map((f) => f.name).join(', ')}. File names are saved with your query; ask us to share the files by email if needed.
          </span>
        )}
      </label>

      <ErrorNote>{state.error}</ErrorNote>
      <button className="btn" disabled={state.busy}>
        {state.busy ? 'Sending…' : 'Send query'}
      </button>
    </form>
  );
}