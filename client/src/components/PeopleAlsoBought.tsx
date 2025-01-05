import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Product } from "../types";

const PeopleAlsoBought = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/products/recommendations");
        setRecommendations(Array.isArray(res.data) ? res.data : []);
      } catch (error: string | any) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while fetching recommendations"
        );
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // If loading or no recommendations, return null
  if (isLoading || recommendations.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-emerald-400">
        People also bought
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((product: Product) => (
          <ProductCard key={product?._id || Math.random()} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
