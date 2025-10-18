import { Outlet, Link } from 'react-router-dom';
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between px-6">
          <Link to="/" className="font-bold text-xl">
            Tic-Tac-Toe
          </Link>
          <nav className="flex gap-4">
            <Link to="/" className="hover:text-gray-200">
              Home
            </Link>
            <Link to="/game" className="hover:text-gray-200">
              Play
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-6 py-8">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-center text-gray-700 py-3 text-sm">
        © {new Date().getFullYear()} Tic-Tac-Toe by Alaa
      </footer>
    </div>
  );
}
