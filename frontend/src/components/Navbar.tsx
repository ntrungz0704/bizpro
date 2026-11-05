"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Settings,
  LogOut,
  Check,
  X,
  Building,
  Phone,
  Mail,
  Lock,
  Save,
  ArrowRight,
  ShoppingCart,
  Package,
  Users,
  Target,
  UserCheck,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  href: string;
  type: "order" | "leave" | "inventory";
  isRead: boolean;
}

export default function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const router = useRouter();
  const {
    userProfile,
    updateUserProfile,
    isLoggedIn,
    login,
    logout,
    customers,
    salesOrders,
    products,
    employees,
    deals,
    showToast,
  } = useApp();

  const [showNoti, setShowNoti] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Global search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Profile modal edit state
  const [editProfileForm, setEditProfileForm] = useState({
    name: userProfile.name,
    phone: userProfile.phone,
    email: userProfile.email,
    department: userProfile.department,
  });
  const [activeProfileTab, setActiveProfileTab] = useState<"INFO" | "SECURITY">("INFO");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const notiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "noti_1",
      title: "Đơn hàng #SO-2026-0042 đã xác nhận và giữ hàng",
      time: "2 phút trước",
      href: "/sales/orders",
      type: "order",
      isRead: false,
    },
    {
      id: "noti_2",
      title: "Nguyễn Văn B gửi đơn xin nghỉ phép năm (2 ngày)",
      time: "15 phút trước",
      href: "/hrm/leave",
      type: "leave",
      isRead: false,
    },
    {
      id: "noti_3",
      title: "Laptop Dell XPS 13 chạm ngưỡng tồn tối thiểu",
      time: "1 giờ trước",
      href: "/inventory/products",
      type: "inventory",
      isRead: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setShowNoti(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      }
      if (e.key === "Escape") {
        setShowSearchDropdown(false);
        setShowNoti(false);
        setShowProfile(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync edit profile form with AppContext userProfile
  useEffect(() => {
    setEditProfileForm({
      name: userProfile.name,
      phone: userProfile.phone,
      email: userProfile.email,
      department: userProfile.department,
    });
  }, [userProfile]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast("Đã đánh dấu đã đọc tất cả thông báo!", "success");
  };

  const handleNotificationClick = (noti: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
    );
    setShowNoti(false);
    showToast(`Đang mở: ${noti.title}`, "info");
    router.push(noti.href);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileForm.name || !editProfileForm.phone) {
      showToast("Vui lòng nhập họ tên và số điện thoại!", "error");
      return;
    }
    updateUserProfile(editProfileForm);
    setShowProfileModal(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Vui lòng nhập mật khẩu hiện tại!", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Mật khẩu mới phải có tối thiểu 8 ký tự!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Xác nhận mật khẩu mới không khớp!", "error");
      return;
    }
    showToast("Đổi mật khẩu thành công! Phiên làm việc được cập nhật an toàn.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowProfileModal(false);
  };

  // Live Multi-Entity Search Query
  const cleanQ = searchQuery.trim().toLowerCase();
  const searchResults = React.useMemo(() => {
    if (!cleanQ) return null;
    return {
      customers: customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(cleanQ) ||
            c.code.toLowerCase().includes(cleanQ) ||
            c.phone.includes(cleanQ)
        )
        .slice(0, 3),
      salesOrders: salesOrders
        .filter(
          (o) =>
            o.code.toLowerCase().includes(cleanQ) ||
            o.customerName.toLowerCase().includes(cleanQ)
        )
        .slice(0, 3),
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(cleanQ) ||
            p.sku.toLowerCase().includes(cleanQ) ||
            p.category.toLowerCase().includes(cleanQ)
        )
        .slice(0, 3),
      employees: employees
        .filter(
          (e) =>
            e.name.toLowerCase().includes(cleanQ) ||
            e.code.toLowerCase().includes(cleanQ) ||
            e.department.toLowerCase().includes(cleanQ)
        )
        .slice(0, 3),
      deals: deals
        .filter(
          (d) =>
            d.title.toLowerCase().includes(cleanQ) ||
            d.customerName.toLowerCase().includes(cleanQ)
        )
        .slice(0, 3),
    };
  }, [cleanQ, customers, salesOrders, products, employees, deals]);

  const totalSearchHits = searchResults
    ? searchResults.customers.length +
      searchResults.salesOrders.length +
      searchResults.products.length +
      searchResults.employees.length +
      searchResults.deals.length
    : 0;

  const handleSelectSearchResult = (url: string, title: string) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    showToast(`Đang chuyển tới: ${title}`, "info");
    router.push(url);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Interactive Global Search Bar with Live Command Results */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchDropdown(true);
              }}
              placeholder="Tìm kiếm khách hàng, đơn hàng, sản phẩm, nhân sự..."
              className="w-full pl-10 pr-16 py-2 bg-slate-100/70 hover:bg-slate-100 text-xs sm:text-sm text-slate-700 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
            <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs pointer-events-none">
              Ctrl + K
            </kbd>

            {/* Live Search Results Dropdown */}
            {showSearchDropdown && cleanQ.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-scale-up max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                  <span className="font-semibold text-slate-600">
                    Kết quả tìm kiếm cho: &ldquo;{searchQuery}&rdquo;
                  </span>
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {totalSearchHits} kết quả
                  </span>
                </div>

                {totalSearchHits === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy dữ liệu nào khớp với từ khóa.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Customers */}
                    {searchResults && searchResults.customers.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-600" /> Khách hàng CRM
                        </div>
                        <div className="space-y-1">
                          {searchResults.customers.map((c) => (
                            <div
                              key={c.id}
                              onClick={() =>
                                handleSelectSearchResult("/crm/customers", c.name)
                              }
                              className="p-2 rounded-xl hover:bg-blue-50/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="font-bold text-slate-900">{c.name}</div>
                              <span className="text-[11px] font-mono font-semibold text-blue-600">
                                {c.code}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sales Orders */}
                    {searchResults && searchResults.salesOrders.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3 text-emerald-600" /> Đơn bán hàng
                        </div>
                        <div className="space-y-1">
                          {searchResults.salesOrders.map((o) => (
                            <div
                              key={o.id}
                              onClick={() =>
                                handleSelectSearchResult("/sales/orders", o.code)
                              }
                              className="p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-bold text-emerald-700 mr-2">{o.code}</span>
                                <span className="text-slate-600">{o.customerName}</span>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {o.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    {searchResults && searchResults.products.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3 text-amber-600" /> Hàng hóa & Kho
                        </div>
                        <div className="space-y-1">
                          {searchResults.products.map((p) => (
                            <div
                              key={p.id}
                              onClick={() =>
                                handleSelectSearchResult("/inventory/products", p.name)
                              }
                              className="p-2 rounded-xl hover:bg-amber-50/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="font-semibold text-slate-900">{p.name}</div>
                              <span className="text-[11px] font-bold text-slate-700">
                                Tồn: {p.onHand - p.reserved} khả dụng
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Employees */}
                    {searchResults && searchResults.employees.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-sky-600" /> Nhân viên
                        </div>
                        <div className="space-y-1">
                          {searchResults.employees.map((e) => (
                            <div
                              key={e.id}
                              onClick={() =>
                                handleSelectSearchResult("/hrm/employees", e.name)
                              }
                              className="p-2 rounded-xl hover:bg-sky-50/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="font-semibold text-slate-900">{e.name}</div>
                              <span className="text-[11px] text-slate-500">{e.department}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-5 ml-4">
          {/* Notification Bell */}
          <div className="relative" ref={notiRef}>
            <button
              onClick={() => {
                setShowNoti(!showNoti);
                setShowProfile(false);
              }}
              className="relative w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5 stroke-[1.8]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNoti && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-scale-up">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-800">Thông báo mới</h4>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                        {unreadCount} chưa đọc
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 ? (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Đánh dấu đã đọc</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Đã đọc tất cả</span>
                  )}
                </div>

                <div className="space-y-2">
                  {notifications.map((noti) => (
                    <div
                      key={noti.id}
                      onClick={() => handleNotificationClick(noti)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                        noti.isRead
                          ? "bg-slate-50/50 hover:bg-slate-100/70 opacity-75"
                          : "bg-blue-50/40 hover:bg-blue-50 border border-blue-100/50"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          noti.type === "order"
                            ? "bg-blue-100 text-blue-600"
                            : noti.type === "leave"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {noti.type === "order" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : noti.type === "leave" ? (
                          <Calendar className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs leading-snug line-clamp-2 ${
                            noti.isRead
                              ? "font-normal text-slate-600"
                              : "font-semibold text-slate-900"
                          }`}
                        >
                          {noti.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-400">{noti.time}</span>
                          {!noti.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNoti(false);
              }}
              className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-blue-500/20">
                {userProfile.name.charAt(userProfile.name.lastIndexOf(" ") + 1) || "A"}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  {userProfile.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  {userProfile.role.split(" ")[0]}
                </div>
              </div>
            </div>

            {/* User Menu Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-scale-up">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800">{userProfile.name}</p>
                  <p className="text-[10px] text-slate-400">{userProfile.email}</p>
                  <span className="inline-block mt-1 text-[9px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                    {userProfile.role}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowProfile(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hồ sơ cá nhân</span>
                </button>

                <Link
                  href="/settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cài đặt hệ thống</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfile(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Detail & Security Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {userProfile.name.charAt(userProfile.name.lastIndexOf(" ") + 1) || "A"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Hồ sơ tài khoản cá nhân
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Quản lý thông tin cá nhân và bảo mật tài khoản
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tabs */}
            <div className="flex items-center gap-3 border-b border-slate-200 mb-4">
              <button
                onClick={() => setActiveProfileTab("INFO")}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                  activeProfileTab === "INFO"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Thông tin chung
              </button>
              <button
                onClick={() => setActiveProfileTab("SECURITY")}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                  activeProfileTab === "SECURITY"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Đổi mật khẩu & An toàn
              </button>
            </div>

            {activeProfileTab === "INFO" ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.name}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email đăng nhập
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={editProfileForm.email}
                      className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="text"
                      required
                      value={editProfileForm.phone}
                      onChange={(e) =>
                        setEditProfileForm({ ...editProfileForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn vị tổ chức
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={userProfile.organization}
                    className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phòng ban trực thuộc
                  </label>
                  <input
                    type="text"
                    value={editProfileForm.department}
                    onChange={(e) =>
                      setEditProfileForm({
                        ...editProfileForm,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu mới (Tối thiểu 8 ký tự) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Xác nhận lại mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cập nhật mật khẩu</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Xác nhận đăng xuất?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Bạn có chắc chắn muốn thoát khỏi phiên làm việc hiện tại trên tài khoản{" "}
              <b>{userProfile.email}</b>?
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-1/2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowLogoutModal(false);
                }}
                className="w-1/2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relogin Floating Banner if Logged Out */}
      {!isLoggedIn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Lock className="w-8 h-8 stroke-[2]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Phiên làm việc đã kết thúc
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Bạn đã đăng xuất khỏi hệ thống BizPro+ an toàn. Nhấp bên dưới để đăng nhập lại bằng tài khoản Quản trị viên demo.
            </p>

            <button
              onClick={() => login()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              Đăng nhập lại với tư cách Quản trị viên (Nguyễn Văn A)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
