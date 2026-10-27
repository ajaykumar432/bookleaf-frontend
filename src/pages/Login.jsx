import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../ui.jsx';

const DEMOS = [
  ['Admin', 'admin@bookleaf.com', 'Admin@123'],
  ['Author: no payout yet', 'ananya.reddy@email.com', 'Author@123'],
  ['Author: book in production', 'kavita.deshmukh@email.com', 'Author@123'],
];

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [state, setState] = useState({ email: '', password: '', error: '', busy: false });
  const update = (data) => setState((prev) => ({ ...prev, ...data }));

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/books'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    update({ busy: true, error: '' });
    try {
      const u = await login(state.email, state.password);
      nav(u.role === 'admin' ? '/admin' : '/books', { replace: true });
    } catch (err) {
      update({ error: err.message });
    } finally {
      update({ busy: false });
    }
  };

  return (
    <div className="login">
      <section className="login-intro">
        <h1>BookLeaf Author Support</h1>
        <p>Ask about royalties, ISBNs, printing or where your book is in production, and follow the answer here.</p>
      </section>

      <form className="card login-card" onSubmit={submit}>
        <h2>Log in</h2>
        <label>Email
          <input type="email" value={state.email} onChange={(e) => update({ email: e.target.value })} required autoComplete="username" />
        </label>
        <label>Password
          <input type="password" value={state.password} onChange={(e) => update({ password: e.target.value })} required autoComplete="current-password" />
        </label>
        <ErrorNote>{state.error}</ErrorNote>
        <button className="btn" disabled={state.busy}>{state.busy ? 'Logging in…' : 'Log in'}</button>

        <div className="demo">
          <p className="muted">Demo accounts</p>
          {DEMOS.map(([label, email, password]) => (
            <button type="button" key={email} className="btn ghost sm"
              onClick={() => update({ email, password })}>{label}</button>
          ))}
        </div>
      </form>
    </div>
  );
}