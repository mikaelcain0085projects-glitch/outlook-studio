"use client";

import * as XLSX from "xlsx";
import { useMemo, useState } from "react";

type ExportOrderItem = {
  id: string;
  product_name: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number | null;
};

type ExportOrder = {
  id: string;
  order_number: string;
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  total: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_pincode: string | null;
  created_at: string;
  order_items: ExportOrderItem[];
};


type OrderExportControlsProps = {
  orders: ExportOrder[];
};
export default function OrderExportControls({
  orders,
}: OrderExportControlsProps) {
  const [year, setYear] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const years = useMemo(() => {
    const uniqueYears = new Set(
      orders.map((order) => new Date(order.created_at).getFullYear())
    );

    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const date = new Date(order.created_at);

      if (
        year !== "all" &&
        date.getFullYear() !== Number(year)
      ) {
        return false;
      }

      if (dateRange === "today") {
        const today = new Date();

        return (
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
        );
      }

      if (dateRange === "month") {
        const today = new Date();

        return (
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth()
        );
      }

      if (dateRange === "custom") {
        if (fromDate) {
          const from = new Date(`${fromDate}T00:00:00`);

          if (date < from) {
            return false;
          }
        }

        if (toDate) {
          const to = new Date(`${toDate}T23:59:59.999`);

          if (date > to) {
            return false;
          }
        }
      }

      return true;
    });
  }, [orders, year, dateRange, fromDate, toDate]);

  const handleExcelExport = () => {
    if (!filteredOrders.length || exporting) {
      return;
    }

    try {
      setExporting(true);

      const rows = filteredOrders.flatMap((order: ExportOrder) => {
        const orderDate = new Date(order.created_at);

        const formattedDate = orderDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        const fullAddress = [
          order.customer_address,
          order.customer_city,
          order.customer_state,
          order.customer_pincode,
        ]
          .filter(Boolean)
          .join(", ");

        if (!order.order_items?.length) {
          return [
            {
              "Order Number": order.order_number,
              "Order Date": formattedDate,
              "Customer Name": order.customer_name ?? "",
              "Phone Number": order.customer_phone ?? "",
              Address: fullAddress,
              "Product Name": "",
              Size: "",
              Colour: "",
              Quantity: 0,
"Unit Price": 0,
"Item Total": 0,
              "Payment Method": order.payment_method ?? "",
              "Payment Status": order.payment_status ?? "",
              "Order Status": order.status ?? "",
              "Order Total": order.total ?? 0,
            },
          ];
        }

        return order.order_items.map((item) => {
          const unitPrice = item.unit_price ?? 0;
          const itemTotal = unitPrice * item.quantity;

          return {
            "Order Number": order.order_number,
            "Order Date": formattedDate,
            "Customer Name": order.customer_name ?? "",
            "Phone Number": order.customer_phone ?? "",
            Address: fullAddress,
            "Product Name": item.product_name ?? "",
            Size: item.size ?? "",
            Colour: item.color ?? "",
            Quantity: item.quantity,
            "Unit Price": unitPrice,
            "Item Total": itemTotal,
            "Payment Method": order.payment_method ?? "",
            "Payment Status": order.payment_status ?? "",
            "Order Status": order.status ?? "",
            "Order Total": order.total ?? 0,
          };
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: 18 },
        { wch: 14 },
        { wch: 22 },
        { wch: 16 },
        { wch: 42 },
        { wch: 28 },
        { wch: 10 },
        { wch: 14 },
        { wch: 10 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 14 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Orders"
      );

      const datePart =
        dateRange === "custom"
          ? `${fromDate || "start"}-to-${toDate || "end"}`
          : dateRange;

      const yearPart = year === "all" ? "all-years" : year;

      XLSX.writeFile(
        workbook,
        `outlook-studio-orders-${yearPart}-${datePart}.xlsx`
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mt-6 rounded-[24px] border border-black/[0.06] bg-white/65 p-5 shadow-[0_12px_35px_rgba(40,35,30,0.035)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-[8px] uppercase tracking-[0.28em] text-[#171717]/35">
            Order Export
          </p>

          <p className="text-sm text-[#171717]/50">
            Filter customer orders before exporting.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Year */}
          <label className="block">
            <span className="mb-2 block text-[8px] uppercase tracking-[0.2em] text-[#171717]/35">
              Year
            </span>

            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#F8F5F1] px-3 text-xs text-[#171717] outline-none transition focus:border-black/[0.2]"
            >
              <option value="all">All years</option>

              {years.map((itemYear) => (
                <option key={itemYear} value={itemYear}>
                  {itemYear}
                </option>
              ))}
            </select>
          </label>

          {/* Date range */}
          <label className="block">
            <span className="mb-2 block text-[8px] uppercase tracking-[0.2em] text-[#171717]/35">
              Date
            </span>

            <select
              value={dateRange}
              onChange={(event) => {
                setDateRange(event.target.value);

                if (event.target.value !== "custom") {
                  setFromDate("");
                  setToDate("");
                }
              }}
              className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#F8F5F1] px-3 text-xs text-[#171717] outline-none transition focus:border-black/[0.2]"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="month">This month</option>
              <option value="custom">Custom range</option>
            </select>
          </label>

          {/* From */}
          {dateRange === "custom" && (
            <label className="block">
              <span className="mb-2 block text-[8px] uppercase tracking-[0.2em] text-[#171717]/35">
                From
              </span>

              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#F8F5F1] px-3 text-xs text-[#171717] outline-none transition focus:border-black/[0.2]"
              />
            </label>
          )}

          {/* To */}
          {dateRange === "custom" && (
            <label className="block">
              <span className="mb-2 block text-[8px] uppercase tracking-[0.2em] text-[#171717]/35">
                To
              </span>

              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#F8F5F1] px-3 text-xs text-[#171717] outline-none transition focus:border-black/[0.2]"
              />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] uppercase tracking-[0.14em] text-[#171717]/35">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"} selected
          </p>

          <div className="flex sm:justify-end">
  <button
    type="button"
    onClick={handleExcelExport}
    disabled={!filteredOrders.length || exporting}
    className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-orange-800 px-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(23,23,23,0.12)] transition hover:-translate-y-0.5 hover:bg-[#2a2a2a] hover:shadow-[0_12px_28px_rgba(23,23,23,0.16)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 sm:w-auto"
  >
    {exporting ? (
      <>
        <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
        Exporting...
      </>
    ) : (
      <>
        <span aria-hidden="true">↓</span>
        Export Excel
      </>
    )}
  </button>
</div>
        
        </div>
      </div>
    </div>
  );
}