import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DeleteEnquiryButton from "./DeleteEnquiryButton";
import DashboardButton from "./DashboardButton";

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
};

async function deleteEnquiry(formData: FormData) {
  "use server";

  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { error } = await supabase
    .from("customer_enquiries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete enquiry error:", error);
    return;
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminEnquiriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("customer_enquiries")
    .select("id, name, phone, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#F1EDE7] px-6 py-12 text-[#171717]">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-red-600">
            Unable to load customer enquiries.
          </p>
        </div>
      </main>
    );
  }

  const enquiries = (data ?? []) as Enquiry[];

  return (
    <main className="min-h-screen bg-[#F1EDE7] text-[#171717]">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#171717]/35">
              Administration
            </p>

            <h1 className="mt-3 text-3xl font-light tracking-[-0.04em] sm:text-4xl">
              Customer enquiries
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#171717]/50">
              Review messages from customers and keep track of their requests.
            </p>
          </div>

          <DashboardButton />
        </div>

        {/* Summary */}
        <div className="mt-8 rounded-[24px] border border-black/[0.06] bg-white/65 p-6 shadow-[0_18px_50px_rgba(40,35,30,0.05)] backdrop-blur-xl">
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#171717]/35">
            Total enquiries
          </p>

          <p className="mt-2 text-3xl font-light tracking-[-0.04em]">
            {enquiries.length}
          </p>
        </div>

        {/* Enquiries */}
        <section className="mt-8">
          {enquiries.length === 0 ? (
            <div className="rounded-[28px] border border-black/[0.06] bg-white/65 px-6 py-16 text-center shadow-[0_18px_50px_rgba(40,35,30,0.05)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-white">
                ✦
              </div>

              <h2 className="mt-5 text-xl font-light tracking-[-0.03em]">
                No enquiries yet.
              </h2>

              <p className="mt-2 text-sm text-[#171717]/45">
                Customer messages will appear here when they submit an enquiry.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <article
                  key={enquiry.id}
                  className="rounded-[28px] border border-black/[0.06] bg-white/75 p-6 shadow-[0_18px_50px_rgba(40,35,30,0.05)] backdrop-blur-xl sm:p-7"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-lg font-medium tracking-[-0.02em]">
                            {enquiry.name}
                          </h2>

                          <a
                            href={`tel:${enquiry.phone}`}
                            className="mt-1 inline-block text-xs text-[#171717]/45 transition-colors hover:text-[#171717]"
                          >
                            {enquiry.phone}
                          </a>
                        </div>

                        <p className="text-[9px] uppercase tracking-[0.14em] text-[#171717]/30">
                          {formatDate(enquiry.created_at)}
                        </p>
                      </div>

                      <div className="mt-5 rounded-2xl bg-[#F1EDE7] px-5 py-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#171717]/70">
                          {enquiry.message}
                        </p>
                      </div>
                    </div>

                    <form action={deleteEnquiry}>
                      <input type="hidden" name="id" value={enquiry.id} />

                      <DeleteEnquiryButton />
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}