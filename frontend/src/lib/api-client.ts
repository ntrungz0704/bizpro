import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:4000/api';
};

const API_BASE_URL = getApiBaseUrl();

let inMemoryToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAccessToken = (token: string | null) => {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('bizpro_access_token', token);
    } else {
      localStorage.removeItem('bizpro_access_token');
    }
  }
};

export const getAccessToken = (): string | null => {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bizpro_access_token');
    if (saved) {
      inMemoryToken = saved;
      return saved;
    }
  }
  return null;
};

export const ensureAuthToken = async (): Promise<string | null> => {
  return getAccessToken();
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly refreshToken cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.url?.includes('/auth/login')) {
      let token = getAccessToken();
      if (!token && typeof window !== 'undefined') {
        token = await ensureAuthToken();
      }
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: 401 Auto Silent Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried and not on auth endpoints
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try refresh token via HTTP-only cookie
        let newAccessToken: string | null = null;
        try {
          const refreshRes = await axios.post(
            `${API_BASE_URL}/auth/refresh/web`,
            {},
            { withCredentials: true },
          );
          newAccessToken = refreshRes.data?.data?.accessToken || refreshRes.data?.accessToken;
        } catch {
          newAccessToken = null;
        }

        if (newAccessToken) {
          setAccessToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        setAccessToken(null);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/* =========================================================================
   AUTH API SERVICES
   ========================================================================= */
export const authApi = {
  async login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    const payload = res.data?.data || res.data;
    if (payload?.accessToken) {
      setAccessToken(payload.accessToken);
    }
    return payload;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data?.data || res.data;
  },
};

/* =========================================================================
   ORGANIZATION PROFILE API SERVICES (REAL POSTGRESQL DATA)
   ========================================================================= */
export interface OrgProfileDto {
  name: string;
  code: string;
  taxCode: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  currency?: 'VND' | 'USD' | 'EUR';
  timezone?: string;
}

export const organizationApi = {
  async getCurrent() {
    const res = await apiClient.get('/organization/current');
    return res.data?.data || res.data;
  },

  async updateCurrent(dto: OrgProfileDto) {
    const res = await apiClient.patch('/organization/current', dto);
    return res.data?.data || res.data;
  },

  async resetCurrent() {
    const res = await apiClient.post('/organization/reset');
    return res.data?.data || res.data;
  },

  async getAuditLogs() {
    const res = await apiClient.get('/organization/audit-logs');
    return res.data?.data || res.data;
  },
};

/* =========================================================================
   PHASE 2B: RBAC API SERVICES
   ========================================================================= */
export interface RoleDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  rolePermissions?: Array<{ permission: { code: string; name: string; module: string } }>;
}

export interface PermissionDto {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export const rbacApi = {
  async getRoles(): Promise<RoleDto[]> {
    const res = await apiClient.get('/rbac/roles');
    return res.data?.data || res.data;
  },

  async createRole(data: { code: string; name: string; description?: string }) {
    const res = await apiClient.post('/rbac/roles', data);
    return res.data?.data || res.data;
  },

  async updateRole(id: string, data: { name?: string; description?: string }) {
    const res = await apiClient.patch(`/rbac/roles/${id}`, data);
    return res.data?.data || res.data;
  },

  async getPermissions(): Promise<PermissionDto[]> {
    const res = await apiClient.get('/rbac/permissions');
    return res.data?.data || res.data;
  },

  async updateRolePermissions(roleId: string, permissionCodes: string[]) {
    const res = await apiClient.put(`/rbac/roles/${roleId}/permissions`, { permissionCodes });
    return res.data?.data || res.data;
  },

  async assignUserRoles(userId: string, roleIds: string[]) {
    const res = await apiClient.post(`/rbac/users/${userId}/roles`, { roleIds });
    return res.data?.data || res.data;
  },
};

/* =========================================================================
   PHASE 2B: USER MANAGEMENT API SERVICES
   ========================================================================= */
export interface UserItemDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  departmentId?: string;
  createdAt: string;
  userRoles?: Array<{ role: { id: string; code: string; name: string } }>;
  department?: { id: string; code: string; name: string };
}

export const userApi = {
  async getUsers(params?: { search?: string; departmentId?: string; roleId?: string; isActive?: boolean }) {
    const res = await apiClient.get('/users', { params });
    return res.data?.data || res.data;
  },

  async getUserById(id: string): Promise<UserItemDto> {
    const res = await apiClient.get(`/users/${id}`);
    return res.data?.data || res.data;
  },

  async createUser(data: { email: string; password?: string; fullName: string; phoneNumber?: string; departmentId?: string; roleIds?: string[] }) {
    const res = await apiClient.post('/users', data);
    return res.data?.data || res.data;
  },

  async updateUser(id: string, data: { fullName?: string; phoneNumber?: string; departmentId?: string; roleIds?: string[] }) {
    const res = await apiClient.patch(`/users/${id}`, data);
    return res.data?.data || res.data;
  },

  async setUserStatus(id: string, isActive: boolean) {
    const res = await apiClient.patch(`/users/${id}/status`, { isActive });
    return res.data?.data || res.data;
  },
};

/* =========================================================================
   PHASE 2B: DEPARTMENT API SERVICES
   ========================================================================= */
export interface DepartmentDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  _count?: { users: number; children: number };
}

export const departmentApi = {
  async getDepartments(): Promise<DepartmentDto[]> {
    const res = await apiClient.get('/departments');
    return res.data?.data || res.data;
  },

  async createDepartment(data: { code: string; name: string; description?: string; parentId?: string }) {
    const res = await apiClient.post('/departments', data);
    return res.data?.data || res.data;
  },

  async updateDepartment(id: string, data: { name?: string; description?: string; parentId?: string; isActive?: boolean }) {
    const res = await apiClient.patch(`/departments/${id}`, data);
    return res.data?.data || res.data;
  },
};

/* =========================================================================
   PHASE 2D: CRM API SERVICES
   ========================================================================= */
export interface LeadDto {
  id: string;
  contactName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  source?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  assignedTo?: string;
  assignee?: { id: string; fullName: string; email: string };
  createdAt: string;
}

export interface CustomerDto {
  id: string;
  customerCode: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  name: string;
  email?: string;
  phone?: string;
  taxCode?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  _count?: { deals: number };
}

export interface DealDto {
  id: string;
  title: string;
  amount: number | string;
  currency: string;
  status: 'OPEN' | 'WON' | 'LOST';
  pipelineId: string;
  stageId: string;
  customerId?: string;
  customer?: { id: string; name: string };
  stage?: { id: string; name: string; code: string; isWon: boolean; isLost: boolean };
  assignee?: { id: string; fullName: string };
  expectedCloseDate?: string;
  createdAt: string;
}

export interface PipelineStageDto {
  id: string;
  name: string;
  code: string;
  position: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

export interface PipelineDto {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  stages: PipelineStageDto[];
}

export const crmApi = {
  // Leads
  async getLeads(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/crm/leads', { params });
    return res.data?.data || res.data;
  },
  async createLead(data: any) {
    const res = await apiClient.post('/crm/leads', data);
    return res.data?.data || res.data;
  },
  async updateLead(id: string, data: any) {
    const res = await apiClient.patch(`/crm/leads/${id}`, data);
    return res.data?.data || res.data;
  },
  async convertLead(id: string, data?: { dealTitle?: string; dealAmount?: number }) {
    const res = await apiClient.post(`/crm/leads/${id}/convert`, data || {});
    return res.data?.data || res.data;
  },
  // Customers
  async getCustomers(params?: { search?: string; type?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/crm/customers', { params });
    return res.data?.data || res.data;
  },
  async createCustomer(data: any) {
    const res = await apiClient.post('/crm/customers', data);
    return res.data?.data || res.data;
  },
  async updateCustomer(id: string, data: any) {
    const res = await apiClient.patch(`/crm/customers/${id}`, data);
    return res.data?.data || res.data;
  },
  // Deals
  async getDeals(params?: { stageId?: string; search?: string }) {
    const res = await apiClient.get('/crm/deals', { params });
    return res.data?.data || res.data;
  },
  async createDeal(data: any) {
    const res = await apiClient.post('/crm/deals', data);
    return res.data?.data || res.data;
  },
  async updateDealStage(id: string, stageId: string, lostReason?: string) {
    const res = await apiClient.patch(`/crm/deals/${id}/stage`, { stageId, lostReason });
    return res.data?.data || res.data;
  },
  // Pipelines
  async getPipelines(): Promise<PipelineDto[]> {
    const res = await apiClient.get('/crm/pipelines');
    return res.data?.data || res.data;
  },
  // Dashboard
  async getDashboardMetrics() {
    const res = await apiClient.get('/crm/dashboard');
    return res.data?.data || res.data;
  },
};

export const inventoryApi = {
  async getProducts() {
    const res = await apiClient.get('/inventory/products');
    return res.data?.data || res.data;
  },
  async getWarehouses() {
    const res = await apiClient.get('/inventory/warehouses');
    return res.data?.data || res.data;
  },
};

export const salesApi = {
  async getDashboard() {
    const res = await apiClient.get('/sales/dashboard');
    return res.data?.data || res.data;
  },
  async getOrders(params?: { search?: string; status?: string; customerId?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/sales/orders', { params });
    return res.data?.data || res.data;
  },
  async getOrderById(id: string) {
    const res = await apiClient.get(`/sales/orders/${id}`);
    return res.data?.data || res.data;
  },
  async createOrder(data: any) {
    const res = await apiClient.post('/sales/orders', data);
    return res.data?.data || res.data;
  },
  async updateOrder(id: string, data: any) {
    const res = await apiClient.patch(`/sales/orders/${id}`, data);
    return res.data?.data || res.data;
  },
  async confirmOrder(id: string, data?: { note?: string }) {
    const res = await apiClient.post(`/sales/orders/${id}/confirm`, data || {});
    return res.data?.data || res.data;
  },
  async processOrder(id: string) {
    const res = await apiClient.post(`/sales/orders/${id}/process`, {});
    return res.data?.data || res.data;
  },
  async warehouseAckCancel(id: string, data?: { note?: string }) {
    const res = await apiClient.post(`/sales/orders/${id}/warehouse-ack-cancel`, data || {});
    return res.data?.data || res.data;
  },
  async cancelOrder(id: string, reason: string) {
    const res = await apiClient.post(`/sales/orders/${id}/cancel`, { reason });
    return res.data?.data || res.data;
  },
  async fulfillOrder(id: string, data?: { carrierName?: string; trackingNumber?: string; note?: string; items?: any[] }) {
    const res = await apiClient.post(`/sales/orders/${id}/fulfill`, data || {});
    return res.data?.data || res.data;
  },
  async deliverOrder(id: string) {
    const res = await apiClient.post(`/sales/orders/${id}/deliver`, {});
    return res.data?.data || res.data;
  },
  async getFulfillments(orderId?: string) {
    const res = await apiClient.get('/sales/fulfillments', { params: { orderId } });
    return res.data?.data || res.data;
  },
};

export const hrmApi = {
  async getDepartments() {
    const res = await apiClient.get('/hrm/departments');
    return res.data?.data || res.data;
  },
  async createDepartment(data: any) {
    const res = await apiClient.post('/hrm/departments', data);
    return res.data?.data || res.data;
  },
  async getPositions() {
    const res = await apiClient.get('/hrm/positions');
    return res.data?.data || res.data;
  },
  async createPosition(data: any) {
    const res = await apiClient.post('/hrm/positions', data);
    return res.data?.data || res.data;
  },
  async getEmployees(params?: any) {
    const res = await apiClient.get('/hrm/employees', { params });
    return res.data?.data || res.data;
  },
  async getEmployeeById(id: string) {
    const res = await apiClient.get(`/hrm/employees/${id}`);
    return res.data?.data || res.data;
  },
  async createEmployee(data: any) {
    const res = await apiClient.post('/hrm/employees', data);
    return res.data?.data || res.data;
  },
  async updateEmployee(id: string, data: any) {
    const res = await apiClient.patch(`/hrm/employees/${id}`, data);
    return res.data?.data || res.data;
  },
  async getAttendance(params?: any) {
    const res = await apiClient.get('/hrm/attendance', { params });
    return res.data?.data || res.data;
  },
  async checkIn(data?: any) {
    const res = await apiClient.post('/hrm/attendance/check-in', data || {});
    return res.data?.data || res.data;
  },
  async checkOut(data?: any) {
    const res = await apiClient.post('/hrm/attendance/check-out', data || {});
    return res.data?.data || res.data;
  },
  async adjustAttendance(id: string, data: any) {
    const res = await apiClient.post(`/hrm/attendance/${id}/adjust`, data);
    return res.data?.data || res.data;
  },
  async getLeaveTypes() {
    const res = await apiClient.get('/hrm/leave/types');
    return res.data?.data || res.data;
  },
  async getMyLeaveBalances(year?: number) {
    const res = await apiClient.get('/hrm/leave/balances/my', { params: { year } });
    return res.data?.data || res.data;
  },
  async getLeaveRequests(params?: any) {
    const res = await apiClient.get('/hrm/leave/requests', { params });
    return res.data?.data || res.data;
  },
  async createLeaveRequest(data: any) {
    const res = await apiClient.post('/hrm/leave/requests', data);
    return res.data?.data || res.data;
  },
  async approveLeaveRequest(id: string, data?: any) {
    const res = await apiClient.post(`/hrm/leave/requests/${id}/approve`, data || {});
    return res.data?.data || res.data;
  },
  async rejectLeaveRequest(id: string, reason: string) {
    const res = await apiClient.post(`/hrm/leave/requests/${id}/reject`, { rejectionReason: reason });
    return res.data?.data || res.data;
  },
  async cancelLeaveRequest(id: string) {
    const res = await apiClient.post(`/hrm/leave/requests/${id}/cancel`, {});
    return res.data?.data || res.data;
  },
};

/* =========================================================================
   REPORTS & CROSS-MODULE ANALYTICS API SERVICES (REAL POSTGRESQL DATA)
   ========================================================================= */
export const reportsApi = {
  async getDashboardOverview() {
    const res = await apiClient.get('/reports/dashboard');
    return res.data?.data || res.data;
  },
};


