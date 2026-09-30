import Link from "next/link";

const sections = [
  {
    title: "1. About This Policy",
    content: (
      <p>
        This Privacy Policy explains how OUTLOOK STUDIO collects, uses, and
        protects information when you browse our website, submit an enquiry,
        create an account, or place an order.
      </p>
    ),
  },
  {
    title: "2. Information We Collect",
    content: (
      <>
        <p>
          Depending on how you use our website, we may collect information
          such as your name, phone number, email address, delivery details,
          account information, order information, and messages submitted
          through our enquiry forms.
        </p>
        <p className="mt-4">
          We may also collect technical information such as browser type,
          device information, and basic website usage information to help us
          operate and improve the website.
        </p>
      </>
    ),
  },
  {
    title: "3. How We Use Your Information",
    content: (
      <>
        <p>Information may be used to:</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Process and manage your orders.</li>
          <li>Communicate with you about enquiries or orders.</li>
          <li>Provide customer support.</li>
          <li>Improve our website, products, and services.</li>
          <li>Maintain website security and prevent misuse.</li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Account Information",
    content: (
      <p>
        If you sign in or create an account, information associated with your
        account may be stored to provide account-related features and services.
        You are responsible for keeping your account credentials secure.
      </p>
    ),
  },
  {
    title: "5. Payments",
    content: (
      <p>
        Payment information may be processed through the payment method or
        payment service made available during checkout. We do not intend to
        store sensitive payment credentials such as card passwords or UPI PINs
        on our website.
      </p>
    ),
  },
  {
    title: "6. Cookies and Similar Technologies",
    content: (
      <p>
        Our website and the services used to operate it may use cookies or
        similar technologies for essential functionality, authentication,
        security, and improving the website experience.
      </p>
    ),
  },
  {
    title: "7. Service Providers",
    content: (
      <p>
        We may use trusted third-party services to operate parts of our
        website, such as authentication, hosting, image storage, analytics,
        payment processing, and delivery-related services. These providers
        may process information only as necessary to provide their services.
      </p>
    ),
  },
  {
    title: "8. Information Security",
    content: (
      <p>
        We take reasonable measures to protect information handled through our
        website. However, no online service can guarantee absolute security,
        and information transmitted over the internet may carry inherent
        risks.
      </p>
    ),
  },
  {
    title: "9. Data Retention",
    content: (
      <p>
        We retain information for as long as reasonably necessary to provide
        services, complete transactions, maintain business records, resolve
        enquiries, comply with applicable obligations, and protect our
        legitimate interests.
      </p>
    ),
  },
  {
    title: "10. Your Choices",
    content: (
      <p>
        You may contact us regarding information associated with your account
        or enquiries. Depending on the information and applicable requirements,
        we may be able to assist with requests to update or delete personal
        information.
      </p>
    ),
  },
  {
    title: "11. Children's Privacy",
    content: (
      <p>
        OUTLOOK STUDIO sells children's clothing, but our online services are
        intended to be used by parents, guardians, and other adults. We do not
        knowingly request personal information directly from children for
        account creation or purchases.
      </p>
    ),
  },
  {
    title: "12. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. Any revised
        version will be published on this page with an updated date.
      </p>
    ),
  },
  {
    title: "13. Contact",
    content: (
      <p>
        If you have questions or concerns about this Privacy Policy or how
        information is handled, please contact OUTLOOK STUDIO through the
        contact or enquiry options available on our website.
      </p>
    ),
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-black/50">
            How OUTLOOK STUDIO handles information when you use our website
            and services.
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