import { Metadata } from "next";
import SearchResults from "./SearchResults";
import TrendsSidebar from "@/components/TrendsSidebar";

interface SearchProps {
  searchParams: {
    q: string;
  };
}

export function generateMetadata({ searchParams }: SearchProps): Metadata {
  return {
    title: `Search results for "${searchParams.q}"`,
  };
}

export default function Search({ searchParams }: SearchProps) {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Search results for &quot;{searchParams.q}&quot;
          </h1>
        </div>

        <SearchResults query={searchParams.q} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
