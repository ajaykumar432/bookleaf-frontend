// import { useCallback, useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { api } from '../../api.js';
// import { useLive } from '../../hooks.js';
// import { Badge, Empty, ErrorNote, Spinner, ageHours, ago } from '../../ui.jsx';

// const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
// const CATEGORIES = ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'];
// const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
// const initial = { status: '', category: '', priority: '', assigned: '', sort: 'urgency', q: '', from: '', to: '', page: 1 };

// const Select = ({ label, value, onChange, options }) => (
//   <label>{label}
//     <select value={value} onChange={(e) => onChange(e.target.value)}>
//       <option value="">All</option>
//       {options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>))}
//     </select>
//   </label>
// );

// export default function Queue() {
//   const [f, setF] = useState(initial);
//   const [data, setData] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [error, setError] = useState('');
//   const set = (k) => (v) => setF((s) => ({ ...s, [k]: v, page: k === 'page' ? v : 1 }));

//   const load = useCallback(async () => {
//     const qs = new URLSearchParams({ limit: '20' });
//     Object.entries(f).forEach(([k, v]) => v && qs.set(k, v));
//     try {
//       const [list, st] = await Promise.all([api.get(`/tickets?${qs}`), api.get('/admin/stats')]);
//       setData(list); setStats(st); setError('');
//     } catch (e) { setError(e.message); }
//   }, [f]);

//   useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t); }, [load, f.q]);
//   useLive(load);

//   const active = stats ? (stats.byStatus.Open || 0) + (stats.byStatus['In Progress'] || 0) : 0;
//   return (
//     <>
//       <h1>Ticket queue</h1>
//       {stats && (
//         <div className="stats">
//           <div><b>{active}</b><span>active</span></div>
//           <div className={stats.activeByPriority.Critical ? 'hot' : ''}><b>{stats.activeByPriority.Critical || 0}</b><span>critical</span></div>
//           <div><b>{stats.activeByPriority.High || 0}</b><span>high</span></div>
//           <div><b>{stats.unassignedActive}</b><span>unassigned</span></div>
//           <div><b>{stats.oldestActive ? ago(stats.oldestActive.createdAt) : '–'}</b><span>oldest open</span></div>
//         </div>
//       )}
//       <div className="filters card">
//         <label>Search<input value={f.q} onChange={(e) => set('q')(e.target.value)} placeholder="Subject or BL-0001" /></label>
//         <Select label="Status" value={f.status} onChange={set('status')} options={STATUSES} />
//         <Select label="Category" value={f.category} onChange={set('category')} options={CATEGORIES} />
//         <Select label="Priority" value={f.priority} onChange={set('priority')} options={PRIORITIES} />
//         <Select label="Assignee" value={f.assigned} onChange={set('assigned')} options={[['me', 'Assigned to me'], ['unassigned', 'Unassigned']]} />
//         <label>From<input type="date" value={f.from} onChange={(e) => set('from')(e.target.value)} /></label>
//         <label>To<input type="date" value={f.to} onChange={(e) => set('to')(e.target.value)} /></label>
//         <label>Sort
//           <select value={f.sort} onChange={(e) => set('sort')(e.target.value)}>
//             <option value="urgency">Most urgent, oldest first</option><option value="newest">Newest</option><option value="oldest">Oldest</option>
//           </select>
//         </label>
//         <button className="btn ghost sm" onClick={() => setF(initial)}>Clear</button>
//       </div>
//       <ErrorNote>{error}</ErrorNote>
//       {!data ? <Spinner /> : data.items.length === 0 ? <Empty title="No tickets match">Try clearing a filter.</Empty> : (
//         <ul className="queue">
//           {data.items.map((t) => {
//             const isActive = t.status === 'Open' || t.status === 'In Progress';
//             const stale = isActive && ageHours(t.createdAt) > 72;
//             return (
//               <li key={t.id}>
//                 <Link to={`/admin/tickets/${t.id}`} className={`qrow rail-${t.priority.toLowerCase()} ${isActive ? '' : 'done'}`}>
//                   <div className="qmain">
//                     <strong>{t.subject}</strong>
//                     <span className="muted small">{t.ticketNumber} · {t.author.name} · {t.book?.title || 'General'}</span>
//                   </div>
//                   <div className="qmeta">
//                     <Badge kind="pr" value={t.priority} />
//                     <span className="chip">{t.category}</span>
//                     <Badge kind="st" value={t.status} />
//                     <span className={`age ${stale ? 'stale' : ''}`} title="Time since submitted">{ago(t.createdAt)}</span>
//                     <span className="muted small assignee">{t.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</span>
//                   </div>
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//       {data && data.pages > 1 && (
//         <div className="pager">
//           <button className="btn ghost sm" disabled={f.page <= 1} onClick={() => set('page')(f.page - 1)}>Previous</button>
//           <span className="muted">Page {data.page} of {data.pages}</span>
//           <button className="btn ghost sm" disabled={f.page >= data.pages} onClick={() => set('page')(f.page + 1)}>Next</button>
//         </div>
//       )}
//     </>
//   );
// }







import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useLive } from '../../hooks.js';
import { Badge, Empty, ErrorNote, Spinner, ageHours, ago } from '../../ui.jsx';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const CATEGORIES = ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const initial = { status: '', category: '', priority: '', assigned: '', sort: 'urgency', q: '', from: '', to: '', page: 1 };

const Select = ({ label, value, onChange, options }) => (
  <label>{label}
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All</option>
      {options.map((o) => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>)}
    </select>
  </label>
);

export default function Queue() {
  const [state, setState] = useState({ f: initial, data: null, stats: null, error: '' });
  const { f, data, stats, error } = state;
  const set = (k) => (v) => setState((s) => ({ ...s, f: { ...s.f, [k]: v, page: k === 'page' ? v : 1 } }));

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ limit: '20' });
    Object.entries(f).forEach(([k, v]) => v && qs.set(k, v));
    try {
      const [list, st] = await Promise.all([api.get(`/tickets?${qs}`), api.get('/admin/stats')]);
      setState((s) => ({ ...s, data: list, stats: st, error: '' }));
    } catch (e) { setState((s) => ({ ...s, error: e.message })); }
  }, [f]);

  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t); }, [load, f.q]);
  useLive(load);

  const active = stats ? (stats.byStatus.Open || 0) + (stats.byStatus['In Progress'] || 0) : 0;

  return (
    <>
      <h1>Ticket queue</h1>
      {stats && (
        <div className="stats">
          <div><b>{active}</b><span>active</span></div>
          <div className={stats.activeByPriority.Critical ? 'hot' : ''}><b>{stats.activeByPriority.Critical || 0}</b><span>critical</span></div>
          <div><b>{stats.activeByPriority.High || 0}</b><span>high</span></div>
          <div><b>{stats.unassignedActive}</b><span>unassigned</span></div>
          <div><b>{stats.oldestActive ? ago(stats.oldestActive.createdAt) : '–'}</b><span>oldest open</span></div>
        </div>
      )}
      <div className="filters card">
        <label>Search<input value={f.q} onChange={(e) => set('q')(e.target.value)} placeholder="Subject or BL-0001" /></label>
        <Select label="Status" value={f.status} onChange={set('status')} options={STATUSES} />
        <Select label="Category" value={f.category} onChange={set('category')} options={CATEGORIES} />
        <Select label="Priority" value={f.priority} onChange={set('priority')} options={PRIORITIES} />
        <Select label="Assignee" value={f.assigned} onChange={set('assigned')} options={[['me', 'Assigned to me'], ['unassigned', 'Unassigned']]} />
        <label>From<input type="date" value={f.from} onChange={(e) => set('from')(e.target.value)} /></label>
        <label>To<input type="date" value={f.to} onChange={(e) => set('to')(e.target.value)} /></label>
        <label>Sort
          <select value={f.sort} onChange={(e) => set('sort')(e.target.value)}>
            <option value="urgency">Most urgent, oldest first</option><option value="newest">Newest</option><option value="oldest">Oldest</option>
          </select>
        </label>
        <button className="btn ghost sm" onClick={() => setState((s) => ({ ...s, f: { ...initial } }))}>Clear</button>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {!data ? <Spinner /> : data.items.length === 0 ? <Empty title="No tickets match">Try clearing a filter.</Empty> : (
        <ul className="queue">
          {data.items.map((t) => {
            const isActive = t.status === 'Open' || t.status === 'In Progress';
            const stale = isActive && ageHours(t.createdAt) > 72;
            return (
              <li key={t.id}>
                <Link to={`/admin/tickets/${t.id}`} className={`qrow rail-${t.priority.toLowerCase()} ${isActive ? '' : 'done'}`}>
                  <div className="qmain">
                    <strong>{t.subject}</strong>
                    <span className="muted small">{t.ticketNumber} · {t.author.name} · {t.book?.title || 'General'}</span>
                  </div>
                  <div className="qmeta">
                    <Badge kind="pr" value={t.priority} />
                    <span className="chip">{t.category}</span>
                    <Badge kind="st" value={t.status} />
                    <span className={`age ${stale ? 'stale' : ''}`} title="Time since submitted">{ago(t.createdAt)}</span>
                    <span className="muted small assignee">{t.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {data && data.pages > 1 && (
        <div className="pager">
          <button className="btn ghost sm" disabled={f.page <= 1} onClick={() => set('page')(f.page - 1)}>Previous</button>
          <span className="muted">Page {data.page} of {data.pages}</span>
          <button className="btn ghost sm" disabled={f.page >= data.pages} onClick={() => set('page')(f.page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}

