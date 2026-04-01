import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <span className="text-8xl mb-6 block">🏟️</span>
        <h1 className="text-4xl font-bold text-white mb-3 font-['Poppins']">404</h1>
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Match Not Found</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The match you&apos;re looking for doesn&apos;t exist or may have been removed. 
          Check out today&apos;s fixtures instead!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-highlight hover:bg-highlight/80 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
        >
          ⚽ Back to Live Scores
        </Link>
      </div>
    </div>
  );
}
