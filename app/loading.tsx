// Global loading state while Next.js fetches ISR data for the page
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-16 h-16 border-4 border-secondary border-t-highlight rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium font-['Poppins'] animate-pulse">Loading matches...</p>
    </div>
  );
}
