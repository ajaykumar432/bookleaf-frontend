export const inr = (n) => (n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`);
export const fdate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const ftime = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export function ago(d) {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(d)) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}
export const ageHours = (d) => (Date.now() - new Date(d)) / 3600000;

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
export const Badge = ({ kind, value }) => <span className={`badge ${kind}-${slug(value)}`}>{value}</span>;

export const Spinner = ({ label = 'Loading…' }) => <p className="muted pad" role="status">{label}</p>;
export const ErrorNote = ({ children }) => (children ? <p className="error" role="alert">{children}</p> : null);
export const Empty = ({ title, children }) => (
  <div className="empty"><h3>{title}</h3>{children && <p className="muted">{children}</p>}</div>
);
