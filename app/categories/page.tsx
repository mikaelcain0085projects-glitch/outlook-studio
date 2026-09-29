import Link from "next/link";

const categories = [
  {
    name: "All",
    description: "Explore everything",
    href: "/shop",
    image: "/media/landing/slide5.jpg",
  },
  {
    name: "Boys",
    description: "Modern styles for boys",
    href: "/shop?category=boys",
    image: "/media/categories/boys.jpg",
  },
  {
    name: "Girls",
    description: "Contemporary girlswear",
    href: "/shop?category=girls",
    image: "/media/categories/girls.jpg",
  },
  {
    name: "Shoes",
    description: "Complete the look",
    href: "/shop?category=shoes",
    image: "/media/categories/shoes.jpg",
  },
  {
    name: "Accessories",
    description: "The finishing touch",
    href: "/shop?category=accessories",
    image: "/media/categories/accessories.jpg",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* Navigation */}
      <nav className="fixed left-1/2 top-5 z-30 flex w-[calc(100%-32px)] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full border border-white/15 bg-white/[0.08] px-5 py-3 shadow-2xl backdrop-blur-xl">
        <Link
          href="/"
          className="text-sm font-normal tracking-[0.28em] transition-all duration-500 hover:tracking-[0.42em]"
        >
          OUTLOOK STUDIO
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/categories"
            className="text-white transition"
          >
            Shop
          </Link>

          <Link
            href="/collections"
            className="text-white/70 transition hover:text-white"
          >
            Collections
          </Link>

          <Link
            href="/about"
            className="text-white/70 transition hover:text-white"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/wishlist"
            className="hidden rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white sm:block"
          >
            Wishlist
          </Link>

          <Link
            href="/account"
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-white/20 hover:text-white"
          >
            Account
          </Link>

          <Link
            href="/admin/login"
            className="hidden rounded-full px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white md:block"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Heading */}
      <section className="px-5 pb-14 pt-36 sm:px-8 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/45">
            Explore
          </p>

          <h1 className="text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
            Shop by category
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-white/50 md:text-base">
            Discover pieces curated for every style, occasion and
            personality.
          </p>
        </div>
      </section>

      {/* Category grid */}
      <section className="px-5 pb-16 sm:px-8 md:px-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={category.href}
              className={`group relative min-h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 ${
                index === 0
                  ? "sm:col-span-2 lg:col-span-7 lg:row-span-2 lg:min-h-[620px]"
                  : index === 1 || index === 2
                    ? "lg:col-span-5"
                    : "lg:col-span-6"
              }`}
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-105"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {/* Glass edge */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/55">
                      {category.description}
                    </p>

                    <h2 className="text-3xl font-light tracking-tight md:text-4xl">
                      {category.name}
                    </h2>
                  </div>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg backdrop-blur-md transition duration-500 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}