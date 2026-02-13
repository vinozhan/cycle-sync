const Input = ({
  label,
  id,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
