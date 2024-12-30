import { useUserStore } from "../store/useUserStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);
  return <div>Home</div>;
}
