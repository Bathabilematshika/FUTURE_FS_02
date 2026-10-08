import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  logout, getLeads, createLead, updateLead, addNote, deleteLead,
} from '../api';


export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [newLead, setNewLead] = useState({ name: '', email: '', source: '' });

  async function loadLeads() {
    try {
      setLeads(await getLeads());
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => {
    getLeads()
    .then(setLeads)
    .catch((err) => setError(err.message));
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await createLead({ ...newLead, source: newLead.source || 'Manual entry' });
      setNewLead({ name: '', email: '', source: '' });
      loadLeads();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatus(id, status) {
    try {
      await updateLead(id, { status });
      loadLeads();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleNote(id) {
    if (!noteText.trim()) return;
    try {
      await addNote(id, { text: noteText, followUpDate: followUp || undefined });
      setNoteText('');
      setFollowUp('');
      loadLeads();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await deleteLead(id);
      loadLeads();
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = filter === 'all' ? leads : leads.filter((l) => l.status === filter);
  const count = (s) => leads.filter((l) => l.status === s).length;

  return (
    <div className="dash">
      <div className="topbar">
        <h1>Mini CRM</h1>
        <button onClick={handleLogout}>Log out</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div>Total<b>{leads.length}</b></div>
        <div>New<b>{count('new')}</b></div>
        <div>Contacted<b>{count('contacted')}</b></div>
        <div>Converted<b>{count('converted')}</b></div>
      </div>

      <form className="add-form" onSubmit={handleAdd}>
        <input placeholder="Name" value={newLead.name}
          onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={newLead.email}
          onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} required />
        <input placeholder="Source (optional)" value={newLead.source}
          onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} />
        <button type="submit">Add lead</button>
      </form>

      <div className="filter">
        <label>Show:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Source</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shown.length === 0 && (
            <tr><td colSpan="5">No leads to show.</td></tr>
          )}
          {shown.map((lead) => (
            <Fragment key={lead._id}>
              <tr>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.source}</td>
                <td>
                  <select value={lead.status}
                    onChange={(e) => handleStatus(lead._id, e.target.value)}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                </td>
                <td className="actions">
                  <button onClick={() => setOpenId(openId === lead._id ? null : lead._id)}>
                    Notes ({lead.notes.length})
                  </button>
                  <button className="danger" onClick={() => handleDelete(lead._id)}>
                    Delete
                  </button>
                </td>
              </tr>
              {openId === lead._id && (
                <tr key={lead._id + '-notes'}>
                  <td colSpan="5" className="notes-cell">
                    {lead.notes.length === 0 && <p>No notes yet.</p>}
                    {lead.notes.map((n) => (
                      <p key={n._id} className="note">
                        {n.text}
                        {n.followUpDate && (
                          <span> — follow up: {new Date(n.followUpDate).toLocaleDateString()}</span>
                        )}
                      </p>
                    ))}
                    <div className="note-form">
                      <input placeholder="Write a note..." value={noteText}
                        onChange={(e) => setNoteText(e.target.value)} />
                      <input type="date" value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)} />
                      <button onClick={() => handleNote(lead._id)}>Add note</button>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}