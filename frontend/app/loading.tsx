export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4">
      {/* Spinning gradient ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-cyan-500 animate-spin"></div>
      </div>
      
      {/* Loading text */}
      <p className="text-slate-500 font-medium animate-pulse">
        Loading AI insights...
      </p>
    </div>
  )
}