import React from 'react';
import { Link } from 'react-router-dom';

const Feature = ({ title, desc, icon }) => (
	<div className="p-6 bg-white/60 backdrop-blur rounded-lg shadow-sm">
		<div className="h-12 w-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-md mb-3">
			{icon}
		</div>
		<h3 className="text-lg font-semibold mb-1">{title}</h3>
		<p className="text-sm text-gray-600">{desc}</p>
	</div>
);

const LandingPage = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-sky-50">
			<header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 bg-indigo-600 text-white rounded flex items-center justify-center font-bold">CS</div>
					<div>
						<h1 className="text-xl font-semibold">Clinic System</h1>
						<p className="text-xs text-gray-500">Manage appointments, records and billing</p>
					</div>
				</div>
				<nav className="flex items-center gap-3">
					<Link to="/login" className="px-4 py-2 text-sm rounded-md border border-indigo-600 text-indigo-600">Sign in</Link>
					<Link to="/register" className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white">Get started</Link>
				</nav>
			</header>

			<main className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12">
				<section className="flex-1">
					<h2 className="text-4xl font-extrabold text-slate-900 leading-tight">Modern clinic management for patients, doctors, and admins</h2>
					<p className="mt-4 text-lg text-gray-600">Book appointments, review medical records, manage schedules, and handle billing in one simple interface.</p>

					<div className="mt-8 flex gap-3">
						<Link to="/register" className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium">Create account</Link>
						<Link to="/login" className="px-6 py-3 border rounded-md border-gray-200 text-gray-700">Sign in</Link>
					</div>

					<div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
						<Feature
							title="Quick Appointments"
							desc="Patients can book and manage appointments in seconds."
							icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
						/>
						<Feature
							title="Unified Records"
							desc="Securely store and share medical records between providers."
							icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c.74 0 1.3-.56 1.3-1.25S12.74 5.5 12 5.5 10.7 6.06 10.7 6.75 11.26 8 12 8zM12 20s8-4 8-8a8 8 0 10-16 0c0 4 8 8 8 8z" /></svg>}
						/>
						<Feature
							title="Billing & Reports"
							desc="Integrated billing and concise reports for administrators."
							icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4M7 7h10M7 11h4" /></svg>}
						/>
					</div>
				</section>

				<aside className="w-full lg:w-1/3">
					<div className="bg-white rounded-xl shadow-lg p-6">
						<h4 className="text-lg font-semibold">Ready to improve clinic workflows?</h4>
						<p className="text-sm text-gray-600 mt-2">Sign up as a patient, doctor, or admin and try the demo data.</p>
						<div className="mt-4 flex gap-3">
							<Link to="/register" className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded">Register</Link>
							<Link to="/login" className="flex-1 text-center px-4 py-2 border rounded border-gray-200 text-gray-700">Login</Link>
						</div>
					</div>
				</aside>
			</main>

			<footer className="mt-12 border-t bg-white/40">
				<div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-gray-500">
					<div>© {new Date().getFullYear()} Clinic System</div>
					<div className="flex gap-4">
						<a href="#" className="hover:underline">Privacy</a>
						<a href="#" className="hover:underline">Terms</a>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
