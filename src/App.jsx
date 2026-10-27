import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { Spinner } from './ui.jsx';
import Login from './pages/Login.jsx';
import Books from './pages/Books.jsx';
import NewTicket from './pages/NewTicket.jsx';
import Tickets from './pages/Tickets.jsx';
import Queue from './pages/admin/Queue.jsx';
import AdminTicket from './pages/admin/AdminTicket.jsx';

function Shell({ role }) {
  const { user, ready, logout } = useAuth();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/books'} replace />;

  const links = role === 'admin'
    ? [['/admin', 'Ticket queue']]
    : [['/books', 'My books'], ['/tickets/new', 'New query'], ['/tickets', 'My tickets']];

  return (
    <>
      <header className="topbar">
        <div className="brand">BookLeaf<span>{role === 'admin' ? 'Ops' : 'Authors'}</span></div>
        <nav aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/tickets' || to === '/admin'}>{label}</NavLink>
          ))}
        </nav>
        <div className="who">
          <span>{user.name}</span>
          <button className="btn ghost sm" onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="page"><Outlet /></main>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Shell role="author" />}>
        <Route path="/books" element={<Books />} />
        <Route path="/tickets/new" element={<NewTicket />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<Tickets />} />
      </Route>
      <Route element={<Shell role="admin" />}>
        <Route path="/admin" element={<Queue />} />
        <Route path="/admin/tickets/:id" element={<AdminTicket />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/books') : '/login'} replace />} />
    </Routes>
  );
}
