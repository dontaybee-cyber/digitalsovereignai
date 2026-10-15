"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { posts, type Category } from "@/lib/posts";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category | "All">(
    "All"
  );

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

        <section className="mx-auto max-w-6xl px-6 py-10">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-text-muted">
              No posts in this category yet.
            </p>
          )}
        </section>

        <Newsletter />
        <Footer />
      </main>
    </>
  );
}
