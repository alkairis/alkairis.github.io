import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { apiCreate, apiDelete, apiGet, apiUpdate } from '../api/api';
import {
  emptyForm,
  formatCell,
  formFromRow,
  getSection,
  toPayload,
} from '../admin/sections';
import '../admin/admin.css';

const SectionPage = () => {
  const { sectionKey } = useParams();
  const navigate = useNavigate();
  const section = useMemo(() => getSection(sectionKey), [sectionKey]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [form, setForm] = useState(() => (section ? emptyForm(section) : {}));
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handle401 = useCallback(
    (err) => {
      if (err?.status === 401) {
        navigate('/sign-me', { replace: true });
        return true;
      }
      return false;
    },
    [navigate]
  );

  const loadRows = useCallback(async () => {
    if (!section) return;
    setLoading(true);
    setListError('');
    try {
      const data = await apiGet(section.endpoint);
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setRows(list);
    } catch (err) {
      if (handle401(err)) return;
      // A 404 simply means nothing has been created yet.
      setRows([]);
      if (err?.status && err.status !== 404) {
        setListError(err.message || 'Failed to load records.');
      }
    } finally {
      setLoading(false);
    }
  }, [section, handle401]);

  useEffect(() => {
    setForm(section ? emptyForm(section) : {});
    setEditingId(null);
    setSuccess('');
    setFormError('');
    loadRows();
  }, [section, loadRows]);

  if (!section) {
    return (
      <div>
        <div className="admin-header">
          <h1>Not found</h1>
        </div>
        <p className="admin-muted">Unknown section.</p>
      </div>
    );
  }

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    setSuccess('');

    try {
      const payload = toPayload(section, form);
      if (editingId) {
        await apiUpdate(`${section.endpoint}/${editingId}`, payload);
      } else {
        await apiCreate(section.endpoint, payload);
      }
      setSuccess(`${section.label} saved successfully.`);
      setForm(emptyForm(section));
      setEditingId(null);
      await loadRows();
    } catch (err) {
      if (handle401(err)) return;
      const detail =
        err?.data?.detail && typeof err.data.detail === 'string'
          ? err.data.detail
          : err?.message;
      setFormError(detail || 'Failed to save. Check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (row) => {
    setForm(formFromRow(section, row));
    setEditingId(row.id);
    setFormError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm(emptyForm(section));
    setEditingId(null);
  };

  const handleDelete = async (row, rowKey) => {
    if (!window.confirm(`Delete this ${section.label} record?`)) return;

    // Single-record sections (resume) delete without an id.
    const path = section.single ? section.endpoint : `${section.endpoint}/${row.id}`;
    setDeletingId(rowKey);
    setListError('');
    setSuccess('');

    try {
      await apiDelete(path);
      setSuccess(`${section.label} record deleted.`);
      await loadRows();
    } catch (err) {
      if (handle401(err)) return;
      setListError(err?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = section.fields.map((field) => field.name);

  return (
    <div>
      <div className="admin-header">
        <h1>{section.label}</h1>
      </div>

      <div className="admin-panel">
        <h2>{editingId ? 'Edit record' : section.single ? 'Update' : 'Create new'}</h2>

        {formError && <div className="admin-error">{formError}</div>}
        {success && <div className="admin-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {section.fields.map((field) => {
              const isWide =
                field.type === 'textarea' || field.type === 'list';
              if (field.type === 'bool') {
                return (
                  <label
                    key={field.name}
                    className="admin-checkbox admin-field full"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.name])}
                      onChange={(e) => setField(field.name, e.target.checked)}
                    />
                    {field.label}
                  </label>
                );
              }

              return (
                <div
                  key={field.name}
                  className={`admin-field${isWide ? ' full' : ''}`}
                >
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      className="admin-textarea"
                      value={form[field.name] ?? ''}
                      required={field.required}
                      placeholder={field.placeholder}
                      onChange={(e) => setField(field.name, e.target.value)}
                    />
                  ) : (
                    <input
                      id={field.name}
                      className="admin-input"
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={form[field.name] ?? ''}
                      required={field.required}
                      placeholder={field.placeholder}
                      onChange={(e) => setField(field.name, e.target.value)}
                    />
                  )}
                  {field.hint && <small className="admin-hint">{field.hint}</small>}
                </div>
              );
            })}
          </div>

          <div className="admin-form-actions">
            <button className="admin-btn" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={cancelEdit}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-panel">
        <h2>Existing records</h2>

        {listError && <div className="admin-error">{listError}</div>}

        {loading ? (
          <p className="admin-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="admin-muted">No records yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col.replace(/_/g, ' ')}</th>
                  ))}
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const rowKey = row.id ?? index;
                  return (
                    <tr key={rowKey}>
                      {columns.map((col) => (
                        <td key={col} title={formatCell(row[col])}>
                          {formatCell(row[col])}
                        </td>
                      ))}
                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          style={{ marginRight: 8 }}
                          onClick={() => startEdit(row)}
                          disabled={!row.id || editingId === rowKey}
                        >
                          {editingId === rowKey ? 'Editing…' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDelete(row, rowKey)}
                          disabled={deletingId === rowKey}
                        >
                          {deletingId === rowKey ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionPage;
