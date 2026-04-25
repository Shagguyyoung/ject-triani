const StatCard = ({ title, value, icon, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary text-white",
    green: "bg-green-500 text-white",
    gold: "bg-gold text-primary",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white",
  };

  return (
    <div className={`rounded-xl shadow-md p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;