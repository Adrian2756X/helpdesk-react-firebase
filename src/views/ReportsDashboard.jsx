import React, { useMemo } from 'react';
import { useTicketController } from '../controllers/useTicketController';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { LineChart, FileText, Star } from 'lucide-react';


const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6'];

export default function ReportsDashboard() {
  const { tickets } = useTicketController();

  const dataPorEstado = useMemo(() => {
    const counts = { Abierto: 0, 'En Progreso': 0, Resuelto: 0 };
    tickets.forEach(t => {
      if (counts[t.estado] !== undefined) counts[t.estado]++;
    });
    return [
      { name: 'Abierto', value: counts['Abierto'] },
      { name: 'En Progreso', value: counts['En Progreso'] },
      { name: 'Resuelto', value: counts['Resuelto'] },
    ];
  }, [tickets]);

  const dataPorTipo = useMemo(() => {
    const counts = { Incidente: 0, Solicitud: 0, RFC: 0 };
    tickets.forEach(t => {
      if (counts[t.tipo] !== undefined) counts[t.tipo]++;
    });
    return [
      { name: 'Incidente', value: counts['Incidente'] },
      { name: 'Solicitud', value: counts['Solicitud'] },
      { name: 'RFC', value: counts['RFC'] },
    ];
  }, [tickets]);

  const csatPromedio = useMemo(() => {
    const resueltos = tickets.filter(t => t.estado === 'Resuelto' && t.csat);
    if (resueltos.length === 0) return 0;
    const sum = resueltos.reduce((acc, t) => acc + t.csat.rating, 0);
    return (sum / resueltos.length).toFixed(1);
  }, [tickets]);

  return (
    <main className="layout" style={{ maxWidth: '1200px', margin: '0 auto', display: 'block' }}>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          <span className="card-title-icon"><LineChart size={16} /></span>
          Métricas Principales
        </div>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon"><FileText size={24} color="var(--primary)" /></div>
            <div className="kpi-info">
              <div className="kpi-label">Total Tickets Históricos</div>
              <div className="kpi-value">{tickets.length}</div>
            </div>
          </div>
          <div className="kpi-card kpi-success">
            <div className="kpi-icon"><Star size={24} color="var(--warning)" /></div>
            <div className="kpi-info">
              <div className="kpi-label">Satisfacción (CSAT) Promedio</div>
              <div className="kpi-value">{csatPromedio} / 5.0</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-title">Distribución por Estado</div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPorEstado}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Distribución por Tipo de Ticket</div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPorTipo} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
