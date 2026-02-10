const FilterPanel = ({ filters, onFilterChange, children }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {children}
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options, allLabel = 'All' }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
    >
      <option value="">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

FilterPanel.Select = FilterSelect;

export default FilterPanel;
