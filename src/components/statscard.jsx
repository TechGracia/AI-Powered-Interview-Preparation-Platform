function StatsCard({ title, value, color, icon: Icon }) {

  return (

    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.03] transition-all duration-300">

      {/* Icon */}
      {Icon && (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 mb-4 shadow-lg">
          <Icon size={22} className="text-white" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-gray-300 text-sm tracking-wide">
        {title}
      </h3>

      {/* Value */}
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>

    </div>

  );

}

export default StatsCard;