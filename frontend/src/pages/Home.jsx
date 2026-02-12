import { Link } from 'react-router-dom';
import { HiMapPin, HiShieldCheck, HiTrophy, HiArrowRight, HiUserPlus, HiMap } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';

const features = [
  {
    icon: HiMapPin,
    title: 'Safe Routes',
    description: 'Discover and share cycling routes with safety ratings and community reviews.',
  },
  {
    icon: HiShieldCheck,
    title: 'Hazard Reports',
    description: 'Report road hazards and help fellow cyclists stay safe on their journeys.',
  },
  {
    icon: HiTrophy,
    title: 'Earn Rewards',
    description: 'Contribute to the community and earn badges, points, and achievements.',
  },
];

const steps = [
  {
    icon: HiUserPlus,
    step: '1',
    title: 'Create an Account',
    description: 'Sign up for free and join the cycling community in seconds.',
  },
  {
    icon: HiMap,
    step: '2',
    title: 'Explore Routes',
    description: 'Browse community-rated cycling routes with safety data and weather info.',
  },
  {
    icon: HiTrophy,
    step: '3',
    title: 'Contribute & Earn',
    description: 'Share routes, report hazards, write reviews, and earn achievement badges.',
  },
];

const communityStats = [
  { value: '500+', label: 'Active Cyclists' },
  { value: '120+', label: 'Safe Routes' },
  { value: '300+', label: 'Hazard Reports' },
  { value: '50+', label: 'Rewards Earned' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Cycle smarter,
              <br />
              ride safer.
            </h1>
            <p className="mt-4 text-lg text-emerald-100">
              CycleSync promotes sustainable urban cycling with community-driven safe routes,
              real-time hazard reporting, and a rewards system. Aligned with UN SDG 11.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/routes"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50"
              >
                Explore Routes <HiArrowRight className="h-4 w-4" />
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Why CycleSync?
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <feature.icon className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <item.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <p className="mt-4 text-sm font-semibold text-emerald-600">Step {item.step}</p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community stats */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Our Growing Community
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {communityStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-emerald-600">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-emerald-600">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">
            Ready to ride safer?
          </h2>
          <p className="mt-2 text-emerald-100">
            Join Sri Lanka&apos;s growing cycling community today.
          </p>
          <div className="mt-6">
            {isAuthenticated ? (
              <Link
                to="/routes"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50"
              >
                Browse Routes <HiArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50"
              >
                Join Now <HiArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
