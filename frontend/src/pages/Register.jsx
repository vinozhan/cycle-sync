import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { getErrorMessage } from '../utils/validators';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'password': {
        if (value.length > 0 && value.length < 8) return 'Must be at least 8 characters';
        if (value.length >= 8 && !/[A-Z]/.test(value)) return 'Must include an uppercase letter';
        if (value.length >= 8 && !/[a-z]/.test(value)) return 'Must include a lowercase letter';
        if (value.length >= 8 && !/[0-9]/.test(value)) return 'Must include a number';
        return '';
      }
      case 'confirmPassword': {
        if (value.length > 0 && value !== formData.password) return 'Passwords do not match';
        return '';
      }
      case 'email': {
        if (value.length > 0 && !/\S+@\S+\.\S+/.test(value)) return 'Invalid email address';
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    if (name === 'password' && formData.confirmPassword) {
      const confirmErr = formData.confirmPassword !== value ? 'Passwords do not match' : '';
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordErr = validateField('password', formData.password);
    const confirmErr = validateField('confirmPassword', formData.confirmPassword);
    if (passwordErr || confirmErr) {
      setErrors({ ...errors, password: passwordErr, confirmPassword: confirmErr });
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                errors.email
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-300 focus:border-emerald-500'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                errors.password
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-300 focus:border-emerald-500'
              }`}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">Min 8 characters, with uppercase, lowercase, and a number</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                errors.confirmPassword
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-300 focus:border-emerald-500'
              }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
