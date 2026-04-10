import { Link, useRouteError } from "react-router";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export function NotFoundPage() {
  const error: any = useRouteError();
  const is404 = error?.status === 404;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          {is404 ? "404" : "Oops!"}
        </h1>
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          {is404 ? "Page Not Found" : "Something went wrong"}
        </h2>
        
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          {is404 
            ? "The page you are looking for doesn't exist or has been moved."
            : error?.message || "An unexpected error occurred in the application."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <Link
            to="/app"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors w-full sm:w-auto shadow-lg shadow-emerald-500/20"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
