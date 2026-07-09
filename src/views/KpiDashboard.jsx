/**
 * VIEW — KpiDashboard
 * Responsabilidad: Renderizar las 3 tarjetas de métricas KPI.
 * Componente puramente presentacional: solo recibe props, sin lógica.
 */
export default function KpiDashboard({ kpis, visible }) {
  if (!visible) return null;

  return (
    <section className="kpi-row">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">📋</div>
          <div className="kpi-info">
            <div className="kpi-label">Total Activos</div>
            <div className="kpi-value" id="kpiTotal">{kpis.total}</div>
          </div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-info">
            <div className="kpi-label">SLAs Vencidos</div>
            <div className="kpi-value" id="kpiSLA">{kpis.vencidos}</div>
          </div>
        </div>

        <div className="kpi-card kpi-success">
          <div className="kpi-icon">✅</div>
          <div className="kpi-info">
            <div className="kpi-label">Tasa de Resolución</div>
            <div className="kpi-value" id="kpiResueltos">{kpis.tasa}%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
