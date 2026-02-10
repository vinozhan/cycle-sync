import { Link } from 'react-router-dom';
import { HiMapPin, HiShieldCheck, HiTrophy, HiArrowRight } from 'react-icons/hi2';

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

const Home = () => {
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
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Get Started
              </Link>
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
    </div>
  );
};

export default Home;
