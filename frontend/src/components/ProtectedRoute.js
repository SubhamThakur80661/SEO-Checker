import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-3 bg-parchment text-bark">
        <Loader2 size={28} className="animate-spin text-sage" />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
