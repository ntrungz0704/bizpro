"use client";

import React, { useState } from "react";
import { useApp, SalesOrder } from "@/context/AppContext";
import { formatVND } from "@/lib/utils";
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  AlertCircle,
  Boxes,
} from "lucide-react";

export default function SalesOrdersPage() {
  const {
    salesOrders,
    customers,
    products,
    createSalesOrder,
    confirmSalesOrder,
    fulfillSalesOrder,
    cancelSalesOrder,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // New order form state
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const filtered = salesOrders.filter((o) => {
    const matchTab = activeTab === "ALL" || o.status === activeTab;
    const matchSearch =
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const selectedProdObj = products.find((p) => p.id === selectedProductId);
  const availableStock = selectedProdObj
    ? selectedProdObj.onHand - selectedProdObj.reserved
    : 0;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    const prod = products.find((p) => p.id === selectedProductId);

    if (!cust || !prod) {
      alert("Vui lòng chọn khách hàng và sản phẩm!");
      return;
    }

    const lineTotal = prod.sellingPrice * quantity;
    const newOrder: Omit<SalesOrder, "id"> = {
      code: `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: cust.id,
      customerName: cust.name,
      orderDate: new Date().toISOString().split("T")[0],
      status: "DRAFT",
      totalAmount: lineTotal,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: quantity,
          unitPrice: prod.sellingPrice,
          lineTotal: lineTotal,
        },
      ],
      note: note || "Đơn hàng tạo mới trên hệ thống",
    };

    createSalesOrder(newOrder);
    setShowCreateModal(false);
    setQuantity(1);
    setNote("");
  };

  const getStatusBadge = (status: SalesOrder["status"]) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Đơn nháp
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Đã giữ hàng
          </span>
        );
      case "PARTIALLY_FULFILLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Xuất một phần
          </span>
        );
      case "FULFILLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Đã xuất kho
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Quản lý Đơn bán hàng (Sales Orders)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Liên kết trực tiếp giữa CRM và Kho hàng: Tạo đơn nháp $\rightarrow$ Xác nhận giữ hàng $\rightarrow$ Xuất kho.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn hàng mới</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { key: "ALL", label: "Tất cả đơn" },
            { key: "DRAFT", label: "Chờ xác nhận (Draft)" },
            { key: "CONFIRMED", label: "Đã giữ hàng (Confirmed)" },
            { key: "FULFILLED", label: "Đã hoàn tất (Fulfilled)" },
            { key: "CANCELLED", label: "Đã hủy (Cancelled)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn (SO-...), tên khách..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã đơn hàng</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4 min-w-[125px]">Trạng thái</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Quy trình xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-blue-600">{order.code}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {order.customerName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {order.items.map((i) => (
                      <div key={i.productId} className="truncate max-w-xs">
                        • {i.productName} <span className="font-bold text-slate-800">x{i.quantity}</span>
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatVND(order.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                  <td className="py-3.5 px-4 text-slate-500">{order.orderDate}</td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {/* Actions based on lifecycle */}
                    {order.status === "DRAFT" && (
                      <button
                        onClick={() => confirmSalesOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors active:scale-95"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Xác nhận (Giữ hàng)</span>
                      </button>
                    )}

                    {order.status === "CONFIRMED" && (
                      <button
                        onClick={() => fulfillSalesOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Xuất kho</span>
                      </button>
                    )}

                    {order.status !== "FULFILLED" && order.status !== "CANCELLED" && (
                      <button
                        onClick={() => cancelSalesOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Hủy đơn</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Sales Order */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Lập đơn bán hàng mới
            </h2>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khách hàng *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sản phẩm chọn mua *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Giá: {formatVND(p.sellingPrice)} (Tồn khả dụng: {p.onHand - p.reserved} {p.uom})
                    </option>
                  ))}
                </select>

                {/* Live Stock Indicator Badge */}
                {selectedProdObj && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-blue-600" />
                      Tồn thực tế: <b className="text-slate-900">{selectedProdObj.onHand}</b> | Đang giữ: <b className="text-slate-900">{selectedProdObj.reserved}</b>
                    </span>
                    <span
                      className={`font-bold ${
                        availableStock > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      Khả dụng: {availableStock} {selectedProdObj.uom}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng đặt mua *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tạm tính thành tiền
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-blue-700 rounded-xl border border-slate-200">
                    {selectedProdObj
                      ? formatVND(selectedProdObj.sellingPrice * quantity)
                      : "0đ"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú giao hàng, chính sách chiết khấu..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  Lưu đơn hàng nháp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Detail */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedOrder.code}</h3>
                <p className="text-xs text-slate-500">Khách hàng: {selectedOrder.customerName}</p>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <h4 className="font-semibold text-slate-700 mb-2">Chi tiết sản phẩm:</h4>
                {selectedOrder.items.map((i) => (
                  <div key={i.productId} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                    <span>{i.productName} (x{i.quantity})</span>
                    <span className="font-bold text-slate-800">{formatVND(i.lineTotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-1 font-bold text-sm text-blue-700">
                  <span>Tổng tiền thanh toán:</span>
                  <span>{formatVND(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {selectedOrder.note && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                  <b>Ghi chú:</b> {selectedOrder.note}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
