import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Empty, ErrorNote, Spinner, fdate, inr } from '../ui.jsx';

function Book({ b }) {
  const live = b.isPublished;
  return (
    <article className="card book">
      <header>
        <h3>{b.title}</h3>
        <span className={`badge ${live ? 'st-resolved' : 'st-in-progress'}`}>{b.status}</span>
      </header>
      <dl className="facts">
        <div><dt>ISBN</dt><dd>{b.isbn}</dd></div>
        <div><dt>Genre</dt><dd>{b.genre}</dd></div>
        <div><dt>Published</dt><dd>{live ? fdate(b.publicationDate) : 'Not yet'}</dd></div>
        <div><dt>MRP</dt><dd>{inr(b.mrp)}</dd></div>
        <div><dt>Copies sold</dt><dd>{b.totalCopiesSold}</dd></div>
        <div><dt>Royalty earned</dt><dd>{inr(b.totalRoyaltyEarned)}</dd></div>
        <div><dt>Royalty paid</dt><dd>{inr(b.royaltyPaid)}</dd></div>
        <div><dt>Royalty pending</dt><dd className={b.royaltyPending > 0 ? 'warn' : ''}>{inr(b.royaltyPending)}</dd></div>
      </dl>
      {!live && <p className="note">This book is still in production, so there are no sales or royalties yet. Royalties start after it goes live.</p>}
      {live && b.royaltyPaid === 0 && b.royaltyPending > 0 && <p className="note">No payout has been made yet. Payouts happen quarterly, within 45 days of quarter end, once the balance reaches ₹1,000.</p>}
      {live && b.availableOn.length > 0 && <p className="muted small">Available on {b.availableOn.join(', ')}</p>}
      <Link className="btn ghost sm" to="/tickets/new" state={{ bookId: b.id }}>Ask about this book</Link>
    </article>
  );
}

export default function Books() {
  const [books, setBooks] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/books').then((r) => setBooks(r.items)).catch((e) => setError(e.message)); }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!books) return <Spinner />;
  return (
    <>
      <h1>My books</h1>
      {books.length === 0 ? <Empty title="No books yet">Once your manuscript is received it will appear here.</Empty>
        : <div className="grid">{books.map((b) => <Book key={b.id} b={b} />)}</div>}
    </>
  );
}
