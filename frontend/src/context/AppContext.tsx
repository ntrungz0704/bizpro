"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  type: "Cá nhân" | "Doanh nghiệp";
  address: string;
  totalSpent: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface Lead {
  id: string;
  contactName: string;
  companyName: string;
  phone: string;
  email: string;
  source: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "UNQUALIFIED";
  assignedTo: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  customerName: string;
  amount: number;
  stage: "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  expectedClose: string;
  assignedTo: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  costPrice: number;
  sellingPrice: number;
  onHand: number;
  reserved: number;
  minStock: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface SalesOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesOrder {
  id: string;
  code: string;
  customerName: string;
  customerId: string;
  orderDate: string;
  status: "DRAFT" | "CONFIRMED" | "PARTIALLY_FULFILLED" | "FULFILLED" | "CANCELLED";
  totalAmount: number;
  items: SalesOrderItem[];
  note?: string;
}

export interface StockReceipt {
  id: string;
  code: string;
  supplier: string;
  warehouse: string;
  date: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  totalAmount: number;
  items: { productId: string; productName: string; quantity: number; cost: number }[];
}

export interface StockIssue {
  id: string;
  code: string;
  orderCode?: string;
  warehouse: string;
  date: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  items: { productId: string; productName: string; quantity: number }[];
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: "OFFICIAL" | "PROBATION" | "RESIGNED";
  hireDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "PRESENT" | "LATE" | "ABSENT";
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: "ORDER" | "EMPLOYEE" | "INVENTORY" | "LEAVE" | "CRM";
  href: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id">) => void;
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  convertLead: (leadId: string) => void;
  deals: Deal[];
  addDeal: (deal: Omit<Deal, "id">) => void;
  moveDealStage: (dealId: string, newStage: Deal["stage"]) => void;
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "reserved">) => void;
  salesOrders: SalesOrder[];
  createSalesOrder: (order: Omit<SalesOrder, "id">) => void;
  confirmSalesOrder: (orderId: string) => void;
  fulfillSalesOrder: (orderId: string) => void;
  cancelSalesOrder: (orderId: string) => void;
  stockReceipts: StockReceipt[];
  postStockReceipt: (receiptId: string) => void;
  addStockReceipt: (receipt: Omit<StockReceipt, "id">) => void;
  stockIssues: StockIssue[];
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, "id">) => void;
  attendance: AttendanceRecord[];
  checkIn: (employeeName: string) => void;
  checkOut: (employeeName: string) => void;
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (req: Omit<LeaveRequest, "id" | "status">) => void;
  approveLeaveRequest: (reqId: string) => void;
  rejectLeaveRequest: (reqId: string) => void;
  activities: ActivityItem[];
  toasts: ToastMessage[];
  showToast: (title: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initial Customers
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "c1",
      code: "KH-0001",
      name: "Công ty Cổ phần Công nghệ ABC",
      phone: "0901234567",
      email: "contact@abc-tech.vn",
      type: "Doanh nghiệp",
      address: "123 Cầu Giấy, Hà Nội",
      totalSpent: 420000000,
      status: "ACTIVE",
    },
    {
      id: "c2",
      code: "KH-0002",
      name: "Nguyễn Văn Hùng",
      phone: "0987654321",
      email: "hung.nv@gmail.com",
      type: "Cá nhân",
      address: "45 Lê Lợi, Quận 1, TP.HCM",
      totalSpent: 128200000,
      status: "ACTIVE",
    },
    {
      id: "c3",
      code: "KH-0003",
      name: "Tập đoàn Đầu tư & Thương mại Đại Phát",
      phone: "0243888999",
      email: "info@daiphatgroup.vn",
      type: "Doanh nghiệp",
      address: "88 Trần Duy Hưng, Hà Nội",
      totalSpent: 850000000,
      status: "ACTIVE",
    },
  ]);

  // Initial Leads
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "l1",
      contactName: "Phạm Minh Tuấn",
      companyName: "Công ty TNHH Tuấn Minh",
      phone: "0912334455",
      email: "tuan.pm@tuanminh.com",
      source: "Google Ads",
      status: "NEW",
      assignedTo: "Trần Văn Sales",
      createdAt: "2026-11-04",
    },
    {
      id: "l2",
      contactName: "Lê Hoàng Yến",
      companyName: "Startup FastFin",
      phone: "0934556677",
      email: "yen.le@fastfin.io",
      source: "Facebook",
      status: "CONTACTED",
      assignedTo: "Nguyễn Thị Kinh Doanh",
      createdAt: "2026-11-03",
    },
    {
      id: "l3",
      contactName: "Trần Quốc Bảo",
      companyName: "Chuỗi Nhà Thuốc An Tâm",
      phone: "0944778899",
      email: "bao.tq@antam.vn",
      source: "Giới thiệu",
      status: "QUALIFIED",
      assignedTo: "Trần Văn Sales",
      createdAt: "2026-11-01",
    },
  ]);

  // Initial Deals
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: "d1",
      title: "Cung cấp 30 bộ Laptop Dell cho phòng lập trình",
      customerName: "Công ty Cổ phần Công nghệ ABC",
      amount: 450000000,
      stage: "Negotiation",
      expectedClose: "2026-11-15",
      assignedTo: "Trần Văn Sales",
    },
    {
      id: "d2",
      title: "Gói trang thiết bị văn phòng Akko + Logitech",
      customerName: "Tập đoàn Đại Phát",
      amount: 180000000,
      stage: "Proposal",
      expectedClose: "2026-11-20",
      assignedTo: "Nguyễn Thị Kinh Doanh",
    },
    {
      id: "d3",
      title: "Hợp đồng thiết bị phụ kiện máy tính đợt 2",
      customerName: "Nguyễn Văn Hùng",
      amount: 45000000,
      stage: "Won",
      expectedClose: "2026-11-02",
      assignedTo: "Trần Văn Sales",
    },
    {
      id: "d4",
      title: "Dự án chuyển đổi máy trạm chi nhánh Hải Phòng",
      customerName: "Công ty Cổ phần Công nghệ ABC",
      amount: 320000000,
      stage: "Contacted",
      expectedClose: "2026-11-30",
      assignedTo: "Trần Văn Sales",
    },
    {
      id: "d5",
      title: "Gói bảo trì phần mềm và thiết bị định kỳ",
      customerName: "Nguyễn Văn Hùng",
      amount: 25000000,
      stage: "New",
      expectedClose: "2026-12-05",
      assignedTo: "Trần Văn Sales",
    },
  ]);

  // Initial Products
  const [products, setProducts] = useState<Product[]>([
    {
      id: "p1",
      sku: "DELL-XPS-13",
      name: "Laptop Dell XPS 13 9320 Core i7",
      category: "Laptop",
      uom: "Cái",
      costPrice: 22000000,
      sellingPrice: 28500000,
      onHand: 15,
      reserved: 10,
      minStock: 10,
      status: "ACTIVE",
    },
    {
      id: "p2",
      sku: "LOGI-MX3",
      name: "Chuột không dây Logitech MX Master 3S",
      category: "Phụ kiện",
      uom: "Cái",
      costPrice: 1500000,
      sellingPrice: 2190000,
      onHand: 24,
      reserved: 12,
      minStock: 20,
      status: "ACTIVE",
    },
    {
      id: "p3",
      sku: "AKKO-3087",
      name: "Bàn phím cơ Akko 3087 v2 Silent",
      category: "Bàn phím",
      uom: "Cái",
      costPrice: 900000,
      sellingPrice: 1390000,
      onHand: 18,
      reserved: 10,
      minStock: 15,
      status: "ACTIVE",
    },
    {
      id: "p4",
      sku: "MON-DELL-27",
      name: "Màn hình Dell Ultrasharp U2723QE 4K",
      category: "Màn hình",
      uom: "Cái",
      costPrice: 9800000,
      sellingPrice: 13500000,
      onHand: 35,
      reserved: 5,
      minStock: 8,
      status: "ACTIVE",
    },
  ]);

  // Initial Sales Orders
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([
    {
      id: "so1",
      code: "SO-2026-0042",
      customerId: "c1",
      customerName: "Công ty Cổ phần Công nghệ ABC",
      orderDate: "2026-11-04",
      status: "CONFIRMED",
      totalAmount: 285000000,
      items: [
        {
          productId: "p1",
          productName: "Laptop Dell XPS 13 9320 Core i7",
          sku: "DELL-XPS-13",
          quantity: 10,
          unitPrice: 28500000,
          lineTotal: 285000000,
        },
      ],
      note: "Đã giữ hàng tại Kho Hà Nội, chờ xuất kho.",
    },
    {
      id: "so2",
      code: "SO-2026-0041",
      customerId: "c2",
      customerName: "Nguyễn Văn Hùng",
      orderDate: "2026-11-03",
      status: "FULFILLED",
      totalAmount: 45780000,
      items: [
        {
          productId: "p2",
          productName: "Chuột không dây Logitech MX Master 3S",
          sku: "LOGI-MX3",
          quantity: 12,
          unitPrice: 2190000,
          lineTotal: 26280000,
        },
        {
          productId: "p3",
          productName: "Bàn phím cơ Akko 3087 v2 Silent",
          sku: "AKKO-3087",
          quantity: 14,
          unitPrice: 1390000,
          lineTotal: 19500000,
        },
      ],
      note: "Đã giao hàng và thanh toán đủ.",
    },
    {
      id: "so3",
      code: "SO-2026-0040",
      customerId: "c3",
      customerName: "Tập đoàn Đầu tư & Thương mại Đại Phát",
      orderDate: "2026-11-02",
      status: "DRAFT",
      totalAmount: 67500000,
      items: [
        {
          productId: "p4",
          productName: "Màn hình Dell Ultrasharp U2723QE 4K",
          sku: "MON-DELL-27",
          quantity: 5,
          unitPrice: 13500000,
          lineTotal: 67500000,
        },
      ],
      note: "Báo giá chờ khách hàng duyệt ngân sách.",
    },
  ]);

  // Initial Stock Receipts
  const [stockReceipts, setStockReceipts] = useState<StockReceipt[]>([
    {
      id: "sr1",
      code: "NK-2026-0234",
      supplier: "Công ty Phân Phối Thiết Bị XYZ",
      warehouse: "Kho Tổng Hà Nội",
      date: "2026-11-04",
      status: "POSTED",
      totalAmount: 320000000,
      items: [
        {
          productId: "p1",
          productName: "Laptop Dell XPS 13 9320 Core i7",
          quantity: 10,
          cost: 22000000,
        },
      ],
    },
  ]);

  // Initial Stock Issues
  const [stockIssues, setStockIssues] = useState<StockIssue[]>([
    {
      id: "si1",
      code: "XK-2026-0112",
      orderCode: "SO-2026-0041",
      warehouse: "Kho Tổng Hà Nội",
      date: "2026-11-03",
      status: "POSTED",
      items: [
        {
          productId: "p2",
          productName: "Chuột không dây Logitech MX Master 3S",
          quantity: 12,
        },
      ],
    },
  ]);

  // Initial Employees
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "e1",
      code: "NV-001",
      name: "Nguyễn Văn A",
      department: "Ban Giám Đốc",
      position: "Tổng Giám Đốc",
      email: "ceo@bizpro.vn",
      phone: "0909000111",
      status: "OFFICIAL",
      hireDate: "2023-01-15",
    },
    {
      id: "e2",
      code: "NV-002",
      name: "Trần Thị Bích",
      department: "Phòng Nhân Sự",
      position: "Chuyên viên Tuyển dụng",
      email: "bich.tt@bizpro.vn",
      phone: "0909222333",
      status: "OFFICIAL",
      hireDate: "2026-11-01",
    },
    {
      id: "e3",
      code: "NV-003",
      name: "Nguyễn Văn B",
      department: "Phòng Kho Vận",
      position: "Thủ Kho Trưởng",
      email: "kho@bizpro.vn",
      phone: "0909444555",
      status: "OFFICIAL",
      hireDate: "2024-05-10",
    },
  ]);

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    {
      id: "att1",
      employeeCode: "NV-001",
      employeeName: "Nguyễn Văn A",
      date: "2026-11-04",
      checkIn: "08:15:20",
      status: "PRESENT",
    },
    {
      id: "att2",
      employeeCode: "NV-002",
      employeeName: "Trần Thị Bích",
      date: "2026-11-04",
      checkIn: "08:28:45",
      status: "PRESENT",
    },
  ]);

  // Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: "lr1",
      employeeName: "Nguyễn Văn B",
      leaveType: "Nghỉ phép năm",
      startDate: "2026-11-06",
      endDate: "2026-11-07",
      days: 2,
      reason: "Giải quyết việc cá nhân gia đình",
      status: "PENDING",
    },
  ]);

  // Dynamic Recent Activities Feed
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "act1",
      title: "Đơn hàng #SO-2026-0042",
      detail: "Khách hàng: Công ty Cổ phần Công nghệ ABC",
      time: "2 phút trước",
      type: "ORDER",
      href: "/sales/orders",
    },
    {
      id: "act2",
      title: "Nhân viên mới",
      detail: "Trần Thị Bích được thêm vào phòng nhân sự",
      time: "5 phút trước",
      type: "EMPLOYEE",
      href: "/hrm/employees",
    },
    {
      id: "act3",
      title: "Nhập kho #NK-2026-0234",
      detail: "Từ nhà cung cấp: Công ty XYZ",
      time: "10 phút trước",
      type: "INVENTORY",
      href: "/inventory/receipts-issues",
    },
    {
      id: "act4",
      title: "Đơn nghỉ phép",
      detail: "Nguyễn Văn B - 2 ngày",
      time: "15 phút trước",
      type: "LEAVE",
      href: "/hrm/leave",
    },
  ]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addActivity = (item: Omit<ActivityItem, "id" | "time">) => {
    const newAct: ActivityItem = {
      ...item,
      id: `act_${Date.now()}`,
      time: "Vừa xong",
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 7)]);
  };

  // Logic Functions
  const addCustomer = (cust: Omit<Customer, "id">) => {
    const newCust: Customer = {
      ...cust,
      id: `c_${Date.now()}`,
    };
    setCustomers((prev) => [newCust, ...prev]);
    addActivity({
      title: `Khách hàng mới: ${cust.name}`,
      detail: `Phân loại: ${cust.type} - SĐT: ${cust.phone}`,
      type: "CRM",
      href: "/crm/customers",
    });
    showToast(`Đã thêm khách hàng "${cust.name}" thành công!`);
  };

  const addLead = (lead: Omit<Lead, "id" | "createdAt">) => {
    const newLead: Lead = {
      ...lead,
      id: `l_${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLeads((prev) => [newLead, ...prev]);
    showToast(`Đã thêm Lead "${lead.contactName}"!`);
  };

  const convertLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const existing = customers.find(
      (c) => c.phone === lead.phone || c.email === lead.email
    );
    if (existing) {
      showToast(
        `Số điện thoại/email của Lead đã tồn tại ở khách hàng "${existing.name}"!`,
        "error"
      );
      return;
    }

    const newCust: Customer = {
      id: `c_${Date.now()}`,
      code: `KH-${Math.floor(1000 + Math.random() * 9000)}`,
      name: lead.companyName || lead.contactName,
      phone: lead.phone,
      email: lead.email,
      type: lead.companyName ? "Doanh nghiệp" : "Cá nhân",
      address: "Chưa cập nhật",
      totalSpent: 0,
      status: "ACTIVE",
    };
    setCustomers((prev) => [newCust, ...prev]);

    const newDeal: Deal = {
      id: `d_${Date.now()}`,
      title: `Cơ hội từ Lead: ${lead.contactName}`,
      customerName: newCust.name,
      amount: 50000000,
      stage: "New",
      expectedClose: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      assignedTo: lead.assignedTo,
    };
    setDeals((prev) => [newDeal, ...prev]);

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: "CONVERTED" } : l))
    );

    addActivity({
      title: `Chuyển đổi Lead thành công`,
      detail: `Khách hàng mới: ${newCust.name}`,
      type: "CRM",
      href: "/crm/customers",
    });

    showToast(
      `Đã chuyển đổi Lead "${lead.contactName}" thành Khách hàng & tạo Deal thành công!`
    );
  };

  const addDeal = (deal: Omit<Deal, "id">) => {
    const newDeal: Deal = {
      ...deal,
      id: `d_${Date.now()}`,
    };
    setDeals((prev) => [newDeal, ...prev]);
    showToast(`Đã thêm cơ hội kinh doanh "${deal.title}"!`);
  };

  const moveDealStage = (dealId: string, newStage: Deal["stage"]) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );
    showToast(`Đã chuyển cơ hội sang bước "${newStage}"!`, "info");
  };

  const addProduct = (p: Omit<Product, "id" | "reserved">) => {
    const newProd: Product = {
      ...p,
      id: `p_${Date.now()}`,
      reserved: 0,
    };
    setProducts((prev) => [newProd, ...prev]);
    addActivity({
      title: `Sản phẩm mới vào kho`,
      detail: `${p.name} (SKU: ${p.sku}) - Tồn ban đầu: ${p.onHand}`,
      type: "INVENTORY",
      href: "/inventory/products",
    });
    showToast(`Đã thêm sản phẩm "${p.name}" vào kho!`);
  };

  const createSalesOrder = (ord: Omit<SalesOrder, "id">) => {
    const newOrder: SalesOrder = {
      ...ord,
      id: `so_${Date.now()}`,
    };
    setSalesOrders((prev) => [newOrder, ...prev]);
    addActivity({
      title: `Đơn bán hàng mới: #${ord.code}`,
      detail: `Khách hàng: ${ord.customerName}`,
      type: "ORDER",
      href: "/sales/orders",
    });
    showToast(`Đã tạo đơn hàng "${ord.code}" ở trạng thái Nháp!`);
  };

  const confirmSalesOrder = (orderId: string) => {
    const order = salesOrders.find((o) => o.id === orderId);
    if (!order) return;
    if (order.status !== "DRAFT") {
      showToast("Chỉ có thể xác nhận đơn hàng đang ở trạng thái Nháp!", "error");
      return;
    }

    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) continue;
      const available = prod.onHand - prod.reserved;
      if (available < item.quantity) {
        showToast(
          `Không thể xác nhận! Sản phẩm "${prod.name}" chỉ còn khả dụng ${available} ${prod.uom} (Đơn yêu cầu: ${item.quantity}).`,
          "error"
        );
        return;
      }
    }

    setProducts((prev) =>
      prev.map((prod) => {
        const item = order.items.find((i) => i.productId === prod.id);
        if (!item) return prod;
        return {
          ...prod,
          reserved: prod.reserved + item.quantity,
        };
      })
    );

    setSalesOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o))
    );

    addActivity({
      title: `Xác nhận & Giữ hàng: #${order.code}`,
      detail: `Đã giữ tồn kho an toàn cho đơn hàng`,
      type: "ORDER",
      href: "/sales/orders",
    });

    showToast(
      `Xác nhận đơn "${order.code}" thành công! Đã tự động giữ hàng an toàn trong kho.`
    );
  };

  const fulfillSalesOrder = (orderId: string) => {
    const order = salesOrders.find((o) => o.id === orderId);
    if (!order) return;
    if (order.status !== "CONFIRMED") {
      showToast("Chỉ có thể xuất kho đơn hàng đã được Xác nhận!", "error");
      return;
    }

    setProducts((prev) =>
      prev.map((prod) => {
        const item = order.items.find((i) => i.productId === prod.id);
        if (!item) return prod;
        return {
          ...prod,
          onHand: Math.max(0, prod.onHand - item.quantity),
          reserved: Math.max(0, prod.reserved - item.quantity),
        };
      })
    );

    const newIssue: StockIssue = {
      id: `si_${Date.now()}`,
      code: `XK-${Math.floor(1000 + Math.random() * 9000)}`,
      orderCode: order.code,
      warehouse: "Kho Tổng Hà Nội",
      date: new Date().toISOString().split("T")[0],
      status: "POSTED",
      items: order.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
      })),
    };
    setStockIssues((prev) => [newIssue, ...prev]);

    setSalesOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "FULFILLED" } : o))
    );

    addActivity({
      title: `Xuất kho thành công: #${order.code}`,
      detail: `Phiếu xuất ${newIssue.code} - Đã giao cho đơn vị vận chuyển`,
      type: "INVENTORY",
      href: "/inventory/receipts-issues",
    });

    showToast(
      `Đã xuất kho thành công cho đơn "${order.code}"! Tồn thực tế đã được trừ ghi sổ.`
    );
  };

  const cancelSalesOrder = (orderId: string) => {
    const order = salesOrders.find((o) => o.id === orderId);
    if (!order) return;

    if (order.status === "FULFILLED") {
      showToast("Đơn hàng đã xuất kho hoàn tất, không thể hủy trực tiếp!", "error");
      return;
    }

    if (order.status === "CONFIRMED") {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = order.items.find((i) => i.productId === prod.id);
          if (!item) return prod;
          return {
            ...prod,
            reserved: Math.max(0, prod.reserved - item.quantity),
          };
        })
      );
    }

    setSalesOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
    );

    showToast(`Đã hủy đơn hàng "${order.code}" & giải phóng toàn bộ hàng đã giữ!`);
  };

  const addStockReceipt = (receipt: Omit<StockReceipt, "id">) => {
    const newReceipt: StockReceipt = {
      ...receipt,
      id: `sr_${Date.now()}`,
    };
    setStockReceipts((prev) => [newReceipt, ...prev]);
    showToast(`Đã lập phiếu nhập kho "${receipt.code}"!`);
  };

  const postStockReceipt = (receiptId: string) => {
    const receipt = stockReceipts.find((r) => r.id === receiptId);
    if (!receipt || receipt.status === "POSTED") return;

    setProducts((prev) =>
      prev.map((prod) => {
        const item = receipt.items.find((i) => i.productId === prod.id);
        if (!item) return prod;
        return {
          ...prod,
          onHand: prod.onHand + item.quantity,
        };
      })
    );

    setStockReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: "POSTED" } : r))
    );

    addActivity({
      title: `Nhập kho ghi sổ: #${receipt.code}`,
      detail: `Từ NCC: ${receipt.supplier}`,
      type: "INVENTORY",
      href: "/inventory/receipts-issues",
    });

    showToast(`Ghi sổ nhập kho "${receipt.code}" thành công! Tồn thực tế đã tăng.`);
  };

  const addEmployee = (emp: Omit<Employee, "id">) => {
    const newEmp: Employee = {
      ...emp,
      id: `e_${Date.now()}`,
    };
    setEmployees((prev) => [newEmp, ...prev]);
    addActivity({
      title: `Nhân viên mới gia nhập`,
      detail: `${emp.name} được thêm vào ${emp.department}`,
      type: "EMPLOYEE",
      href: "/hrm/employees",
    });
    showToast(`Đã tiếp nhận nhân viên mới "${emp.name}"!`);
  };

  const checkIn = (employeeName: string) => {
    const emp = employees.find((e) => e.name === employeeName) || employees[0];
    const today = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("vi-VN");

    const existing = attendance.find(
      (a) => a.employeeName === emp.name && a.date === today
    );
    if (existing) {
      showToast(`Hôm nay bạn đã Check-in lúc ${existing.checkIn} rồi!`, "info");
      return;
    }

    const newAtt: AttendanceRecord = {
      id: `att_${Date.now()}`,
      employeeName: emp.name,
      employeeCode: emp.code,
      date: today,
      checkIn: timeStr,
      status: "PRESENT",
    };
    setAttendance((prev) => [newAtt, ...prev]);
    showToast(`Check-in thành công lúc ${timeStr}! Chúc bạn ngày làm việc hiệu quả.`);
  };

  const checkOut = (employeeName: string) => {
    const emp = employees.find((e) => e.name === employeeName) || employees[0];
    const today = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("vi-VN");

    const existing = attendance.find(
      (a) => a.employeeName === emp.name && a.date === today
    );
    if (!existing) {
      showToast("Bạn chưa Check-in ngày hôm nay!", "error");
      return;
    }

    setAttendance((prev) =>
      prev.map((a) => (a.id === existing.id ? { ...a, checkOut: timeStr } : a))
    );
    showToast(`Check-out thành công lúc ${timeStr}! Hẹn gặp lại bạn.`);
  };

  const addLeaveRequest = (req: Omit<LeaveRequest, "id" | "status">) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `lr_${Date.now()}`,
      status: "PENDING",
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
    addActivity({
      title: `Đơn nghỉ phép mới`,
      detail: `${req.employeeName} - ${req.days} ngày`,
      type: "LEAVE",
      href: "/hrm/leave",
    });
    showToast("Đã gửi đơn xin nghỉ phép! Đang chờ Quản lý phê duyệt.");
  };

  const approveLeaveRequest = (reqId: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "APPROVED" } : r))
    );
    showToast("Đã phê duyệt đơn nghỉ phép!");
  };

  const rejectLeaveRequest = (reqId: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "REJECTED" } : r))
    );
    showToast("Đã từ chối đơn nghỉ phép!", "info");
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        addCustomer,
        leads,
        addLead,
        convertLead,
        deals,
        addDeal,
        moveDealStage,
        products,
        addProduct,
        salesOrders,
        createSalesOrder,
        confirmSalesOrder,
        fulfillSalesOrder,
        cancelSalesOrder,
        stockReceipts,
        addStockReceipt,
        postStockReceipt,
        stockIssues,
        employees,
        addEmployee,
        attendance,
        checkIn,
        checkOut,
        leaveRequests,
        addLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        activities,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}

      {/* Global Toast Floating Notification */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between gap-3 animate-slide-up ${
              toast.type === "success"
                ? "bg-slate-900 text-white border-slate-800 shadow-slate-900/30"
                : toast.type === "error"
                ? "bg-red-600 text-white border-red-500 shadow-red-600/30"
                : "bg-blue-600 text-white border-blue-500 shadow-blue-600/30"
            }`}
          >
            <span>{toast.title}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white font-bold ml-2 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
