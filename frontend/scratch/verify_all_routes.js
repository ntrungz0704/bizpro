const http = require("http");

const routes = [
  "/",
  "/features",
  "/features/crm",
  "/features/inventory",
  "/features/sales-order",
  "/features/hrm",
  "/solutions",
  "/pricing",
  "/customers",
  "/about",
  "/demo",
  "/contact",
  "/faq",
  "/resources",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/forgot-password",
  "/onboarding",
  "/dashboard",
  "/crm/leads",
  "/crm/deals",
  "/crm/customers",
  "/inventory/products",
  "/inventory/receipts-issues",
  "/inventory/stocktakes",
  "/sales/orders",
  "/sales/customers",
  "/hrm/employees",
  "/hrm/attendance",
  "/hrm/leave",
  "/reports",
  "/billing",
  "/settings",
  "/admin",
  "/admin/plans",
  "/admin/system",
  "/admin/tenants"
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        resolve({ route, status: res.statusCode, length: data.length });
      });
    }).on("error", (err) => {
      resolve({ route, status: "ERR", error: err.message });
    });
  });
}

async function run() {
  console.log(`Checking all ${routes.length} routes...`);
  const results = [];
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`[${res.status}] ${res.route} (${res.length || 0} bytes)`);
    results.push(res);
  }
  const failed = results.filter(r => r.status !== 200);
  console.log(`\nDone. 200 OK: ${results.length - failed.length}/${results.length}`);
  if (failed.length > 0) {
    console.log("Failed routes:", failed);
  }
}

run();
