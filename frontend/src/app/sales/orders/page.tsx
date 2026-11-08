"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { salesApi, crmApi, inventoryApi, authApi, getAccessToken } from "@/lib/api-client";
import { formatVND } from "@/lib/utils";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Boxes,
  RefreshCw,
  Loader2,
  PackageCheck,
} from "lucide-react";

interface SalesOrderItem {
  id: string;
  productId: string;
  skuSnapshot: string;
  productNameSnapshot: string;
  uomSnapshot: string;
  quantity: number | string;
  fulfilledQuantity: number | string;
  unitPrice: number | string;
  discountAmount: number | string;
  taxRate: number | string;
  lineTotal: number | string;
  product?: any;
}

interface SalesOrder {
  id: string;
  orderCode: string;
  customerId: string;
  warehouseId: string;
  orderDate: string;
  status: "DRAFT" | "CONFIRMED" | "PROCESSING" | "SHIPPING" | "PARTIALLY_FULFILLED" | "FULFILLED" | "CANCELLED";
  subtotal: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  remainingBalance: number | string;
  shippingRecipientName?: string;
  shippingPhone?: string;
  shippingFullAddress?: string;
  note?: string;
  createdAt: string;
  customer?: { id: string; name: string; phone?: string };
  warehouse?: { id: string; name: string; code: string };
  items: SalesOrderItem[];
  reservations?: any[];
  statusHistories?: any[];
}

export default function SalesOrdersPage() {
  const { showToast } = useApp();

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination & Filter state
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [fulfillModalOrder, setFulfillModalOrder] = useState<SalesOrder | null>(null);

  // New order form state
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [shippingRecipientName, setShippingRecipientName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // Fulfill modal fields
  const [carrierName, setCarrierName] = useState("Giao Hàng Nhanh (GHN)");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [fulfillNote, setFulfillNote] = useState("");

  // Load real data from PostgreSQL
  const fetchData = useCallback(async (showFeedback = false) => {
    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        await authApi.login("admin@bizpro.vn", "Admin@123456");
      }

      const [ordersRes, custsRes, prodsRes, whRes] = await Promise.all([
        salesApi.getOrders({ limit: 100 }),
        crmApi.getCustomers({ limit: 100 }),
        inventoryApi.getProducts(),
        inventoryApi.getWarehouses(),
      ]);

      const orderList = Array.isArray(ordersRes)
        ? ordersRes
        : ordersRes?.items || [];
      setOrders(orderList);

      const custList = Array.isArray(custsRes)
        ? custsRes
        : custsRes?.items || [];
      setCustomers(custList);
      if (custList.length > 0 && !customerId) {
        setCustomerId(custList[0].id);
      }

      const prodList = Array.isArray(prodsRes) ? prodsRes : [];
      setProducts(prodList);
      if (prodList.length > 0 && !selectedProductId) {
        setSelectedProductId(prodList[0].id);
        setUnitPrice(Number(prodList[0].sellingPrice) || 0);
      }

      const whList = Array.isArray(whRes) ? whRes : [];
      setWarehouses(whList);
      if (whList.length > 0 && !warehouseId) {
        setWarehouseId(whList[0].id);
      }

      if (showFeedback) {
        showToast("Đã làm mới dữ liệu đơn bán hàng thành công!", "success");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể tải dữ liệu bán hàng!", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast, customerId, selectedProductId, warehouseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update unitPrice when product selection changes
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p) {
      setUnitPrice(Number(p.sellingPrice) || 0);
    }
  };

  // Filter orders
  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "ALL" || o.status === activeTab;
    const matchSearch =
      (o.orderCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingPhone || "").includes(search);
    return matchTab && matchSearch;
  });

  // Paginated records
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  // Handle Create Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !warehouseId || !selectedProductId) {
      showToast("Vui lòng chọn đầy đủ Khách hàng, Kho hàng và Sản phẩm!", "error");
      return;
    }
    if (quantity <= 0) {
      showToast("Số lượng đặt hàng phải lớn hơn 0!", "error");
      return;
    }

    if (shippingPhone && shippingPhone.trim()) {
      const VN_PHONE_REGEX = /^(\+84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d|2\d{1,2})[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/;
      if (!VN_PHONE_REGEX.test(shippingPhone.trim())) {
        showToast("Số điện thoại nhận hàng không đúng định dạng (+84 hoặc 0, 10 số)!", "error");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await salesApi.createOrder({
        customerId,
        warehouseId,
        shippingRecipientName: shippingRecipientName || undefined,
        shippingPhone: shippingPhone || undefined,
        shippingFullAddress: shippingAddress || undefined,
        note: note || undefined,
        items: [
          {
            productId: selectedProductId,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
            discountAmount: Number(discountAmount) || 0,
            taxRate: 10,
          },
        ],
      });

      showToast("Tạo đơn hàng bản thảo (DRAFT) thành công!", "success");
      setShowCreateModal(false);
      setQuantity(1);
      setDiscountAmount(0);
      setNote("");
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Tạo đơn hàng thất bại!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1 -> Step 2: DRAFT -> CONFIRMED
  const handleConfirmOrder = async (orderId: string) => {
    try {
      await salesApi.confirmOrder(orderId, { note: "Xác nhận đơn và khóa giữ kho an toàn" });
      showToast("Bước 1 hoàn tất: Đã duyệt đơn và giữ kho thành công!", "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Duyệt đơn thất bại!", "error");
    }
  };

  // Step 2 -> Step 3: CONFIRMED -> PROCESSING
  const handleProcessOrder = async (orderId: string) => {
    try {
      await salesApi.processOrder(orderId);
      showToast("Bước 2 hoàn tất: Đơn hàng chuyển sang Đóng gói hàng (PROCESSING)!", "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Chuyển đóng gói thất bại!", "error");
    }
  };

  // Step 3 -> Step 4: PROCESSING -> SHIPPING (Fulfill Modal)
  const handleFulfillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillModalOrder) return;

    setIsSubmitting(true);
    try {
      await salesApi.fulfillOrder(fulfillModalOrder.id, {
        carrierName,
        trackingNumber: trackingNumber || undefined,
        note: fulfillNote || undefined,
      });

      showToast("Bước 3 hoàn tất: Đã xuất kho bàn giao ĐVVC! Đang giao hàng (SHIPPING).", "success");
      setFulfillModalOrder(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Xuất kho giao hàng thất bại!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4 -> Step 5: SHIPPING -> FULFILLED
  const handleDeliverOrder = async (orderId: string) => {
    try {
      await salesApi.deliverOrder(orderId);
      showToast("Bước 4 hoàn tất: Khách đã nhận hàng thành công (FULFILLED)!", "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Xác nhận giao hàng thất bại!", "error");
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    const reason = window.prompt("Nhập lý do hủy đơn hàng:");
    if (!reason) return;

    try {
      await salesApi.cancelOrder(orderId, reason);
      showToast("Đã hủy đơn hàng và giải phóng tồn kho khả dụng!", "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Hủy đơn thất bại!", "error");
    }
  };

  // Status Badge Helper for 5-step strict workflow
  const getStatusBadge = (status: SalesOrder["status"]) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            1. Chờ duyệt
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            2. Đã giữ hàng
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            3. Đang đóng gói
          </span>
        );
      case "SHIPPING":
      case "PARTIALLY_FULFILLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
            4. Đang giao hàng
          </span>
        );
      case "FULFILLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            5. Giao thành công
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Đã hủy (Cancelled)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Quản lý Đơn bán hàng (Sales Orders)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình giao vận 5 bước chuẩn mực: Chờ duyệt → Đã giữ hàng → Đang đóng gói → Đang giao hàng → Giao thành công.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchData(true)}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            title="Làm mới dữ liệu từ PostgreSQL"
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đơn hàng mới</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          {[
            { key: "ALL", label: "Tất cả đơn" },
            { key: "DRAFT", label: "1. Chờ duyệt" },
            { key: "CONFIRMED", label: "2. Đã giữ hàng" },
            { key: "PROCESSING", label: "3. Đang đóng gói" },
            { key: "SHIPPING", label: "4. Đang giao hàng" },
            { key: "FULFILLED", label: "5. Giao thành công" },
            { key: "CANCELLED", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
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
            placeholder="Tìm theo mã đơn, khách hàng, SĐT..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table - Optimized Responsive Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">Mã đơn</th>
                <th className="py-3 px-3.5">Khách hàng</th>
                <th className="py-3 px-3.5">Kho xuất</th>
                <th className="py-3 px-3.5">Mặt hàng</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Tổng tiền</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Trạng thái (5 bước)</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Ngày đặt</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Thao tác quy trình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Đang tải dữ liệu từ PostgreSQL...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-blue-600 font-mono whitespace-nowrap">
                      {order.orderCode}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-900 max-w-[180px] truncate">
                      {order.customer?.name || "Khách lẻ"}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {order.warehouse?.name || "Kho mặc định"}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-[220px]">
                      {order.items.map((i) => (
                        <div key={i.id || i.productId} className="truncate text-xs py-0.5">
                          • {i.productNameSnapshot} <span className="font-bold text-slate-800">x{Number(i.quantity)}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900 text-right whitespace-nowrap">
                      {formatVND(Number(order.totalAmount))}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(order.orderDate || order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Step 1: DRAFT -> CONFIRMED */}
                        {order.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => handleConfirmOrder(order.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              title="Duyệt đơn và giữ hàng tồn kho"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Duyệt đơn</span>
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hủy đơn hàng"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Step 2: CONFIRMED -> PROCESSING */}
                        {order.status === "CONFIRMED" && (
                          <>
                            <button
                              onClick={() => handleProcessOrder(order.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              title="Chuyển sang đóng gói kiện hàng"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                              <span>Đóng gói hàng</span>
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hủy đơn hàng"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Step 3: PROCESSING -> SHIPPING */}
                        {order.status === "PROCESSING" && (
                          <button
                            onClick={() => setFulfillModalOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            title="Xuất kho bàn giao đơn vị vận chuyển"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Xuất kho giao hàng</span>
                          </button>
                        )}

                        {/* Step 4: SHIPPING -> FULFILLED */}
                        {(order.status as string) === "SHIPPING" && (
                          <button
                            onClick={() => handleDeliverOrder(order.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            title="Xác nhận khách đã nhận hàng thành công"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Giao thành công</span>
                          </button>
                        )}

                        {/* Step 5: FULFILLED or CANCELLED */}
                        {(order.status === "FULFILLED" || order.status === "CANCELLED") && (
                          <span className="text-slate-400 text-[11px] italic pr-1">
                            {order.status === "FULFILLED" ? "Đã hoàn tất" : "Đã hủy"}
                          </span>
                        )}

                        {/* Detail icon */}
                        <button
                          onClick={async () => {
                            try {
                              const full = await salesApi.getOrderById(order.id);
                              setSelectedOrder(full);
                            } catch {
                              setSelectedOrder(order);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemName="đơn hàng"
        />
      </div>

      {/* PORTAL MODAL 1: Create Sales Order (Cover 100vw x 100vh, blocks all clicks behind) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Lập đơn bán hàng mới (DRAFT)"
        icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khách hàng *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kho xuất hàng *
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sản phẩm đặt mua *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.sku}] — Giá: {formatVND(Number(p.sellingPrice))}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số lượng *
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn giá (VND) *
              </label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chiết khấu (VND)
              </label>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex justify-between items-center text-xs">
            <span className="text-slate-600">Thành tiền (+10% VAT):</span>
            <span className="font-bold text-sm text-blue-700">
              {formatVND(Math.max(0, quantity * unitPrice - discountAmount) * 1.1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người nhận hàng
              </label>
              <input
                type="text"
                value={shippingRecipientName}
                onChange={(e) => setShippingRecipientName(e.target.value)}
                placeholder="Họ tên người nhận"
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại nhận
              </label>
              <input
                type="text"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                placeholder="09..."
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ giao hàng đầy đủ
            </label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú đơn hàng
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú đóng gói hoặc hướng dẫn giao vận..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Lưu đơn bản thảo</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* PORTAL MODAL 2: Fulfill / Xuất kho giao hàng */}
      <Modal
        isOpen={!!fulfillModalOrder}
        onClose={() => setFulfillModalOrder(null)}
        title={`Xuất kho giao hàng (${fulfillModalOrder?.orderCode})`}
        icon={<Truck className="w-5 h-5 text-purple-600" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFulfillSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đơn vị vận chuyển / Shipper
            </label>
            <input
              type="text"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã vận đơn (Tracking Number)
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="VD: GHN-99887766"
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú xuất kho
            </label>
            <textarea
              rows={2}
              value={fulfillNote}
              onChange={(e) => setFulfillNote(e.target.value)}
              placeholder="Ghi chú giao nhận..."
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
            Hệ thống sẽ tự động tạo <b>Phiếu xuất kho (Stock Issue)</b>, trừ số lượng tồn thực tế và chuyển trạng thái đơn hàng sang <b>Bước 4: Đang giao hàng (SHIPPING)</b>.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFulfillModalOrder(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Xác nhận xuất kho</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* PORTAL MODAL 3: View Order Detail */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn hàng ${selectedOrder?.orderCode}`}
        icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
        maxWidth="max-w-xl"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">
                  Khách hàng: {selectedOrder.customer?.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Ngày đặt: {new Date(selectedOrder.orderDate || selectedOrder.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <h4 className="font-semibold text-slate-700 mb-2">Chi tiết sản phẩm đặt mua:</h4>
              {selectedOrder.items.map((i) => (
                <div key={i.id || i.productId} className="flex justify-between py-1.5 border-b border-slate-200/60 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{i.productNameSnapshot}</p>
                    <p className="text-[11px] text-slate-500">
                      SKU: {i.skuSnapshot} | Số lượng: {Number(i.quantity)} {i.uomSnapshot}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">{formatVND(Number(i.lineTotal))}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-2 border-t border-slate-200 font-bold text-sm text-blue-700">
                <span>Tổng tiền thanh toán:</span>
                <span>{formatVND(Number(selectedOrder.totalAmount))}</span>
              </div>
            </div>

            {selectedOrder.shippingFullAddress && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-semibold text-slate-700 mb-1">Địa chỉ giao hàng:</h4>
                <p className="text-slate-600">
                  {selectedOrder.shippingRecipientName && <b>{selectedOrder.shippingRecipientName} - </b>}
                  {selectedOrder.shippingPhone && <span>{selectedOrder.shippingPhone} - </span>}
                  {selectedOrder.shippingFullAddress}
                </p>
              </div>
            )}

            {/* Status Histories */}
            {selectedOrder.statusHistories && selectedOrder.statusHistories.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-semibold text-slate-700 mb-2">Tiến trình xử lý (Lịch sử trạng thái):</h4>
                <div className="space-y-1.5">
                  {selectedOrder.statusHistories.map((h: any, idx: number) => (
                    <div key={h.id || idx} className="text-[11px] text-slate-600 flex justify-between">
                      <span>
                        <b className="text-blue-600">{h.toStatus}</b>: {h.note || "Cập nhật trạng thái"}
                      </span>
                      <span className="text-slate-400">
                        {new Date(h.changedAt).toLocaleTimeString("vi-VN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
