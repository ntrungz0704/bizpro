"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatVND } from "@/lib/utils";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { Package, Plus, Search, AlertTriangle, Tag, ShieldCheck, Zap, RefreshCw } from "lucide-react";

export default function ProductsPage() {
  const { products, addProduct, quickReorderProduct, showToast, refreshAllData } = useApp();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "Laptop",
    uom: "Cái",
    costPrice: 10000000,
    sellingPrice: 15000000,
    onHand: 20,
    minStock: 5,
    status: "ACTIVE" as const,
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await refreshAllData();
      showToast("Đã làm mới danh mục sản phẩm và tồn kho thành công!", "success");
    } catch {
      showToast("Làm mới danh mục thất bại!", "error");
    } finally {
      setIsReloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      showToast("Vui lòng điền mã SKU và tên sản phẩm!", "error");
      return;
    }
    const success = await addProduct(formData);
    if (success) {
      setShowModal(false);
      setFormData({
        sku: "",
        name: "",
        category: "Laptop",
        uom: "Cái",
        costPrice: 10000000,
        sellingPrice: 15000000,
        onHand: 20,
        minStock: 5,
        status: "ACTIVE",
      });
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Danh mục Sản phẩm & Tồn kho</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị mã SKU, giá vốn, giá niêm yết và số lượng: <b>Tồn thực tế</b>, <b>Đang giữ</b>, <b>Khả dụng</b>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReload}
            disabled={isReloading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            title="Làm mới dữ liệu từ PostgreSQL"
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã SKU, tên hàng hóa, phân loại..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Products Table - Responsive & Compact */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">Mã SKU</th>
                <th className="py-3 px-3.5">Tên hàng hóa</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Phân loại</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Giá vốn / Giá bán</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Tồn thực tế</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Đang giữ</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Khả dụng</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Trạng thái kho</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedProducts.map((prod) => {
                const available = prod.onHand - prod.reserved;
                const isLowStock = available <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">{prod.sku}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900 max-w-[220px] truncate">{prod.name}</td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 space-y-0.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{formatVND(prod.sellingPrice)}</div>
                      <div className="text-[11px] text-slate-400">Vốn: {formatVND(prod.costPrice)}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-slate-800 whitespace-nowrap">
                      {prod.onHand} {prod.uom}
                    </td>
                    <td className="py-3 px-3.5 text-center font-semibold text-amber-600 whitespace-nowrap">
                      {prod.reserved} {prod.uom}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg font-bold text-xs ${
                          available > 5
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : available > 0
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {available} {prod.uom}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Sắp hết hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Tồn an toàn
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isLowStock && (
                          <button
                            type="button"
                            onClick={() => quickReorderProduct(prod.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white transition-all border border-amber-200/80 shadow-xs active:scale-95 cursor-pointer"
                            title="Tự động lập phiếu nhập kho bù định mức tồn an toàn"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-500" />
                            <span>Nhập nhanh</span>
                          </button>
                        )}
                        <Link
                          href="/inventory/receipts-issues"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-all border border-blue-200/80 shadow-xs active:scale-95 cursor-pointer"
                          title="Tạo phiếu nhập thêm hàng"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nhập hàng</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemName="sản phẩm"
        />
      </div>

      {/* PORTAL MODAL: Add Product (Overlays entire screen 100vw x 100vh) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Thêm sản phẩm mới vào kho"
        icon={<Plus className="w-5 h-5 text-blue-600" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã SKU *
              </label>
              <input
                type="text"
                required
                placeholder="SP-001..."
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị tính (UoM)
              </label>
              <input
                type="text"
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên sản phẩm / Hàng hóa *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Laptop Dell Latitude 5520..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Danh mục phân loại
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Laptop">Laptop / Máy tính xách tay</option>
              <option value="Server">Máy chủ & Linh kiện Server</option>
              <option value="Network">Thiết bị mạng & Router</option>
              <option value="Monitor">Màn hình chuyên đồ họa</option>
              <option value="Accessory">Phụ kiện & Thiết bị ngoại vi</option>
              <option value="UPS">Bộ lưu điện UPS</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá vốn nhập (VND)
              </label>
              <input
                type="number"
                min={0}
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá bán niêm yết (VND)
              </label>
              <input
                type="number"
                min={0}
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tồn đầu kỳ thực tế
              </label>
              <input
                type="number"
                min={0}
                value={formData.onHand}
                onChange={(e) => setFormData({ ...formData, onHand: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Định mức tồn tối thiểu
              </label>
              <input
                type="number"
                min={0}
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Lưu vào kho hàng
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
