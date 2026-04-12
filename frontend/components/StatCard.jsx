function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

export default StatCard;
