import { useState, useMemo } from 'react';
import { transactions, formatCurrency, formatDateTime } from '../../data/mockData';
import Icon from '../../components/IconMap';
import { TrendingUp, TrendingDown, ArrowLeftRight, FileDown, FileText } from 'lucide-react';
import './Transactions.css';

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.reference.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [search, typeFilter, categoryFilter]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalTransfers = filtered.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

  const handleExport = (format: string) => {
    const header = 'Fecha,Descripción,Categoría,Monto,Tipo,Referencia\n';
    const rows = filtered.map(t =>
      `${t.date},${t.description},${t.category},${t.amount},${t.type},${t.reference}`
    ).join('\n');
    const content = header + rows;
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacciones.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container transactions">
      <div className="page-header">
        <h1>Transacciones</h1>
        <p>Historial completo de movimientos con filtros y exportación</p>
      </div>

      {/* Summary */}
      <div className="transactions__summary">
        <div className="card transactions__summary-card">
          <div className="transactions__summary-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-accent)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="transactions__summary-info">
            <div className="transactions__summary-label">Total Ingresos</div>
            <div className="transactions__summary-value" style={{ color: 'var(--color-accent)' }}>
              +{formatCurrency(totalIncome)}
            </div>
          </div>
        </div>
        <div className="card transactions__summary-card">
          <div className="transactions__summary-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
            <TrendingDown size={20} />
          </div>
          <div className="transactions__summary-info">
            <div className="transactions__summary-label">Total Gastos</div>
            <div className="transactions__summary-value" style={{ color: 'var(--color-error)' }}>
              -{formatCurrency(totalExpenses)}
            </div>
          </div>
        </div>
        <div className="card transactions__summary-card">
          <div className="transactions__summary-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary-light)' }}>
            <ArrowLeftRight size={20} />
          </div>
          <div className="transactions__summary-info">
            <div className="transactions__summary-label">Transferencias</div>
            <div className="transactions__summary-value" style={{ color: 'var(--color-primary-light)' }}>
              {formatCurrency(totalTransfers)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="transactions__filters">
        <input
          className="input transactions__search"
          placeholder="Buscar por descripción o referencia..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="transactions__filter-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="all">Todos los tipos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
          <option value="transfer">Transferencias</option>
        </select>
        <select
          className="transactions__filter-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.filter(c => c !== 'all').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="transactions__export-btns">
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            <FileDown size={14} /> CSV
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('txt')}>
            <FileText size={14} /> TXT
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card transactions__table-wrapper">
        <table className="transactions__table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Cuenta</th>
              <th>Estado</th>
              <th>Referencia</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(txn => (
              <tr key={txn.id}>
                <td>
                  <div className="transactions__table-desc">
                    <div className="transactions__table-icon">
                      <Icon name={txn.icon} size={16} />
                    </div>
                    <div>
                      <div className="transactions__table-text">{txn.description}</div>
                      <div className="transactions__table-sub">{txn.category}</div>
                    </div>
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{formatDateTime(txn.date)}</td>
                <td>
                  <span className={`transactions__amount--${txn.type}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{txn.accountName}</td>
                <td>
                  <span className={`badge ${txn.status === 'completed' ? 'badge-success' : txn.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                    {txn.status === 'completed' ? 'Completada' : txn.status === 'pending' ? 'Pendiente' : 'Fallida'}
                  </span>
                </td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                  {txn.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="transactions__pagination">
          <div className="transactions__page-info">
            Mostrando {filtered.length} de {transactions.length} transacciones
          </div>
          <div className="transactions__page-btns">
            <button className="transactions__page-btn transactions__page-btn--active">1</button>
            <button className="transactions__page-btn">2</button>
            <button className="transactions__page-btn">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}
