import Link from "next/link";

const sections = [
  {
    title: "1. About OUTLOOK STUDIO",
    content: (
      <p>
        OUTLOOK STUDIO is an online fashion store offering clothing and
        accessories for children. By using this website or placing an order,
        you agree to these Terms of Agreement.
      </p>
    ),
  },
  {
    title: "2. Using Our Website",
    content: (
      <>
        <p>
          You agree to use this website only for lawful purposes and in a way
          that does not interfere with the operation, security, or availability
          of the website.
        </p>
        <p className="mt-4">
          You must provide accurate information when submitting enquiries,
          creating an account, or placing an order.
        </p>
      </>
    ),
  },
  {
    title: "3. Products and Availability",
    content: (
      <>
        <p>
          We make reasonable efforts to display product information, images,
          sizes, colours, prices, and availability accurately.
        </p>
        <p className="mt-4">
          Product availability may change without notice. We reserve the right
          to correct errors or update product information when necessary.
        </p>
      </>
    ),
  },
  {
    title: "4. Prices and Orders",
    content: (
      <>
        <p>
          All prices displayed on the website are shown in Indian Rupees (₹)
          unless stated otherwise.
        </p>
        <p className="mt-4">
          An order is subject to product availability and confirmation. We may
          contact you if additional information is required before processing
          an order.
        </p>
      </>
    ),
  },
  {
    title: "5. Payments",
    content: (
      <p>
        Payment methods made available through OUTLOOK STUDIO may include
        Cash on Delivery and online payment options. Payment instructions
        displayed during checkout should be followed carefully.
      </p>
    ),
  },
  {
    title: "6. Delivery",
    content: (
      <p>
        Delivery times may vary depending on the delivery location, product
        availability, courier services, and other circumstances. We will make
        reasonable efforts to process and dispatch confirmed orders promptly.
      </p>
    ),
  },
  {
    title: "7. Returns and Exchanges",
    content: (
      <p>
        Return or exchange eligibility depends on the return and exchange
        conditions applicable to the particular order or product. Customers
        should review the applicable instructions before sending an item back.
      </p>
    ),
  },
  {
    title: "8. Intellectual Property",
    content: (
      <p>
        The OUTLOOK STUDIO name, branding, website design, text, graphics,
        photographs, and other original content are protected by applicable
        intellectual-property laws. They may not be reproduced, copied, or
        commercially used without appropriate permission.
      </p>
    ),
  },
  {
    title: "9. Website Availability",
    content: (
      <p>
        We aim to keep the website available and functioning properly, but we
        cannot guarantee uninterrupted access at all times. Maintenance,
        technical problems, network issues, or circumstances beyond our
        control may temporarily affect availability.
      </p>
    ),
  },
  {
    title: "10. Changes to These Terms",
    content: (
      <p>
        We may update these Terms of Agreement from time to time. Updated
        terms will be published on this page, and the revised version will
        apply from the date it is posted.
      </p>
    ),
  },
  {
    title: "11. Contact",
    content: (
      <p>
        If you have questions about these Terms of Agreement, please contact
        OUTLOOK STUDIO through the contact or enquiry options available on our
        website.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F1EDE7] text-[#171717]">
      <header className="border-b border-black/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <Link
            href="/"
            className="text-[11px] font-medium uppercase tracking-[0.28em]"
          >
            OUTLOOK STUDIO
          </Link>

          <Link
            href="/"
            className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/50 transition hover:text-black"
          >
            Back to Store
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-20 pt-20 sm:px-8 md:pb-28 md:pt-28">
        <div className="max-w-2xl">
          <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-black/40">
            Legal
          </p>

          <h1 className="mt-5 text-5xl font-light tracking-[-0.055em] sm:text-6xl md:text-7xl">
            Terms of Agreement
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-black/50">
            The terms that apply when you browse, use, or purchase from
            OUTLOOK STUDIO.
          </p>

          <p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-black/35">
            Last updated: September 2026
          </p>
        </div>

        <div className="mt-20 border-t border-black/[0.08]">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-b border-black/[0.08] py-10 md:py-12"
            >
              <h2 className="text-lg font-medium tracking-[-0.02em]">
                {section.title}
              </h2>

              <div className="mt-4 max-w-3xl text-sm leading-7 text-black/55">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="pt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full bg-[#171717] px-6 py-3 text-[9px] font-medium uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-[#292929]"
          >
            Return to Store
            <span className="text-sm">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}