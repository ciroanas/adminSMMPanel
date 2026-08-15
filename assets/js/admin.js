/* ==========================================================================
   SMM PANEL — ADMIN JS (universal)
   All admin JavaScript lives in this single file.
   ========================================================================== */

/* =====================================================================
   GLOBAL
   ===================================================================== */
const AdminApp = {};
const $id = (id) => document.getElementById(id);
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function money(n) {
  const v = Math.round(Number(n) || 0);
  return "₹" + v.toLocaleString("en-IN");
}
function moneyDec(n) {
  return "₹" + (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function initials(name) { return (name || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase(); }
function badge(status) {
  const s = String(status || "").toLowerCase().replace(/\s+/g, "");
  return `<span class="badge-status status-${s}">${esc(status)}</span>`;
}
function pick(arr, i) { return arr[i % arr.length]; }

/* =====================================================================
   MOCK DATA
   ===================================================================== */
const MOCK = (() => {
  const firstNames = ["aarav", "diego", "mia", "liam", "sofia", "noah", "aria", "kai", "emma", "raj", "leo", "zoe", "omar", "ivy", "hana", "theo", "nina", "ravi", "ella", "sam", "priya", "jonas", "lucas", "maya"];
  const domains = ["gmail.com", "outlook.com", "yahoo.com", "proton.me", "mail.com"];
  const groups = ["Default", "VIP", "Premium", "Reseller"];
  const uStatus = ["Active", "Active", "Active", "Blocked", "Active"];

  const users = Array.from({ length: 22 }, (_, i) => {
    const name = pick(firstNames, i) + (i > 11 ? "_" + (i) : "");
    return {
      id: 1001 + i,
      username: name,
      email: name.replace(/_/g, ".") + "@" + pick(domains, i),
      balance: [420, 15, 1280, 0, 96, 5400, 210, 33, 780, 12, 2450, 60][i % 12],
      orders: [12, 3, 88, 0, 21, 340, 9, 4, 55, 1, 210, 7][i % 12],
      spent: [1200, 90, 24800, 0, 3100, 98000, 640, 210, 9800, 30, 61000, 480][i % 12],
      group: pick(groups, i),
      status: pick(uStatus, i),
      created: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      lastLogin: `2025-06-${String((i % 27) + 1).padStart(2, "0")} 14:${String(i % 60).padStart(2, "0")}`,
      whatsapp: "+91 9" + (800000000 + i * 137).toString().slice(0, 9),
      telegram: "@" + name,
    };
  });

  const categories = [
    { id: 1, name: "Instagram Followers", icon: "fa-instagram", brand: true },
    { id: 2, name: "Instagram Likes", icon: "fa-instagram", brand: true },
    { id: 3, name: "TikTok Followers", icon: "fa-tiktok", brand: true },
    { id: 4, name: "YouTube Views", icon: "fa-youtube", brand: true },
    { id: 5, name: "YouTube Subscribers", icon: "fa-youtube", brand: true },
    { id: 6, name: "Facebook Page Likes", icon: "fa-facebook", brand: true },
    { id: 7, name: "Twitter / X Followers", icon: "fa-x-twitter", brand: true },
    { id: 8, name: "Telegram Members", icon: "fa-telegram", brand: true },
    { id: 9, name: "Spotify Plays", icon: "fa-spotify", brand: true },
    { id: 10, name: "Website Traffic", icon: "fa-globe", brand: false },
  ];

  const providers = [
    { id: 1, name: "Provider A", url: "https://example-provider-a.test/api", key: "demo_api_key_123", services: 420, balance: 12450.5, status: "Active", sync: "5 min ago" },
    { id: 2, name: "Provider B", url: "https://example-provider-b.test/api", key: "demo_api_key_456", services: 318, balance: 8600.0, status: "Active", sync: "12 min ago" },
    { id: 3, name: "SMM Cloud", url: "https://smm-cloud.test/api/v2", key: "demo_key_cloud_789", services: 610, balance: 24310.75, status: "Active", sync: "1 hr ago" },
    { id: 4, name: "FastPanel API", url: "https://fastpanel.test/api", key: "demo_fast_007", services: 205, balance: 430.2, status: "Disabled", sync: "2 days ago" },
    { id: 5, name: "GrowthHub", url: "https://growthhub.test/api", key: "demo_growth_555", services: 142, balance: 1980.0, status: "Active", sync: "34 min ago" },
  ];

  // service feature templates so services vary
  const featSets = [
    { refill: false, autoRefill: false, cancel: false, nonDrop: true, country: false, autoComplete: true, dripfeed: false, subscription: false, suffix: "Non Drop" },
    { refill: true, autoRefill: true, cancel: false, nonDrop: true, country: false, autoComplete: true, dripfeed: true, subscription: false, suffix: "Refill" },
    { refill: true, autoRefill: true, cancel: false, nonDrop: true, country: false, autoComplete: false, dripfeed: true, subscription: false, suffix: "Auto Refill" },
    { refill: false, autoRefill: false, cancel: true, nonDrop: false, country: false, autoComplete: false, dripfeed: false, subscription: false, suffix: "Drop" },
    { refill: true, autoRefill: false, cancel: false, nonDrop: true, country: true, autoComplete: false, dripfeed: false, subscription: false, suffix: "Country Targeted" },
  ];
  const speeds = ["1-2 Hours", "2-4 Hours", "6-12 Hours", "1-2 Days", "0-1 Hour"];
  let sid = 1;
  const services = [];
  categories.forEach((cat) => {
    const count = cat.id <= 4 ? 5 : cat.id <= 7 ? 4 : 3;
    for (let j = 0; j < count; j++) {
      const f = featSets[j % featSets.length];
      const provRate = 12 + ((sid * 7) % 40);
      const sellRate = provRate + 10 + ((sid * 3) % 22);
      services.push({
        id: 5000 + sid,
        catId: cat.id,
        catName: cat.name,
        name: `${cat.name} - ${f.suffix}`,
        provider: pick(providers, sid).name,
        providerSid: 10000 + sid * 3,
        provRate, sellRate,
        min: [100, 50, 500, 10][j % 4],
        max: [50000, 100000, 25000, 500000][j % 4],
        status: sid % 9 === 0 ? "Disabled" : "Active",
        speed: pick(speeds, sid),
        type: sid % 11 === 0 ? "Package" : (sid % 13 === 0 ? "Subscription" : "Normal"),
        ...f,
        sort: j + 1,
      });
      sid++;
    }
  });
  categories.forEach(c => c.serviceCount = services.filter(s => s.catId === c.id).length);

  const oStatus = ["Completed", "Processing", "Pending", "Partial", "Completed", "Cancelled", "In progress", "Completed"];
  const orders = Array.from({ length: 34 }, (_, i) => {
    const svc = pick(services, i * 3);
    const u = pick(users, i);
    const qty = [1000, 500, 5000, 250, 10000, 2000, 750][i % 7];
    const status = pick(oStatus, i).replace("In progress", "Processing");
    const remains = status === "Completed" ? 0 : Math.round(qty * (0.2 + (i % 5) * 0.12));
    return {
      id: 90000 + i,
      user: u.username,
      service: svc.name,
      catName: svc.catName,
      link: `https://instagram.com/user_${1000 + i}/`,
      charge: (qty / 1000) * svc.sellRate,
      startCount: 1000 + i * 37,
      qty,
      remains,
      status,
      provider: svc.provider,
      providerOid: "P" + (700000 + i * 11),
      created: `2025-06-${String((i % 27) + 1).padStart(2, "0")} 1${i % 9}:0${i % 6}`,
      updated: `2025-06-${String((i % 27) + 1).padStart(2, "0")} 1${(i + 2) % 9}:2${i % 5}`,
      failed: status === "Cancelled" && i % 2 === 0,
    };
  });

  const tasks = Array.from({ length: 12 }, (_, i) => ({
    id: 400 + i,
    type: pick(["Sync Services", "Refill Order", "Auto Complete", "Provider Balance", "Cancel Order", "Update Rates"], i),
    order: i % 3 === 0 ? "—" : "#" + (90000 + i),
    status: pick(["Completed", "Running", "Pending", "Failed", "Completed"], i).replace("Running", "Running"),
    created: `2025-06-${String((i % 27) + 1).padStart(2, "0")} 0${i % 9}:1${i % 5}`,
  }));

  const payMethods = ["UPI", "Razorpay", "PayPal", "Crypto (USDT)", "Bank Transfer", "Stripe"];
  const pStatus = ["Successful", "Pending", "Failed", "Successful", "Successful"];
  const payments = Array.from({ length: 22 }, (_, i) => ({
    id: "TXN" + (55000 + i),
    user: pick(users, i).username,
    amount: [500, 1000, 250, 5000, 100, 2000, 750, 3500][i % 8],
    method: pick(payMethods, i),
    status: pick(pStatus, i),
    date: `2025-06-${String((i % 27) + 1).padStart(2, "0")} 1${i % 9}:${String(i % 60).padStart(2, "0")}`,
  }));

  const tSubjects = ["Order not delivered", "Refill request", "Payment not credited", "Wrong link submitted", "API key issue", "Speed too slow", "Account balance query", "Service disabled?", "Partial order", "Refund request"];
  const tPriority = ["High", "Medium", "Low", "Medium", "High"];
  const tStatus = ["Open", "Pending", "Answered", "Closed", "Open"];
  const tickets = Array.from({ length: 11 }, (_, i) => ({
    id: "TK" + (3000 + i),
    user: pick(users, i).username,
    subject: pick(tSubjects, i),
    priority: pick(tPriority, i),
    status: pick(tStatus, i),
    lastReply: `${(i % 12) + 1}h ago`,
    created: `2025-06-${String((i % 27) + 1).padStart(2, "0")}`,
    thread: [
      { who: "user", text: "Hi, I placed order #" + (90000 + i) + " but I don't see any change yet. Can you check?", time: "10:24 AM" },
      { who: "admin", text: "Hello, thanks for reaching out. Your order is currently processing with the provider. Please allow a few more hours.", time: "10:41 AM" },
      { who: "user", text: "Okay, thank you. I'll wait.", time: "10:45 AM" },
    ],
  }));

  const affiliates = Array.from({ length: 12 }, (_, i) => ({
    user: pick(users, i + 2).username,
    refs: [24, 8, 51, 3, 17, 92, 6, 40][i % 8],
    earnings: [2400, 320, 8900, 60, 1450, 21000, 210, 5600][i % 8],
    status: i % 5 === 0 ? "Disabled" : "Active",
    joined: `2024-${String((i % 12) + 1).padStart(2, "0")}-1${i % 9}`,
  }));

  const childPanels = Array.from({ length: 9 }, (_, i) => ({
    name: pick(["BoostHub", "SocialUp", "ViralKart", "GrowFast", "SMMWave", "PanelPro", "LikeStorm", "FollowX", "TrendLab"], i),
    owner: pick(users, i + 3).username,
    domain: pick(["boosthub", "socialup", "viralkart", "growfast", "smmwave", "panelpro", "likestorm", "followx", "trendlab"], i) + ".panel.test",
    status: i % 4 === 0 ? "Disabled" : "Active",
    orders: [1240, 320, 5600, 90, 780, 210, 3400, 55, 900][i % 9],
    created: `2024-1${i % 3}-0${(i % 9) + 1}`,
  }));

  const notifications = [
    { ic: "ic-blue", icon: "fa-cart-shopping", title: "New Order", text: "Order #90042 placed by raj", time: "2 min ago", unread: true },
    { ic: "ic-green", icon: "fa-indian-rupee-sign", title: "Payment Received", text: "₹5,000 via Razorpay from priya", time: "18 min ago", unread: true },
    { ic: "ic-amber", icon: "fa-ticket", title: "Ticket Reply", text: "New reply on ticket TK3004", time: "40 min ago", unread: true },
    { ic: "ic-red", icon: "fa-triangle-exclamation", title: "Provider Issue", text: "FastPanel API sync failed", time: "1 hr ago", unread: false },
    { ic: "ic-blue", icon: "fa-cart-shopping", title: "New Order", text: "Order #90041 placed by mia", time: "2 hr ago", unread: false },
    { ic: "ic-purple", icon: "fa-user-plus", title: "New User", text: "leo registered a new account", time: "3 hr ago", unread: false },
    { ic: "ic-green", icon: "fa-circle-check", title: "Order Completed", text: "Order #90020 completed", time: "5 hr ago", unread: false },
    { ic: "ic-gray", icon: "fa-gear", title: "System Notification", text: "Nightly service sync finished", time: "8 hr ago", unread: false },
    { ic: "ic-amber", icon: "fa-ticket", title: "Ticket Reply", text: "New reply on ticket TK3001", time: "10 hr ago", unread: false },
    { ic: "ic-green", icon: "fa-indian-rupee-sign", title: "Payment Received", text: "₹1,000 via UPI from noah", time: "12 hr ago", unread: false },
  ];

  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Brazil", "UAE", "Saudi Arabia"];

  return { users, categories, providers, services, orders, tasks, payments, tickets, affiliates, childPanels, notifications, countries, groups };
})();
AdminApp.MOCK = MOCK;

/* =====================================================================
   NAVIGATION / SIDEBAR (layout injection)
   ===================================================================== */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "fa-gauge-high", href: "admin-dashboard.html" },
  { key: "users", label: "Users", icon: "fa-users", href: "admin-users.html" },
  { key: "orders", label: "Orders", icon: "fa-boxes-stacked", href: "admin-orders.html" },
  { key: "tasks", label: "Tasks", icon: "fa-list-check", href: "admin-tasks.html", hideStandalone: true },
  { key: "services", label: "Services", icon: "fa-layer-group", href: "admin-services.html" },
  { key: "categories", label: "Categories", icon: "fa-folder-tree", href: "admin-categories.html" },
  { key: "payments", label: "Payments", icon: "fa-credit-card", href: "admin-payments.html" },
  { key: "tickets", label: "Tickets", icon: "fa-ticket", href: "admin-tickets.html", badge: "5" },
  { key: "reports", label: "Reports", icon: "fa-chart-column", href: "admin-reports.html" },
  { key: "affiliates", label: "Affiliates", icon: "fa-user-group", href: "admin-affiliates.html" },
  { key: "child-panels", label: "Child Panels", icon: "fa-sitemap", href: "admin-child-panels.html" },
  { key: "appearance", label: "Appearance", icon: "fa-palette", href: "admin-appearance.html" },
  { key: "settings", label: "Settings", icon: "fa-gear", href: "admin-settings.html" },
];

function sidebarMarkup(active) {
  const main = ["dashboard", "users", "orders", "tasks", "services", "categories"];
  const link = (n) => `
    <a href="${n.href}" class="sidebar-link ${n.key === active ? "active" : ""}" data-page-key="${n.key}">
      <i class="fa-solid ${n.icon}"></i><span>${n.label}</span>
      ${n.badge ? `<span class="link-badge">${n.badge}</span>` : ""}
    </a>`;
  const section = (title, keys) => `<div class="nav-section-label">${title}</div>` + NAV.filter(n => keys.includes(n.key)).map(link).join("");
  return `
    <div class="sidebar-brand">
      <div class="brand-mark"><i class="fa-solid fa-bolt"></i></div>
      <div class="brand-name">Boost<span>SMM</span></div>
    </div>
    <nav class="sidebar-nav">
      ${section("Overview", ["dashboard"])}
      ${section("Operations", ["users", "orders", "tasks"])}
      ${section("Catalog", ["services", "categories"])}
      ${section("Finance & Support", ["payments", "tickets", "reports"])}
      ${section("Network", ["affiliates", "child-panels"])}
      ${section("Configuration", ["appearance", "settings"])}
    </nav>
    <div class="sidebar-footer">
      <div class="dropdown">
        <a class="sidebar-account" href="#" data-bs-toggle="dropdown" aria-expanded="false">
          <span class="avatar">AD</span>
          <span><span class="acc-name d-block">Admin User</span><span class="acc-role">Super Admin</span></span>
          <i class="fa-solid fa-ellipsis ms-auto" style="color:var(--admin-sidebar-muted)"></i>
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="admin-settings.html"><i class="fa-solid fa-user"></i>Account</a></li>
          <li><a class="dropdown-item" href="admin-settings.html"><i class="fa-solid fa-gear"></i>Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item danger" href="#" data-testid="sidebar-logout"><i class="fa-solid fa-right-from-bracket"></i>Logout</a></li>
        </ul>
      </div>
    </div>`;
}

function navbarMarkup(title, sub) {
  const notifCount = MOCK.notifications.filter(n => n.unread).length;
  const notifItems = MOCK.notifications.map(n => `
    <div class="notif-item ${n.unread ? "unread" : ""}">
      <div class="notif-ic ${n.ic}"><i class="fa-solid ${n.icon}"></i></div>
      <div><div class="n-title">${esc(n.title)}</div><div class="n-text">${esc(n.text)}</div><div class="n-time">${esc(n.time)}</div></div>
    </div>`).join("");
  return `
    <button class="navbar-toggle" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminOffcanvas" aria-label="Open menu" data-testid="mobile-menu-btn">
      <i class="fa-solid fa-bars"></i>
    </button>
    <div class="navbar-title">
      <h1>${esc(title)}</h1>
      <div class="crumb"><i class="fa-solid fa-house" style="font-size:10px"></i> Admin <span class="dot-sep">/</span> ${esc(sub || title)}</div>
    </div>
    <div class="navbar-actions">
      <div class="navbar-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="search" placeholder="Search users, orders, services…" data-testid="global-search" id="globalSearch" aria-label="Global search">
        <div class="dropdown-menu" id="globalSearchResults" style="width:100%;margin-top:6px;"></div>
      </div>
      <div class="dropdown">
        <button class="icon-btn" type="button" data-bs-toggle="dropdown" aria-label="Notifications" data-testid="notif-btn">
          <i class="fa-solid fa-bell"></i>
          ${notifCount ? `<span class="dot" id="notifDot">${notifCount}</span>` : ""}
        </button>
        <div class="dropdown-menu dropdown-menu-end notif-dropdown">
          <div class="notif-head"><strong>Notifications</strong><a href="#" class="btn btn-ghost btn-sm" id="markAllRead" data-testid="mark-all-read">Mark all read</a></div>
          <div class="notif-list">${notifItems}</div>
        </div>
      </div>
      <button class="icon-btn" type="button" id="themeToggle" aria-label="Toggle dark mode" data-testid="theme-toggle">
        <i class="fa-solid fa-moon"></i>
      </button>
      <div class="dropdown">
        <button class="navbar-user" type="button" data-bs-toggle="dropdown" aria-label="Account menu" data-testid="account-btn">
          <span class="avatar">AD</span>
          <span class="u-meta text-start"><span class="u-name d-block">Admin User</span><span class="u-role">Super Admin</span></span>
          <i class="fa-solid fa-chevron-down" style="font-size:10px;color:var(--admin-muted)"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><div class="dropdown-header">Signed in as admin@boostsmm.test</div></li>
          <li><a class="dropdown-item" href="admin-settings.html"><i class="fa-solid fa-user"></i>Account</a></li>
          <li><a class="dropdown-item" href="admin-settings.html"><i class="fa-solid fa-gear"></i>Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item danger" href="#" data-testid="account-logout"><i class="fa-solid fa-right-from-bracket"></i>Logout</a></li>
        </ul>
      </div>
    </div>`;
}

function renderLayout() {
  const body = document.body;
  const active = body.getAttribute("data-page");
  const title = body.getAttribute("data-title") || "Dashboard";
  const sub = body.getAttribute("data-sub") || title;

  const content = $id("page-content");
  const inner = content ? content.innerHTML : "";

  const shell = document.createElement("div");
  shell.className = "admin-layout";
  shell.innerHTML = `
    <aside class="admin-sidebar d-none d-lg-flex">${sidebarMarkup(active)}</aside>
    <div class="offcanvas offcanvas-start admin-offcanvas d-lg-none" tabindex="-1" id="adminOffcanvas" aria-label="Menu">
      <div class="admin-sidebar">${sidebarMarkup(active)}</div>
    </div>
    <div class="admin-main">
      <header class="admin-navbar">${navbarMarkup(title, sub)}</header>
      <main class="admin-content" id="admin-content-root">${inner}</main>
    </div>
    <div class="toast-wrap" id="toastWrap"></div>`;
  body.innerHTML = "";
  body.appendChild(shell);
}

/* =====================================================================
   DARK MODE
   ===================================================================== */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $id("themeToggle");
  if (btn) btn.innerHTML = `<i class="fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}"></i>`;
}
function initDarkMode() {
  const saved = localStorage.getItem("admin_theme");
  const sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(saved || sys);
  const btn = $id("themeToggle");
  if (btn) btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("admin_theme", next);
    toast("success", "Theme updated", `Switched to ${next} mode.`);
  });
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("admin_theme")) applyTheme(e.matches ? "dark" : "light");
    });
  }
}

/* =====================================================================
   TOASTS
   ===================================================================== */
function toast(type, title, text) {
  const wrap = $id("toastWrap");
  if (!wrap) return;
  const map = {
    success: { ic: "ic-green", icon: "fa-circle-check" },
    error: { ic: "ic-red", icon: "fa-circle-exclamation" },
    info: { ic: "ic-blue", icon: "fa-circle-info" },
    warning: { ic: "ic-amber", icon: "fa-triangle-exclamation" },
  };
  const m = map[type] || map.info;
  const t = document.createElement("div");
  t.className = "admin-toast";
  t.setAttribute("role", "alert");
  t.innerHTML = `
    <div class="t-ic ${m.ic}"><i class="fa-solid ${m.icon}"></i></div>
    <div><div class="t-title">${esc(title)}</div>${text ? `<div class="t-text">${esc(text)}</div>` : ""}</div>
    <button class="t-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>`;
  wrap.appendChild(t);
  const close = () => { t.classList.add("hide-out"); setTimeout(() => t.remove(), 250); };
  t.querySelector(".t-close").addEventListener("click", close);
  setTimeout(close, 3800);
}

/* =====================================================================
   MODALS (generic confirm)
   ===================================================================== */
function confirmAction({ title = "Are you sure?", text = "This action cannot be undone.", confirmLabel = "Confirm", danger = true, onConfirm }) {
  let m = $id("genericConfirmModal");
  if (m) m.remove();
  m = document.createElement("div");
  m.className = "modal fade";
  m.id = "genericConfirmModal";
  m.tabIndex = -1;
  m.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div><div class="modal-title">${esc(title)}</div></div>
          <button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body"><p class="mb-0 text-muted">${esc(text)}</p></div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="confirmActionBtn" data-testid="confirm-action-btn">${esc(confirmLabel)}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(m);
  const modal = new bootstrap.Modal(m);
  modal.show();
  qs("#confirmActionBtn", m).addEventListener("click", () => { modal.hide(); if (onConfirm) onConfirm(); });
  m.addEventListener("hidden.bs.modal", () => m.remove());
}
AdminApp.confirmAction = confirmAction;

function showModal(html, size = "") {
  let m = $id("dynamicModal");
  if (m) { bootstrap.Modal.getInstance(m)?.dispose(); m.remove(); }
  m = document.createElement("div");
  m.className = "modal fade";
  m.id = "dynamicModal";
  m.tabIndex = -1;
  m.innerHTML = `<div class="modal-dialog ${size} modal-dialog-scrollable modal-dialog-centered">${html}</div>`;
  document.body.appendChild(m);
  const modal = new bootstrap.Modal(m);
  modal.show();
  m.addEventListener("hidden.bs.modal", () => m.remove());
  return { el: m, modal };
}
AdminApp.showModal = showModal;

/* =====================================================================
   NOTIFICATIONS + SEARCH
   ===================================================================== */
function initNotifications() {
  const mark = $id("markAllRead");
  if (mark) mark.addEventListener("click", (e) => {
    e.preventDefault();
    qsa(".notif-item.unread").forEach(n => n.classList.remove("unread"));
    $id("notifDot")?.remove();
    toast("success", "Notifications", "All notifications marked as read.");
  });
  qsa(".notif-item").forEach(n => n.addEventListener("click", () => n.classList.remove("unread")));
}

function initSearch() {
  const input = $id("globalSearch");
  const results = $id("globalSearchResults");
  if (!input || !results) return;
  const searchable = [
    ...MOCK.users.map(u => ({ type: "User", label: u.username, sub: u.email, icon: "fa-user", href: "admin-users.html" })),
    ...MOCK.orders.slice(0, 20).map(o => ({ type: "Order", label: "#" + o.id, sub: o.service, icon: "fa-boxes-stacked", href: "admin-orders.html" })),
    ...MOCK.services.map(s => ({ type: "Service", label: s.name, sub: money(s.sellRate) + "/1k", icon: "fa-layer-group", href: "admin-services.html" })),
  ];
  const render = (q) => {
    if (!q) { results.classList.remove("show"); return; }
    const found = searchable.filter(x => (x.label + " " + x.sub).toLowerCase().includes(q.toLowerCase())).slice(0, 8);
    results.innerHTML = found.length
      ? found.map(f => `<a class="dropdown-item" href="${f.href}"><i class="fa-solid ${f.icon}"></i><span><span class="d-block fw-600">${esc(f.label)}</span><small class="text-muted">${esc(f.type)} · ${esc(f.sub)}</small></span></a>`).join("")
      : `<div class="dropdown-item text-muted"><i class="fa-solid fa-magnifying-glass"></i>No results found</div>`;
    results.classList.add("show");
  };
  input.addEventListener("input", () => render(input.value.trim()));
  input.addEventListener("focus", () => { if (input.value.trim()) render(input.value.trim()); });
  document.addEventListener("click", (e) => { if (!input.contains(e.target) && !results.contains(e.target)) results.classList.remove("show"); });
}

/* logout links */
function initLogout() {
  qsa('[data-testid="sidebar-logout"], [data-testid="account-logout"]').forEach(a => {
    a.addEventListener("click", (e) => { e.preventDefault(); toast("info", "Logout", "You have been signed out (demo)."); });
  });
}

/* =====================================================================
   FILTERS (generic client-side table filter)
   ===================================================================== */
function attachTableFilter(searchInputId, tableSelector, filterSelects = []) {
  const search = $id(searchInputId);
  const table = qs(tableSelector);
  if (!table) return;
  const apply = () => {
    const q = (search?.value || "").toLowerCase();
    const filters = filterSelects.map(f => ({ col: f.col, val: ($id(f.id)?.value || "").toLowerCase() }));
    let visible = 0;
    qsa("tbody tr", table).forEach(tr => {
      if (tr.classList.contains("empty-row")) return;
      const text = tr.textContent.toLowerCase();
      let ok = !q || text.includes(q);
      filters.forEach(f => {
        if (ok && f.val) {
          const cell = tr.getAttribute("data-" + f.col) || "";
          if (!cell.toLowerCase().includes(f.val)) ok = false;
        }
      });
      tr.style.display = ok ? "" : "none";
      if (ok) visible++;
    });
    let er = qs("tbody .empty-row", table);
    if (visible === 0) {
      if (!er) {
        const cols = qsa("thead th", table).length;
        const tb = qs("tbody", table);
        er = document.createElement("tr");
        er.className = "empty-row";
        er.innerHTML = `<td colspan="${cols}"><div class="empty-state"><div class="es-ic"><i class="fa-solid fa-magnifying-glass"></i></div><h3>No results found</h3><p>Try adjusting your search or filters.</p></div></td>`;
        tb.appendChild(er);
      } else er.style.display = "";
    } else if (er) er.style.display = "none";
  };
  search?.addEventListener("input", apply);
  filterSelects.forEach(f => $id(f.id)?.addEventListener("change", apply));
}
AdminApp.attachTableFilter = attachTableFilter;

/* =====================================================================
   USERS
   ===================================================================== */
const userActions = [
  { key: "view", label: "View User", icon: "fa-eye" },
  { key: "edit", label: "Edit User", icon: "fa-pen" },
  { key: "add-funds", label: "Add Funds", icon: "fa-plus" },
  { key: "sub-funds", label: "Subtract Funds", icon: "fa-minus" },
  { key: "orders", label: "Orders", icon: "fa-boxes-stacked" },
  { key: "tickets", label: "Tickets", icon: "fa-ticket" },
  { key: "group", label: "Change User Group", icon: "fa-user-tag" },
  { key: "reset", label: "Reset Password", icon: "fa-key" },
  { key: "login-as", label: "Login as User", icon: "fa-right-to-bracket" },
  { key: "block", label: "Block User", icon: "fa-ban", danger: true },
  { key: "delete", label: "Delete User", icon: "fa-trash", danger: true },
];
function actionMenu(actions, dataAttr) {
  return `
    <div class="dropdown">
      <button class="action-btn" type="button" data-bs-toggle="dropdown" aria-label="Actions" data-testid="row-actions-btn">
        <i class="fa-solid fa-ellipsis"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        ${actions.map(a => a.divider ? '<li><hr class="dropdown-divider"></li>' :
          `<li><a class="dropdown-item ${a.danger ? "danger" : ""}" href="#" data-action="${a.key}" ${dataAttr}><i class="fa-solid ${a.icon}"></i>${a.label}</a></li>`).join("")}
      </ul>
    </div>`;
}

function renderUsers() {
  const tbody = $id("usersTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.users.map(u => `
    <tr data-status="${u.status}" data-group="${u.group}" data-uid="${u.id}">
      <td class="cell-mono">#${u.id}</td>
      <td><div class="d-flex align-items-center gap-2"><span class="avatar">${initials(u.username)}</span><span class="cell-strong">${esc(u.username)}</span></div></td>
      <td class="text-muted">${esc(u.email)}</td>
      <td class="cell-mono cell-strong">${money(u.balance)}</td>
      <td class="cell-mono">${u.orders}</td>
      <td class="cell-mono">${money(u.spent)}</td>
      <td><span class="feat-badge">${esc(u.group)}</span></td>
      <td>${badge(u.status)}</td>
      <td class="text-muted small">${esc(u.created)}</td>
      <td class="text-end">${actionMenu(userActions, `data-uid="${u.id}"`)}</td>
    </tr>`).join("");

  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]");
    if (!a) return;
    e.preventDefault();
    const uid = a.getAttribute("data-uid");
    const user = MOCK.users.find(x => x.id == uid);
    handleUserAction(a.getAttribute("data-action"), user);
  });
}
function handleUserAction(action, user) {
  switch (action) {
    case "view": openUserDetails(user); break;
    case "edit": openUserForm(user); break;
    case "add-funds": openFundsModal(user, "add"); break;
    case "sub-funds": openFundsModal(user, "sub"); break;
    case "orders": window.location.href = "admin-orders.html"; break;
    case "tickets": window.location.href = "admin-tickets.html"; break;
    case "group": openGroupModal(user); break;
    case "reset": confirmAction({ title: "Reset password?", text: `A password reset link will be sent to ${user.email}.`, confirmLabel: "Send reset", danger: false, onConfirm: () => toast("success", "Password reset", "Reset link sent (demo).") }); break;
    case "login-as": toast("info", "Login as user", `Opening ${user.username}'s panel (demo).`); break;
    case "block": confirmAction({ title: "Block this user?", text: `${user.username} will lose access until unblocked.`, confirmLabel: "Block user", onConfirm: () => toast("warning", "User blocked", `${user.username} has been blocked.`) }); break;
    case "delete": confirmAction({ title: "Delete this user?", text: `${user.username} and all associated data will be permanently removed.`, confirmLabel: "Delete user", onConfirm: () => toast("success", "User deleted", `${user.username} was deleted (demo).`) }); break;
  }
}
function userFormFields(u = {}) {
  const grp = MOCK.groups.map(g => `<option ${u.group === g ? "selected" : ""}>${g}</option>`).join("");
  return `
    <div class="row g-3">
      <div class="col-md-6"><label class="form-label">Username <span class="req">*</span></label><input class="form-control" required value="${esc(u.username || "")}" data-testid="user-username"></div>
      <div class="col-md-6"><label class="form-label">Email <span class="req">*</span></label><input type="email" class="form-control" required value="${esc(u.email || "")}" data-testid="user-email"></div>
      <div class="col-md-6"><label class="form-label">WhatsApp</label><input class="form-control" value="${esc(u.whatsapp || "")}" placeholder="+91…"></div>
      <div class="col-md-6"><label class="form-label">Telegram</label><input class="form-control" value="${esc(u.telegram || "")}" placeholder="@username"></div>
      ${u.id ? "" : `<div class="col-md-6"><label class="form-label">Password <span class="req">*</span></label><input type="password" class="form-control" required placeholder="••••••••"></div>`}
      <div class="col-md-6"><label class="form-label">User Group</label><select class="form-select">${grp}</select></div>
      <div class="col-md-6"><label class="form-label">Balance</label><div class="input-group"><span class="input-group-text">₹</span><input type="number" class="form-control" value="${u.balance ?? 0}"></div></div>
      <div class="col-md-6"><label class="form-label">Status</label><select class="form-select"><option ${u.status === "Active" ? "selected" : ""}>Active</option><option ${u.status === "Blocked" ? "selected" : ""}>Blocked</option></select></div>
      <div class="col-md-6"><label class="form-label">Timezone</label><select class="form-select"><option>Asia/Kolkata (GMT+5:30)</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option></select></div>
    </div>`;
}
function openUserForm(user) {
  const editing = !!user;
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">${editing ? "Edit User" : "Add User"}<span class="mt-sub">${editing ? "Update account details" : "Create a new panel account"}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body"><form id="userForm" novalidate>${userFormFields(user || {})}</form></div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="saveUserBtn" data-testid="save-user-btn">${editing ? "Save Changes" : "Create User"}</button></div>
    </div>`);
  qs("#saveUserBtn", el).addEventListener("click", () => {
    const form = qs("#userForm", el);
    if (!validateForm(form)) return;
    modal.hide();
    toast("success", editing ? "User updated" : "User created", editing ? "Changes saved successfully." : "New user account created.");
  });
}
function openUserDetails(u) {
  const { el } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="d-flex align-items-center gap-3"><span class="avatar" style="width:44px;height:44px;font-size:16px">${initials(u.username)}</span><div class="modal-title">${esc(u.username)}<span class="mt-sub">${esc(u.email)}</span></div></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <div class="row g-3 mb-3">
          <div class="col-6 col-md-4"><div class="card"><div class="card-body py-2"><div class="stat-label">Balance</div><div class="fs-5 fw-bold">${money(u.balance)}</div></div></div></div>
          <div class="col-6 col-md-4"><div class="card"><div class="card-body py-2"><div class="stat-label">Total Orders</div><div class="fs-5 fw-bold">${u.orders}</div></div></div></div>
          <div class="col-6 col-md-4"><div class="card"><div class="card-body py-2"><div class="stat-label">Total Spent</div><div class="fs-5 fw-bold">${money(u.spent)}</div></div></div></div>
        </div>
        <div class="kv"><span class="kv-k">User Group</span><span class="kv-v">${esc(u.group)}</span></div>
        <div class="kv"><span class="kv-k">Status</span><span class="kv-v">${badge(u.status)}</span></div>
        <div class="kv"><span class="kv-k">WhatsApp</span><span class="kv-v">${esc(u.whatsapp)}</span></div>
        <div class="kv"><span class="kv-k">Telegram</span><span class="kv-v">${esc(u.telegram)}</span></div>
        <div class="kv"><span class="kv-k">Registered</span><span class="kv-v">${esc(u.created)}</span></div>
        <div class="kv"><span class="kv-k">Last Login</span><span class="kv-v">${esc(u.lastLogin)}</span></div>
      </div>
      <div class="modal-footer flex-wrap">
        <button class="btn btn-light btn-sm" id="udAddFunds"><i class="fa-solid fa-plus"></i>Add Funds</button>
        <button class="btn btn-light btn-sm" id="udSubFunds"><i class="fa-solid fa-minus"></i>Subtract Funds</button>
        <button class="btn btn-light btn-sm" onclick="location.href='admin-orders.html'"><i class="fa-solid fa-boxes-stacked"></i>View Orders</button>
        <button class="btn btn-light btn-sm" onclick="location.href='admin-tickets.html'"><i class="fa-solid fa-ticket"></i>View Tickets</button>
        <button class="btn btn-primary btn-sm" id="udEdit"><i class="fa-solid fa-pen"></i>Edit User</button>
      </div>
    </div>`, "modal-lg");
  qs("#udEdit", el).addEventListener("click", () => { bootstrap.Modal.getInstance(el).hide(); setTimeout(() => openUserForm(u), 300); });
  qs("#udAddFunds", el).addEventListener("click", () => { bootstrap.Modal.getInstance(el).hide(); setTimeout(() => openFundsModal(u, "add"), 300); });
  qs("#udSubFunds", el).addEventListener("click", () => { bootstrap.Modal.getInstance(el).hide(); setTimeout(() => openFundsModal(u, "sub"), 300); });
}
function openFundsModal(u, mode) {
  const add = mode === "add";
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">${add ? "Add Funds" : "Subtract Funds"}<span class="mt-sub">${esc(u.username)} · Current: ${money(u.balance)}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label">Amount <span class="req">*</span></label>
        <div class="input-group"><span class="input-group-text">₹</span><input type="number" class="form-control" id="fundAmt" min="1" placeholder="0.00" required></div>
        <label class="form-label mt-3">Note (optional)</label>
        <textarea class="form-control" rows="2" placeholder="Reason / reference"></textarea>
      </div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn ${add ? "btn-success" : "btn-danger"}" id="fundBtn">${add ? "Add Funds" : "Subtract Funds"}</button></div>
    </div>`);
  qs("#fundBtn", el).addEventListener("click", () => {
    const amt = qs("#fundAmt", el).value;
    if (!amt || Number(amt) <= 0) { qs("#fundAmt", el).classList.add("is-invalid"); return; }
    modal.hide();
    toast("success", add ? "Funds added" : "Funds subtracted", `${money(amt)} ${add ? "added to" : "removed from"} ${u.username}.`);
  });
}
function openGroupModal(u) {
  const opts = MOCK.groups.map(g => `<option ${u.group === g ? "selected" : ""}>${g}</option>`).join("");
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">Change User Group<span class="mt-sub">${esc(u.username)}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body"><label class="form-label">User Group</label><select class="form-select">${opts}</select></div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="grpBtn">Save</button></div>
    </div>`);
  qs("#grpBtn", el).addEventListener("click", () => { modal.hide(); toast("success", "User group updated", `${u.username}'s group changed.`); });
}
function initUsersPage() {
  renderUsers();
  attachTableFilter("userSearch", "#usersTable", [{ id: "userStatusFilter", col: "status" }, { id: "userGroupFilter", col: "group" }]);
  $id("addUserBtn")?.addEventListener("click", () => openUserForm(null));
  $id("exportUsersBtn")?.addEventListener("click", () => toast("success", "Export started", "Users exported to CSV (demo)."));
}

/* =====================================================================
   ORDERS
   ===================================================================== */
function orderActions(o) {
  const acts = [
    { key: "view", label: "View", icon: "fa-eye" },
    { key: "edit", label: "Edit", icon: "fa-pen" },
    { key: "status", label: "Change Status", icon: "fa-arrows-rotate" },
  ];
  if (o.status !== "Cancelled") acts.push({ key: "refill", label: "Refill", icon: "fa-rotate" });
  acts.push({ key: "cancel", label: "Cancel", icon: "fa-xmark", danger: true });
  acts.push({ divider: true });
  acts.push({ key: "change-provider", label: "Change Provider & Send", icon: "fa-shuffle" });
  if (o.failed) acts.push({ key: "resend", label: "Resend Order", icon: "fa-paper-plane" });
  return actionMenu(acts, `data-oid="${o.id}"`);
}
function renderOrders() {
  const tbody = $id("ordersTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.orders.map(o => `
    <tr data-status="${o.status}" data-provider="${o.provider}" data-oid="${o.id}">
      <td class="cell-mono">#${o.id}</td>
      <td class="cell-strong">${esc(o.user)}</td>
      <td><div class="text-truncate" style="max-width:190px" title="${esc(o.service)}">${esc(o.service)}</div></td>
      <td><a href="${esc(o.link)}" class="cell-link" target="_blank" rel="noopener" title="${esc(o.link)}">${esc(o.link)}</a></td>
      <td class="cell-mono cell-strong">${moneyDec(o.charge)}</td>
      <td class="cell-mono">${o.startCount.toLocaleString("en-IN")}</td>
      <td class="cell-mono">${o.qty.toLocaleString("en-IN")}</td>
      <td class="cell-mono">${o.remains.toLocaleString("en-IN")}</td>
      <td>${badge(o.status)}</td>
      <td class="text-muted small">${esc(o.provider)}</td>
      <td class="text-muted small">${esc(o.created)}</td>
      <td class="text-end">${orderActions(o)}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const o = MOCK.orders.find(x => x.id == a.getAttribute("data-oid"));
    handleOrderAction(a.getAttribute("data-action"), o);
  });
}
function handleOrderAction(action, o) {
  switch (action) {
    case "view": case "edit": openOrderDetails(o); break;
    case "status": openStatusModal(o); break;
    case "refill": confirmAction({ title: "Send refill?", text: `Refill will be requested for order #${o.id}.`, confirmLabel: "Send refill", danger: false, onConfirm: () => toast("success", "Refill sent", `Refill requested for #${o.id}.`) }); break;
    case "cancel": confirmAction({ title: "Cancel this order?", text: `Order #${o.id} will be cancelled and refunded.`, confirmLabel: "Cancel order", onConfirm: () => toast("warning", "Order cancelled", `Order #${o.id} cancelled.`) }); break;
    case "change-provider": openChangeProviderModal(o); break;
    case "resend": confirmAction({ title: "Resend order?", text: `Order #${o.id} will be resent to the provider.`, confirmLabel: "Resend", danger: false, onConfirm: () => toast("success", "Order resent", `#${o.id} resent to provider.`) }); break;
  }
}
function openOrderDetails(o) {
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">Order #${o.id}<span class="mt-sub">${esc(o.service)}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-6">
            <div class="kv"><span class="kv-k">Username</span><span class="kv-v">${esc(o.user)}</span></div>
            <div class="kv"><span class="kv-k">Category</span><span class="kv-v">${esc(o.catName)}</span></div>
            <div class="kv"><span class="kv-k">Provider</span><span class="kv-v">${esc(o.provider)}</span></div>
            <div class="kv"><span class="kv-k">Provider Order ID</span><span class="kv-v cell-mono">${esc(o.providerOid)}</span></div>
            <div class="kv"><span class="kv-k">Link</span><span class="kv-v"><a href="${esc(o.link)}" class="cell-link" target="_blank" rel="noopener">${esc(o.link)}</a></span></div>
            <div class="kv"><span class="kv-k">Charge</span><span class="kv-v">${moneyDec(o.charge)}</span></div>
          </div>
          <div class="col-md-6">
            <div class="kv"><span class="kv-k">Start Count</span><span class="kv-v cell-mono">${o.startCount.toLocaleString("en-IN")}</span></div>
            <div class="kv"><span class="kv-k">Quantity</span><span class="kv-v cell-mono">${o.qty.toLocaleString("en-IN")}</span></div>
            <div class="kv"><span class="kv-k">Remains</span><span class="kv-v cell-mono">${o.remains.toLocaleString("en-IN")}</span></div>
            <div class="kv"><span class="kv-k">Status</span><span class="kv-v">${badge(o.status)}</span></div>
            <div class="kv"><span class="kv-k">Created</span><span class="kv-v">${esc(o.created)}</span></div>
            <div class="kv"><span class="kv-k">Last Updated</span><span class="kv-v">${esc(o.updated)}</span></div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn btn-light" id="odRefill"><i class="fa-solid fa-rotate"></i>Refill</button><button class="btn btn-light" id="odCancel"><i class="fa-solid fa-xmark"></i>Cancel Order</button><button class="btn btn-primary" id="odSave">Save Changes</button></div>
    </div>`, "modal-lg");
  qs("#odSave", el).addEventListener("click", () => { modal.hide(); toast("success", "Order updated", `Order #${o.id} saved.`); });
  qs("#odRefill", el).addEventListener("click", () => { modal.hide(); toast("success", "Refill sent", `Refill requested for #${o.id}.`); });
  qs("#odCancel", el).addEventListener("click", () => { modal.hide(); toast("warning", "Order cancelled", `Order #${o.id} cancelled.`); });
}
function openStatusModal(o) {
  const statuses = ["Pending", "Processing", "Completed", "Partial", "Cancelled"];
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">Change Status<span class="mt-sub">Order #${o.id}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body"><label class="form-label">Status</label><select class="form-select">${statuses.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select>
        <label class="form-label mt-3">Start Count</label><input type="number" class="form-control" value="${o.startCount}">
        <label class="form-label mt-3">Remains</label><input type="number" class="form-control" value="${o.remains}"></div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="stBtn">Update Status</button></div>
    </div>`);
  qs("#stBtn", el).addEventListener("click", () => { modal.hide(); toast("success", "Status updated", `Order #${o.id} status changed.`); });
}
function openChangeProviderModal(o) {
  const provs = MOCK.providers.map(p => `<option ${p.name === o.provider ? "selected" : ""}>${p.name}</option>`).join("");
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">Change Provider & Send<span class="mt-sub">Order #${o.id}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label">New Provider</label><select class="form-select mb-3">${provs}</select>
        <label class="form-label">Provider Service ID</label><input class="form-control" placeholder="e.g. 12345" value="${o.providerOid}">
      </div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="cpBtn"><i class="fa-solid fa-paper-plane"></i>Send to Provider</button></div>
    </div>`);
  qs("#cpBtn", el).addEventListener("click", () => { modal.hide(); toast("success", "Provider changed", `Order #${o.id} sent to new provider.`); });
}
function initOrdersPage() {
  renderOrders();
  attachTableFilter("orderSearch", "#ordersTable", [{ id: "orderStatusFilter", col: "status" }, { id: "orderProviderFilter", col: "provider" }]);
}

/* =====================================================================
   TASKS
   ===================================================================== */
function initTasksPage() {
  const tbody = $id("tasksTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.tasks.map(t => `
    <tr data-status="${t.status}">
      <td class="cell-mono">#${t.id}</td>
      <td class="cell-strong">${esc(t.type)}</td>
      <td class="cell-mono">${esc(t.order)}</td>
      <td>${badge(t.status)}</td>
      <td class="text-muted small">${esc(t.created)}</td>
      <td class="text-end">${actionMenu([{ key: "view", label: "View", icon: "fa-eye" }, { key: "retry", label: "Retry", icon: "fa-rotate" }, { key: "delete", label: "Delete", icon: "fa-trash", danger: true }], "")}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const act = a.getAttribute("data-action");
    if (act === "delete") confirmAction({ title: "Delete task?", onConfirm: () => toast("success", "Task deleted", "Task removed (demo).") });
    else if (act === "retry") toast("info", "Task retried", "Task re-queued (demo).");
    else toast("info", "Task", "Viewing task details (demo).");
  });
  attachTableFilter("taskSearch", "#tasksTable", [{ id: "taskStatusFilter", col: "status" }]);
}

/* =====================================================================
   CATEGORIES + SORTING
   ===================================================================== */
function getCategoryOrder() {
  try { const s = JSON.parse(localStorage.getItem("admin_category_order")); if (Array.isArray(s)) return s; } catch (e) {}
  return null;
}
function orderedCategories() {
  const order = getCategoryOrder();
  if (!order) return [...MOCK.categories];
  const map = new Map(MOCK.categories.map(c => [c.id, c]));
  const out = order.map(id => map.get(id)).filter(Boolean);
  MOCK.categories.forEach(c => { if (!out.includes(c)) out.push(c); });
  return out;
}
function renderCategories() {
  const tbody = $id("categoriesTableBody");
  if (!tbody) return;
  const cats = orderedCategories();
  tbody.innerHTML = cats.map((c, i) => `
    <tr class="sortable-row" data-cat-id="${c.id}" data-status="${c.status || (i % 6 === 0 ? "Disabled" : "Active")}">
      <td style="width:44px"><button class="drag-handle" aria-label="Drag to reorder" data-testid="cat-drag-${c.id}"><i class="fa-solid fa-grip-vertical"></i></button></td>
      <td class="cell-mono">#${c.id}</td>
      <td><span class="cell-strong cat-name" role="button" data-cat-id="${c.id}">${esc(c.name)}</span></td>
      <td class="cell-mono">${c.serviceCount} services</td>
      <td>${badge(i % 6 === 0 ? "Disabled" : "Active")}</td>
      <td><span class="sort-num">${i + 1}</span></td>
      <td class="text-end">${actionMenu([{ key: "view", label: "View Services", icon: "fa-eye" }, { key: "edit", label: "Edit", icon: "fa-pen" }, { key: "new-service", label: "New Service", icon: "fa-plus" }, { divider: true }, { key: "delete", label: "Delete", icon: "fa-trash", danger: true }], `data-cat-id="${c.id}"`)}</td>
    </tr>`).join("");

  tbody.addEventListener("click", (e) => {
    const name = e.target.closest(".cat-name");
    if (name) { openCategoryModal(MOCK.categories.find(c => c.id == name.getAttribute("data-cat-id"))); return; }
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const cat = MOCK.categories.find(c => c.id == a.getAttribute("data-cat-id"));
    const act = a.getAttribute("data-action");
    if (act === "view") openCategoryModal(cat);
    else if (act === "edit") openCategoryForm(cat);
    else if (act === "new-service") openServiceModal(null, cat.id);
    else if (act === "delete") confirmAction({ title: "Delete category?", text: `"${cat.name}" and its service links will be removed.`, confirmLabel: "Delete", onConfirm: () => toast("success", "Category deleted", `${cat.name} deleted (demo).`) });
  });

  initCategorySortable();
}
function updateSortNumbers(tbody) {
  qsa("tr", tbody).forEach((tr, i) => { const n = qs(".sort-num", tr); if (n) n.textContent = i + 1; });
}
function initCategorySortable() {
  const tbody = $id("categoriesTableBody");
  if (!tbody || !window.jQuery || !jQuery.fn.sortable) return;
  jQuery(tbody).sortable({
    items: "> tr",
    handle: ".drag-handle",
    placeholder: "sortable-placeholder",
    forcePlaceholderSize: true,
    axis: "y",
    helper: function (e, tr) { tr.children().each(function () { jQuery(this).width(jQuery(this).width()); }); return tr; },
    start: (e, ui) => ui.item.addClass("sortable-dragging"),
    stop: (e, ui) => ui.item.removeClass("sortable-dragging"),
    update: function () {
      updateSortNumbers(tbody);
      const order = qsa("tr", tbody).map(tr => Number(tr.getAttribute("data-cat-id")));
      localStorage.setItem("admin_category_order", JSON.stringify(order));
      toast("success", "Sorting updated", "Category order saved successfully.");
    },
  });
}
function openCategoryForm(cat) {
  const editing = !!cat;
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">${editing ? "Edit Category" : "New Category"}</div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label">Category Name <span class="req">*</span></label><input class="form-control" id="catName" value="${esc(cat?.name || "")}" required>
        <label class="form-label mt-3">Status</label><select class="form-select"><option>Active</option><option>Disabled</option></select>
        <label class="form-label mt-3">Sort Order</label><input type="number" class="form-control" value="${editing ? "" : MOCK.categories.length + 1}" placeholder="Auto (drag to reorder)">
        <div class="form-text mt-1">Tip: drag categories on the list to reorder them.</div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="catSave">${editing ? "Save Changes" : "Create Category"}</button></div>
    </div>`);
  qs("#catSave", el).addEventListener("click", () => {
    if (!qs("#catName", el).value.trim()) { qs("#catName", el).classList.add("is-invalid"); return; }
    modal.hide(); toast("success", editing ? "Category updated" : "Category created", "Saved successfully.");
  });
}
function openCategoryModal(cat) {
  const svcs = MOCK.services.filter(s => s.catId === cat.id);
  const { el } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">${esc(cat.name)}<span class="mt-sub">${cat.serviceCount} services in this category</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <div class="row g-2 mb-3">
          <div class="col-6 col-md-3"><div class="kv"><span class="kv-k">Category ID</span></div><div class="fw-bold">#${cat.id}</div></div>
          <div class="col-6 col-md-3"><div class="kv"><span class="kv-k">Services</span></div><div class="fw-bold">${cat.serviceCount}</div></div>
          <div class="col-6 col-md-3"><div class="kv"><span class="kv-k">Status</span></div><div>${badge("Active")}</div></div>
          <div class="col-6 col-md-3"><div class="kv"><span class="kv-k">Sort Order</span></div><div class="fw-bold">${orderedCategories().findIndex(c => c.id === cat.id) + 1}</div></div>
        </div>
        <div class="fw-600 mb-2">Services in this category</div>
        <div class="category-block"><div class="cb-body service-sortable" data-cat-id="${cat.id}">
          ${svcs.map((s, i) => `
            <div class="service-item sortable-row" data-svc-id="${s.id}">
              <button class="drag-handle" aria-label="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></button>
              <span class="sort-num">${i + 1}</span>
              <div class="flex-grow-1"><div class="si-name">${esc(s.name)}</div><div class="si-meta">${money(s.sellRate)}/1k · Min ${s.min} · Max ${s.max}</div></div>
              ${badge(s.status)}
            </div>`).join("")}
        </div></div>
      </div>
      <div class="modal-footer"><button class="btn btn-danger btn-sm" id="cmDelete"><i class="fa-solid fa-trash"></i>Delete</button><button class="btn btn-light btn-sm" id="cmNewSvc"><i class="fa-solid fa-plus"></i>New Service</button><button class="btn btn-primary btn-sm" id="cmEdit"><i class="fa-solid fa-pen"></i>Edit</button></div>
    </div>`, "modal-lg");
  initServiceSortable(qs(".service-sortable", el));
  qs("#cmEdit", el).addEventListener("click", () => { bootstrap.Modal.getInstance(el).hide(); setTimeout(() => openCategoryForm(cat), 300); });
  qs("#cmNewSvc", el).addEventListener("click", () => { bootstrap.Modal.getInstance(el).hide(); setTimeout(() => openServiceModal(null, cat.id), 300); });
  qs("#cmDelete", el).addEventListener("click", () => { bootstrap.Modal.getInstance(el).hide(); setTimeout(() => confirmAction({ title: "Delete category?", onConfirm: () => toast("success", "Category deleted", `${cat.name} deleted.`) }), 300); });
}
function initCategoriesPage() {
  renderCategories();
  $id("newCategoryBtn")?.addEventListener("click", () => openCategoryForm(null));
}

/* =====================================================================
   SERVICES + SORTING
   ===================================================================== */
function featBadge(on, label) { return `<span class="feat-badge ${on ? "feat-yes" : "feat-no"}">${label}: ${on ? "Yes" : "No"}</span>`; }
function serviceActions(s) {
  return actionMenu([
    { key: "edit", label: "Edit", icon: "fa-pen" },
    { key: "duplicate", label: "Duplicate", icon: "fa-copy" },
    { key: s.status === "Active" ? "disable" : "enable", label: s.status === "Active" ? "Disable" : "Enable", icon: s.status === "Active" ? "fa-toggle-off" : "fa-toggle-on" },
    { key: "move", label: "Move to Category", icon: "fa-folder-tree" },
    { divider: true },
    { key: "delete", label: "Delete", icon: "fa-trash", danger: true },
  ], `data-svc-id="${s.id}"`);
}
function renderServicesTable() {
  const tbody = $id("servicesTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.services.map(s => `
    <tr data-status="${s.status}" data-category="${s.catName}" data-provider="${s.provider}" data-type="${s.type}" data-svc-id="${s.id}">
      <td class="cell-mono">#${s.id}</td>
      <td class="text-muted small">${esc(s.catName)}</td>
      <td><div class="cell-strong">${esc(s.name)}</div><div class="mt-1 d-flex gap-1 flex-wrap">${s.nonDrop ? '<span class="feat-badge feat-yes">Non Drop</span>' : ""}${s.country ? '<span class="feat-badge feat-yes">Country</span>' : ""}${s.dripfeed ? '<span class="feat-badge">Drip</span>' : ""}<span class="feat-badge">${esc(s.type)}</span></div></td>
      <td class="cell-mono cell-strong">${money(s.sellRate)}<span class="text-muted small">/1k</span></td>
      <td class="cell-mono">${s.min}</td>
      <td class="cell-mono">${s.max.toLocaleString("en-IN")}</td>
      <td class="text-muted small">${esc(s.provider)}</td>
      <td>${s.refill ? '<span class="feat-badge feat-yes">Yes</span>' : '<span class="feat-badge feat-no">No</span>'}</td>
      <td>${s.cancel ? '<span class="feat-badge feat-yes">Yes</span>' : '<span class="feat-badge feat-no">No</span>'}</td>
      <td>${badge(s.status)}</td>
      <td class="text-end">${serviceActions(s)}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const s = MOCK.services.find(x => x.id == a.getAttribute("data-svc-id"));
    handleServiceAction(a.getAttribute("data-action"), s);
  });
}
function handleServiceAction(action, s) {
  switch (action) {
    case "edit": openServiceModal(s); break;
    case "duplicate": openServiceModal({ ...s, name: s.name + " (Copy)", id: null }, s.catId, true); break;
    case "enable": toast("success", "Service enabled", `${s.name} is now active.`); break;
    case "disable": toast("warning", "Service disabled", `${s.name} disabled.`); break;
    case "move": openMoveServiceModal(s); break;
    case "delete": confirmAction({ title: "Delete service?", text: `"${s.name}" will be permanently removed.`, confirmLabel: "Delete", onConfirm: () => toast("success", "Service deleted", `${s.name} deleted (demo).`) }); break;
  }
}
function openMoveServiceModal(s) {
  const opts = MOCK.categories.map(c => `<option value="${c.id}" ${c.id === s.catId ? "" : ""}>${c.name}</option>`).join("");
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">Move to Category<span class="mt-sub">${esc(s.name)}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label">Current Category</label><input class="form-control mb-3" value="${esc(s.catName)}" disabled>
        <label class="form-label">New Category</label><select class="form-select">${opts}</select>
      </div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="moveBtn">Move Service</button></div>
    </div>`);
  qs("#moveBtn", el).addEventListener("click", () => { modal.hide(); toast("success", "Service moved", `${s.name} moved to new category.`); });
}
function initServiceSortable(container) {
  if (!container || !window.jQuery || !jQuery.fn.sortable) return;
  jQuery(container).sortable({
    items: "> .service-item",
    handle: ".drag-handle",
    placeholder: "sortable-placeholder",
    forcePlaceholderSize: true,
    axis: "y",
    start: (e, ui) => ui.item.addClass("sortable-dragging"),
    stop: (e, ui) => ui.item.removeClass("sortable-dragging"),
    update: function () {
      qsa(".service-item", container).forEach((it, i) => { const n = qs(".sort-num", it); if (n) n.textContent = i + 1; });
      const catId = container.getAttribute("data-cat-id");
      const order = qsa(".service-item", container).map(it => Number(it.getAttribute("data-svc-id")));
      localStorage.setItem("admin_service_order_" + catId, JSON.stringify(order));
      toast("success", "Sorting updated", "Service order saved successfully.");
    },
  });
}

/* ---- DETAILED SERVICE MODAL ---- */
function serviceModalHTML(s, targetCat) {
  const catOpts = MOCK.categories.map(c => `<option value="${c.id}" ${(s?.catId || targetCat) == c.id ? "selected" : ""}>${c.name}</option>`).join("");
  const provOpts = MOCK.providers.map(p => `<option ${s?.provider === p.name ? "selected" : ""}>${p.name}</option>`).join("");
  const sw = (id, label, desc, on) => `
    <div class="feature-switch">
      <div><div class="fsw-label">${label}</div><div class="fsw-desc">${desc}</div></div>
      <div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" id="${id}" data-feature ${on ? "checked" : ""}></div>
    </div>`;
  const secHead = (icon, ic, title, desc) => `<div class="fs-head"><div class="fs-ic ${ic}"><i class="fa-solid ${icon}"></i></div><div><div class="fs-title">${title}</div>${desc ? `<div class="fs-desc">${desc}</div>` : ""}</div></div>`;
  const countryChips = MOCK.countries.map(c => `<option>${c}</option>`).join("");

  return `
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-title">${s && s.id ? "Edit Service" : (s ? "Duplicate Service" : "New Service")}<span class="mt-sub">Configure a complete service offering</span></div>
      <button class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body">
    <form id="serviceForm" novalidate>

      <div class="form-section">${secHead("fa-circle-info", "ic-blue", "A · Basic Information", "Core service identity")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-8"><label class="form-label">Service Name <span class="req">*</span></label><input class="form-control" id="svcName" required value="${esc(s?.name || "")}" placeholder="e.g. Instagram Followers - Refill" data-testid="svc-name"></div>
          <div class="col-md-4"><label class="form-label">Service Status</label><select class="form-select" id="svcStatus"><option ${s?.status !== "Disabled" ? "selected" : ""}>Active</option><option ${s?.status === "Disabled" ? "selected" : ""}>Disabled</option></select></div>
          <div class="col-md-4"><label class="form-label">Category <span class="req">*</span></label><select class="form-select" id="svcCat">${catOpts}</select></div>
          <div class="col-md-4"><label class="form-label">Provider</label><select class="form-select" id="svcProvider">${provOpts}</select></div>
          <div class="col-md-4"><label class="form-label">Provider Service ID</label><input class="form-control" id="svcProviderSid" value="${s?.providerSid || ""}" placeholder="e.g. 12345"></div>
        </div></div>
      </div>

      <div class="form-section">${secHead("fa-align-left", "ic-gray", "B · Description", "Shown to users on the order page")}
        <div class="fs-body"><textarea class="form-control" id="svcDesc" rows="3" placeholder="High quality Instagram followers with 30-day refill…">${esc(s?.desc || "")}</textarea></div>
      </div>

      <div class="form-section">${secHead("fa-shapes", "ic-purple", "C · Service Type", "Changes which sections appear below")}
        <div class="fs-body"><select class="form-select" id="svcType" data-testid="svc-type">
          <option value="Normal" ${s?.type === "Normal" || !s ? "selected" : ""}>Normal</option>
          <option value="Package" ${s?.type === "Package" ? "selected" : ""}>Package</option>
          <option value="Subscription" ${s?.type === "Subscription" ? "selected" : ""}>Subscription</option>
        </select></div>
      </div>

      <div class="form-section">${secHead("fa-indian-rupee-sign", "ic-green", "D · Pricing", "Per 1000 units")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-4"><label class="form-label">Provider Rate (/1000)</label><div class="input-group"><span class="input-group-text">₹</span><input type="number" class="form-control" id="provRate" value="${s?.provRate || ""}" placeholder="25.00"></div></div>
          <div class="col-md-4"><label class="form-label">Selling Rate (/1000)</label><div class="input-group"><span class="input-group-text">₹</span><input type="number" class="form-control" id="sellRate" value="${s?.sellRate || ""}" placeholder="40.00"></div></div>
          <div class="col-md-4"><label class="form-label">Price per 1000</label><div class="input-group"><span class="input-group-text">₹</span><input type="number" class="form-control" id="pricePer1000" value="${s?.sellRate || ""}" placeholder="40.00"></div></div>
        </div>
        <div class="price-preview">
          <div class="pp"><div class="pp-label">Provider Cost</div><div class="pp-val" id="ppCost">${money(s?.provRate || 0)}</div></div>
          <div class="pp"><div class="pp-label">Customer Price</div><div class="pp-val" id="ppPrice">${money(s?.sellRate || 0)}</div></div>
          <div class="pp margin"><div class="pp-label">Estimated Margin</div><div class="pp-val" id="ppMargin">${money((s?.sellRate || 0) - (s?.provRate || 0))}</div></div>
        </div></div>
      </div>

      <div class="form-section">${secHead("fa-hashtag", "ic-teal", "E · Quantity", "Order size limits")}
        <div class="fs-body">
          <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="qtyEnabled" checked><label class="form-check-label" for="qtyEnabled">Quantity Enabled</label></div>
          <div class="row g-3 conditional-block show" id="qtyBlock">
            <div class="col-md-6"><label class="form-label">Minimum Quantity</label><input type="number" class="form-control" id="minQty" value="${s?.min || 100}"></div>
            <div class="col-md-6"><label class="form-label">Maximum Quantity</label><input type="number" class="form-control" id="maxQty" value="${s?.max || 50000}"></div>
          </div>
        </div>
      </div>

      <div class="form-section">${secHead("fa-toggle-on", "ic-blue", "F · Service Features", "Toggle capabilities — related settings appear below")}
        <div class="fs-body">
          ${sw("featRefill", "Refill", "Free re-delivery if the count drops", s?.refill)}
          ${sw("featAutoRefill", "Auto Refill", "Automatically refill drops without a request", s?.autoRefill)}
          ${sw("featCancel", "Cancel", "Allow order cancellation", s?.cancel)}
          ${sw("featAutoComplete", "Auto Complete", "Mark complete when target reached", s?.autoComplete)}
          ${sw("featNonDrop", "Non Drop", "Guaranteed non-dropping delivery", s?.nonDrop)}
          ${sw("featCountry", "Country Targeting", "Deliver from specific countries", s?.country)}
          ${sw("featDripfeed", "Drip-feed", "Split delivery into timed runs", s?.dripfeed)}
          ${sw("featSubscription", "Subscription", "Recurring auto-orders", s?.subscription)}
        </div>
      </div>

      <div class="form-section conditional-block" id="secRefill">${secHead("fa-rotate", "ic-green", "G · Refill Settings", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-3"><label class="form-label">Refill Days</label><input type="number" class="form-control" value="30"></div>
          <div class="col-md-3"><label class="form-label">Refill Period</label><select class="form-select"><option>Days</option><option>Hours</option></select></div>
          <div class="col-md-3"><label class="form-label">Refill Limit</label><input type="number" class="form-control" value="3"></div>
          <div class="col-md-3"><label class="form-label">Max Refill Attempts</label><input type="number" class="form-control" value="5"></div>
        </div></div>
      </div>

      <div class="form-section conditional-block" id="secAutoRefill">${secHead("fa-arrows-rotate", "ic-teal", "H · Auto Refill", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-4"><label class="form-label">Auto Refill Period</label><input type="number" class="form-control" value="24" placeholder="Hours"></div>
          <div class="col-md-4"><label class="form-label">Auto Refill Limit</label><input type="number" class="form-control" value="10"></div>
          <div class="col-md-4"><label class="form-label">Max Attempts</label><input type="number" class="form-control" value="5"></div>
        </div></div>
      </div>

      <div class="form-section conditional-block" id="secCancel">${secHead("fa-xmark", "ic-red", "I · Cancel", "")}
        <div class="fs-body"><div class="row g-3 align-items-end">
          <div class="col-md-6"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="allowUserCancel" checked><label class="form-check-label" for="allowUserCancel">Allow User Cancellation</label></div></div>
          <div class="col-md-6"><label class="form-label">Cancellation Time Limit (minutes)</label><input type="number" class="form-control" value="30"></div>
        </div></div>
      </div>

      <div class="form-section conditional-block" id="secCountry">${secHead("fa-earth-asia", "ic-blue", "J · Country Targeting", "Hold Ctrl / Cmd to select multiple")}
        <div class="fs-body">
          <select class="form-select" id="countrySelect" multiple size="5">${countryChips}</select>
          <div class="d-flex flex-wrap gap-2 mt-2" id="countryChips"></div>
        </div>
      </div>

      <div class="form-section conditional-block" id="secNonDrop">${secHead("fa-shield-halved", "ic-green", "K · Non Drop", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-6"><label class="form-label">Guaranteed Retention</label><select class="form-select"><option>30 Days</option><option>60 Days</option><option>Lifetime</option></select></div>
          <div class="col-md-6"><label class="form-label">Minimum Retention (%)</label><input type="number" class="form-control" value="95"></div>
        </div></div>
      </div>

      <div class="form-section conditional-block" id="secAutoComplete">${secHead("fa-circle-check", "ic-green", "L · Auto Complete", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-6"><label class="form-label">Completion Condition</label><select class="form-select"><option>On target reached</option><option>On provider complete</option></select></div>
          <div class="col-md-6"><label class="form-label">Auto-complete Threshold (%)</label><input type="number" class="form-control" value="98"></div>
        </div></div>
      </div>

      <div class="form-section">${secHead("fa-truck-fast", "ic-amber", "M · Delivery Information", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-6"><label class="form-label">Average Time</label><select class="form-select" id="avgTime"><option ${s?.speed === "1-2 Hours" ? "selected" : ""}>1-2 Hours</option><option ${s?.speed === "2-4 Hours" ? "selected" : ""}>2-4 Hours</option><option ${s?.speed === "6-12 Hours" ? "selected" : ""}>6-12 Hours</option><option ${s?.speed === "1-2 Days" ? "selected" : ""}>1-2 Days</option></select></div>
          <div class="col-md-6"><label class="form-label">Speed</label><select class="form-select"><option>Slow</option><option selected>Normal</option><option>Fast</option><option>Very Fast</option></select></div>
        </div></div>
      </div>

      <div class="form-section">${secHead("fa-link", "ic-blue", "N · Order Input", "Customer-facing input field type")}
        <div class="fs-body"><label class="form-label">Link Type</label><select class="form-select"><option>Link</option><option>Username</option><option>Profile URL</option><option>Post URL</option><option>Video URL</option><option>Channel URL</option><option>Custom</option></select></div>
      </div>

      <div class="form-section conditional-block" id="secDripfeed">${secHead("fa-faucet-drip", "ic-teal", "O · Drip-feed", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-4"><label class="form-label">Runs</label><input type="number" class="form-control" id="dfRuns" value="10"></div>
          <div class="col-md-4"><label class="form-label">Interval (minutes)</label><input type="number" class="form-control" value="60"></div>
          <div class="col-md-4"><label class="form-label">Quantity Per Run</label><input type="number" class="form-control" id="dfQty" value="100"></div>
        </div><div class="form-text mt-2">Total Quantity = Quantity Per Run × Runs = <b id="dfTotal">1,000</b></div></div>
      </div>

      <div class="form-section conditional-block" id="secPackage">${secHead("fa-box", "ic-purple", "P · Package Settings", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-6"><label class="form-label">Package Name</label><input class="form-control" placeholder="Starter Pack"></div>
          <div class="col-md-6"><label class="form-label">Package Price</label><div class="input-group"><span class="input-group-text">₹</span><input type="number" class="form-control" value="199"></div></div>
          <div class="col-md-6"><label class="form-label">Package Quantity</label><input type="number" class="form-control" value="5000"></div>
          <div class="col-md-6"><label class="form-label">Package Description</label><input class="form-control" placeholder="Short description"></div>
        </div></div>
      </div>

      <div class="form-section conditional-block" id="secSubscription">${secHead("fa-repeat", "ic-purple", "Q · Subscription Settings", "")}
        <div class="fs-body"><div class="row g-3">
          <div class="col-md-4"><label class="form-label">Subscription Interval</label><select class="form-select"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
          <div class="col-md-4"><label class="form-label">Subscription Duration</label><input type="number" class="form-control" value="30" placeholder="Days"></div>
          <div class="col-md-4"><label class="form-label">Runs</label><input type="number" class="form-control" value="30"></div>
          <div class="col-md-6"><label class="form-label">Minimum Quantity</label><input type="number" class="form-control" value="100"></div>
          <div class="col-md-6"><label class="form-label">Maximum Quantity</label><input type="number" class="form-control" value="5000"></div>
        </div></div>
      </div>

      <div class="form-section">${secHead("fa-users-gear", "ic-gray", "R · User Group Pricing", "Override price per 1000 by group")}
        <div class="fs-body"><div class="table-responsive"><table class="table mb-0"><thead><tr><th>User Group</th><th>Price / 1000</th></tr></thead><tbody>
          ${MOCK.groups.map((g, i) => `<tr><td class="cell-strong">${g}</td><td style="max-width:160px"><div class="input-group input-group-sm"><span class="input-group-text">₹</span><input type="number" class="form-control" value="${[40, 38, 35, 32][i]}"></div></td></tr>`).join("")}
        </tbody></table></div></div>
      </div>

      <div class="form-section">${secHead("fa-eye", "ic-blue", "S · User Display Options", "")}
        <div class="fs-body"><div class="row g-2">
          ${["Show Description", "Show Average Time", "Show Refill Badge", "Show Cancel Badge", "Show Service ID", "Show Minimum/Maximum"].map((l, i) => `<div class="col-md-6"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="disp${i}" ${i < 4 ? "checked" : ""}><label class="form-check-label" for="disp${i}">${l}</label></div></div>`).join("")}
        </div></div>
      </div>

      <div class="form-section">${secHead("fa-arrow-down-1-9", "ic-gray", "T · Service Sorting", "Auto-updates when you drag services")}
        <div class="fs-body"><label class="form-label">Service Sort Order</label><input type="number" class="form-control" value="${s?.sort || 1}" style="max-width:160px"></div>
      </div>

      <div class="form-section">${secHead("fa-lock", "ic-amber", "U · Internal Notes", "")}
        <div class="fs-body"><textarea class="form-control" rows="2" placeholder="Internal admin notes…"></textarea><div class="form-text mt-1">These notes are hidden from customers.</div></div>
      </div>

    </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
      <button class="btn btn-light" id="svcSaveAnother" data-testid="svc-save-another">Save &amp; Add Another</button>
      <button class="btn btn-primary" id="svcSave" data-testid="svc-save-btn"><i class="fa-solid fa-floppy-disk"></i>Save Service</button>
    </div>
  </div>`;
}
function bindServiceForm(el) {
  const toggle = (checkboxId, sectionId) => {
    const cb = qs("#" + checkboxId, el), sec = qs("#" + sectionId, el);
    if (!cb || !sec) return;
    const upd = () => sec.classList.toggle("show", cb.checked);
    cb.addEventListener("change", upd); upd();
  };
  toggle("featRefill", "secRefill");
  toggle("featAutoRefill", "secAutoRefill");
  toggle("featCancel", "secCancel");
  toggle("featCountry", "secCountry");
  toggle("featNonDrop", "secNonDrop");
  toggle("featAutoComplete", "secAutoComplete");
  toggle("featDripfeed", "secDripfeed");

  // type-based sections
  const typeSel = qs("#svcType", el);
  const updType = () => {
    qs("#secPackage", el).classList.toggle("show", typeSel.value === "Package");
    qs("#secSubscription", el).classList.toggle("show", typeSel.value === "Subscription");
  };
  typeSel.addEventListener("change", updType); updType();

  // subscription feature switch also drives section
  qs("#featSubscription", el)?.addEventListener("change", (e) => { if (e.target.checked) { typeSel.value = "Subscription"; updType(); } });

  // quantity
  const qtyCb = qs("#qtyEnabled", el);
  qtyCb.addEventListener("change", () => qs("#qtyBlock", el).classList.toggle("show", qtyCb.checked));

  // pricing preview
  const upPrice = () => {
    const c = Number(qs("#provRate", el).value) || 0;
    const p = Number(qs("#sellRate", el).value) || 0;
    qs("#ppCost", el).textContent = money(c);
    qs("#ppPrice", el).textContent = money(p);
    qs("#ppMargin", el).textContent = money(p - c);
  };
  qs("#provRate", el).addEventListener("input", upPrice);
  qs("#sellRate", el).addEventListener("input", upPrice);

  // dripfeed total
  const upDrip = () => {
    const r = Number(qs("#dfRuns", el).value) || 0;
    const q = Number(qs("#dfQty", el).value) || 0;
    qs("#dfTotal", el).textContent = (r * q).toLocaleString("en-IN");
  };
  qs("#dfRuns", el).addEventListener("input", upDrip);
  qs("#dfQty", el).addEventListener("input", upDrip);

  // country chips
  const csel = qs("#countrySelect", el), chips = qs("#countryChips", el);
  const upChips = () => {
    const sel = Array.from(csel.selectedOptions).map(o => o.value);
    chips.innerHTML = sel.map(c => `<span class="chip">${esc(c)}<span class="chip-x" data-c="${esc(c)}"><i class="fa-solid fa-xmark"></i></span></span>`).join("");
    qsa(".chip-x", chips).forEach(x => x.addEventListener("click", () => {
      Array.from(csel.options).forEach(o => { if (o.value === x.getAttribute("data-c")) o.selected = false; });
      upChips();
    }));
  };
  csel.addEventListener("change", upChips);
}
function openServiceModal(s, targetCat, dup) {
  const { el, modal } = showModal(serviceModalHTML(s, targetCat), "modal-xl");
  bindServiceForm(el);
  const save = (again) => {
    const form = qs("#serviceForm", el);
    if (!validateForm(form)) { toast("error", "Missing fields", "Please fill all required fields."); return; }
    const name = qs("#svcName", el).value;
    if (again) {
      toast("success", "Service saved", `${name} saved. Form ready for the next one.`);
      form.reset(); form.classList.remove("was-validated");
      qsa(".conditional-block", el).forEach(b => { if (!b.id || !["qtyBlock"].includes(b.id)) b.classList.remove("show"); });
      qs("#qtyBlock", el).classList.add("show");
    } else {
      modal.hide();
      toast("success", s && s.id ? "Service updated" : "Service created", `${name} saved successfully.`);
    }
  };
  qs("#svcSave", el).addEventListener("click", () => save(false));
  qs("#svcSaveAnother", el).addEventListener("click", () => save(true));
}
function renderCategoryServiceView() {
  const host = $id("catServiceView");
  if (!host) return;
  const cats = orderedCategories();
  host.innerHTML = cats.map(c => {
    let svcs = MOCK.services.filter(s => s.catId === c.id);
    try { const ord = JSON.parse(localStorage.getItem("admin_service_order_" + c.id)); if (Array.isArray(ord)) { const map = new Map(svcs.map(s => [s.id, s])); const out = ord.map(id => map.get(id)).filter(Boolean); svcs.forEach(s => { if (!out.includes(s)) out.push(s); }); svcs = out; } } catch (e) {}
    return `
    <div class="category-block">
      <div class="cb-head">
        <button class="drag-handle" aria-label="Drag category"><i class="fa-solid fa-grip-vertical"></i></button>
        <div class="flex-grow-1"><div class="cb-title">${esc(c.name)}</div><div class="cb-count">${svcs.length} services</div></div>
        <button class="btn btn-light btn-sm add-svc-btn" data-cat-id="${c.id}"><i class="fa-solid fa-plus"></i>New Service</button>
      </div>
      <div class="cb-body service-sortable" data-cat-id="${c.id}">
        ${svcs.map((s, i) => `
          <div class="service-item sortable-row" data-svc-id="${s.id}">
            <button class="drag-handle" aria-label="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></button>
            <span class="sort-num">${i + 1}</span>
            <div class="flex-grow-1"><div class="si-name">${esc(s.name)}</div><div class="si-meta">${money(s.sellRate)}/1k · Min ${s.min} · Max ${s.max.toLocaleString("en-IN")} · ${esc(s.provider)}</div></div>
            <div class="d-none d-md-flex gap-1">${s.refill ? '<span class="feat-badge feat-yes">Refill</span>' : ""}${s.nonDrop ? '<span class="feat-badge feat-yes">Non Drop</span>' : ""}</div>
            ${badge(s.status)}
            ${serviceActions(s)}
          </div>`).join("")}
      </div>
    </div>`;
  }).join("");

  qsa(".service-sortable", host).forEach(initServiceSortable);
  qsa(".add-svc-btn", host).forEach(b => b.addEventListener("click", () => openServiceModal(null, Number(b.getAttribute("data-cat-id")))));
  host.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const s = MOCK.services.find(x => x.id == a.getAttribute("data-svc-id"));
    handleServiceAction(a.getAttribute("data-action"), s);
  });
}
function initServicesPage() {
  renderServicesTable();
  renderCategoryServiceView();
  attachTableFilter("serviceSearch", "#servicesTable", [{ id: "svcCategoryFilter", col: "category" }, { id: "svcProviderFilter", col: "provider" }, { id: "svcStatusFilter", col: "status" }, { id: "svcTypeFilter", col: "type" }]);
  $id("newServiceBtn")?.addEventListener("click", () => openServiceModal(null));
  $id("newCategoryBtn")?.addEventListener("click", () => openCategoryForm(null));
  $id("importServicesBtn")?.addEventListener("click", () => toast("info", "Import services", "Import wizard opened (demo)."));
}

/* =====================================================================
   PROVIDERS
   ===================================================================== */
function initProvidersPage() {
  const tbody = $id("providersTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.providers.map(p => `
    <tr data-status="${p.status}">
      <td><div class="d-flex align-items-center gap-2"><span class="stat-ic ic-gray" style="width:32px;height:32px;margin:0;font-size:13px"><i class="fa-solid fa-server"></i></span><span class="cell-strong">${esc(p.name)}</span></div></td>
      <td><span class="cell-link" title="${esc(p.url)}">${esc(p.url)}</span></td>
      <td class="cell-mono">${p.services}</td>
      <td class="cell-mono cell-strong">${moneyDec(p.balance)}</td>
      <td>${badge(p.status)}</td>
      <td class="text-muted small">${esc(p.sync)}</td>
      <td class="text-end">${actionMenu([{ key: "view", label: "View", icon: "fa-eye" }, { key: "edit", label: "Edit", icon: "fa-pen" }, { key: "sync", label: "Sync", icon: "fa-arrows-rotate" }, { key: "disable", label: "Disable", icon: "fa-ban" }, { divider: true }, { key: "delete", label: "Delete", icon: "fa-trash", danger: true }], `data-pid="${p.id}"`)}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const p = MOCK.providers.find(x => x.id == a.getAttribute("data-pid"));
    const act = a.getAttribute("data-action");
    if (act === "edit" || act === "view") openProviderForm(p);
    else if (act === "sync") toast("success", "Syncing", `${p.name} services sync started.`);
    else if (act === "disable") confirmAction({ title: "Disable provider?", text: `${p.name} services will be paused.`, onConfirm: () => toast("warning", "Provider disabled", `${p.name} disabled.`) });
    else if (act === "delete") confirmAction({ title: "Delete provider?", onConfirm: () => toast("success", "Provider deleted", `${p.name} removed.`) });
  });
  $id("addProviderBtn")?.addEventListener("click", () => openProviderForm(null));
}
function openProviderForm(p) {
  const editing = !!p;
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">${editing ? "Edit Provider" : "Add Provider"}</div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label">API Name <span class="req">*</span></label><input class="form-control" id="pName" value="${esc(p?.name || "")}" required>
        <label class="form-label mt-3">API URL <span class="req">*</span></label><input class="form-control" id="pUrl" value="${esc(p?.url || "")}" placeholder="https://example-provider.test/api" required>
        <label class="form-label mt-3">API Key <span class="req">*</span></label><input class="form-control" id="pKey" value="${esc(p?.key || "")}" placeholder="demo_api_key_123" required>
        <div class="form-text mt-2"><i class="fa-solid fa-circle-info"></i> Demo only — no real API requests are made.</div>
      </div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="pSave">${editing ? "Save Changes" : "Add Provider"}</button></div>
    </div>`);
  qs("#pSave", el).addEventListener("click", () => {
    const form = el;
    if (!qs("#pName", el).value.trim() || !qs("#pUrl", el).value.trim()) { toast("error", "Missing fields", "Name and URL are required."); return; }
    modal.hide(); toast("success", editing ? "Provider updated" : "Provider added", "Saved successfully.");
  });
}

/* =====================================================================
   PAYMENTS
   ===================================================================== */
function initPaymentsPage() {
  const tbody = $id("paymentsTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.payments.map(p => `
    <tr data-status="${p.status}" data-method="${p.method}">
      <td class="cell-mono">${esc(p.id)}</td>
      <td class="cell-strong">${esc(p.user)}</td>
      <td class="cell-mono cell-strong">${money(p.amount)}</td>
      <td><span class="feat-badge">${esc(p.method)}</span></td>
      <td>${badge(p.status)}</td>
      <td class="text-muted small">${esc(p.date)}</td>
      <td class="text-end">${actionMenu([{ key: "view", label: "View", icon: "fa-eye" }, { key: "approve", label: "Approve", icon: "fa-check" }, { key: "reject", label: "Reject", icon: "fa-xmark", danger: true }], "")}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const act = a.getAttribute("data-action");
    if (act === "approve") toast("success", "Payment approved", "Transaction approved (demo).");
    else if (act === "reject") confirmAction({ title: "Reject payment?", onConfirm: () => toast("warning", "Payment rejected", "Transaction rejected.") });
    else toast("info", "Transaction", "Viewing transaction (demo).");
  });
  attachTableFilter("paymentSearch", "#paymentsTable", [{ id: "payMethodFilter", col: "method" }, { id: "payStatusFilter", col: "status" }]);
}

/* =====================================================================
   TICKETS
   ===================================================================== */
function initTicketsPage() {
  const tbody = $id("ticketsTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.tickets.map(t => `
    <tr data-status="${t.status}" data-priority="${t.priority}" data-tid="${t.id}">
      <td class="cell-mono">${esc(t.id)}</td>
      <td class="cell-strong">${esc(t.user)}</td>
      <td>${esc(t.subject)}</td>
      <td><span class="feat-badge ${t.priority === "High" ? "feat-yes" : ""}" style="${t.priority === "High" ? "background:var(--c-red-bg);color:var(--c-red)" : ""}">${esc(t.priority)}</span></td>
      <td>${badge(t.status)}</td>
      <td class="text-muted small">${esc(t.lastReply)}</td>
      <td class="text-muted small">${esc(t.created)}</td>
      <td class="text-end">${actionMenu([{ key: "open", label: "Open Ticket", icon: "fa-eye" }, { key: "close", label: "Close Ticket", icon: "fa-lock" }, { divider: true }, { key: "delete", label: "Delete", icon: "fa-trash", danger: true }], `data-tid="${t.id}"`)}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const rowOpen = e.target.closest(".ticket-open");
    const a = e.target.closest("[data-action]");
    const tid = (a || rowOpen)?.getAttribute("data-tid");
    const t = MOCK.tickets.find(x => x.id === tid);
    if (a) {
      e.preventDefault();
      const act = a.getAttribute("data-action");
      if (act === "open") openTicketModal(t);
      else if (act === "close") toast("success", "Ticket closed", `${tid} closed.`);
      else if (act === "delete") confirmAction({ title: "Delete ticket?", onConfirm: () => toast("success", "Ticket deleted", `${tid} deleted.`) });
    }
  });
  attachTableFilter("ticketSearch", "#ticketsTable", [{ id: "ticketStatusFilter", col: "status" }, { id: "ticketPriorityFilter", col: "priority" }]);
}
function openTicketModal(t) {
  const thread = t.thread.map(m => `
    <div class="ticket-msg ${m.who}">
      <span class="avatar">${m.who === "admin" ? "AD" : initials(t.user)}</span>
      <div><div class="tm-body">${esc(m.text)}</div><div class="tm-time">${m.who === "admin" ? "Admin" : esc(t.user)} · ${esc(m.time)}</div></div>
    </div>`).join("");
  const { el, modal } = showModal(`
    <div class="modal-content">
      <div class="modal-header"><div class="modal-title">${esc(t.subject)}<span class="mt-sub">${esc(t.id)} · ${esc(t.user)} · ${badge(t.status)}</span></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body"><div class="ticket-thread">${thread}</div><label class="form-label mt-2">Reply</label><textarea class="form-control" id="ticketReply" rows="3" placeholder="Type your response…"></textarea></div>
      <div class="modal-footer"><button class="btn btn-outline-secondary" id="tkClose"><i class="fa-solid fa-lock"></i>Close Ticket</button><button class="btn btn-primary" id="tkReply"><i class="fa-solid fa-paper-plane"></i>Send Reply</button></div>
    </div>`, "modal-lg");
  qs("#tkReply", el).addEventListener("click", () => {
    const val = qs("#ticketReply", el).value.trim();
    if (!val) { qs("#ticketReply", el).classList.add("is-invalid"); return; }
    const thr = qs(".ticket-thread", el);
    const div = document.createElement("div");
    div.className = "ticket-msg admin";
    div.innerHTML = `<span class="avatar">AD</span><div><div class="tm-body">${esc(val)}</div><div class="tm-time">Admin · just now</div></div>`;
    thr.appendChild(div); thr.scrollTop = thr.scrollHeight;
    qs("#ticketReply", el).value = "";
    toast("success", "Reply sent", "Your response was sent.");
  });
  qs("#tkClose", el).addEventListener("click", () => { modal.hide(); toast("success", "Ticket closed", `${t.id} closed.`); });
}

/* =====================================================================
   REPORTS
   ===================================================================== */
function initReportsPage() {
  drawBarChart("reportOrdersChart", [{ l: "Mon", v: 62 }, { l: "Tue", v: 78 }, { l: "Wed", v: 55 }, { l: "Thu", v: 90 }, { l: "Fri", v: 72 }, { l: "Sat", v: 84 }, { l: "Sun", v: 68 }]);
  drawBarChart("reportRevenueChart", [{ l: "Jan", v: 40 }, { l: "Feb", v: 55 }, { l: "Mar", v: 48 }, { l: "Apr", v: 70 }, { l: "May", v: 82 }, { l: "Jun", v: 95 }]);
  const topSvc = $id("topServicesBody");
  if (topSvc) topSvc.innerHTML = MOCK.services.slice(0, 6).map((s, i) => `<tr><td class="cell-strong">${esc(s.name)}</td><td class="cell-mono">${(500 - i * 60)}</td><td class="cell-mono cell-strong">${money((500 - i * 60) * s.sellRate / 10)}</td></tr>`).join("");
  const topUsers = $id("topUsersBody");
  if (topUsers) topUsers.innerHTML = [...MOCK.users].sort((a, b) => b.spent - a.spent).slice(0, 6).map(u => `<tr><td><div class="d-flex align-items-center gap-2"><span class="avatar">${initials(u.username)}</span>${esc(u.username)}</div></td><td class="cell-mono">${u.orders}</td><td class="cell-mono cell-strong">${money(u.spent)}</td></tr>`).join("");
  const prov = $id("providerPerfBody");
  if (prov) prov.innerHTML = MOCK.providers.map(p => `<tr><td class="cell-strong">${esc(p.name)}</td><td class="cell-mono">${p.services}</td><td>${badge(p.status)}</td><td class="cell-mono cell-strong">${moneyDec(p.balance)}</td></tr>`).join("");
}

/* =====================================================================
   AFFILIATES
   ===================================================================== */
function initAffiliatesPage() {
  const tbody = $id("affiliatesTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.affiliates.map(a => `
    <tr data-status="${a.status}">
      <td><div class="d-flex align-items-center gap-2"><span class="avatar">${initials(a.user)}</span><span class="cell-strong">${esc(a.user)}</span></div></td>
      <td class="cell-mono">${a.refs}</td>
      <td class="cell-mono cell-strong">${money(a.earnings)}</td>
      <td>${badge(a.status)}</td>
      <td class="text-muted small">${esc(a.joined)}</td>
      <td class="text-end">${actionMenu([{ key: "view", label: "View", icon: "fa-eye" }, { key: "pay", label: "Pay Earnings", icon: "fa-money-bill" }, { key: "disable", label: "Disable", icon: "fa-ban", danger: true }], "")}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const act = a.getAttribute("data-action");
    if (act === "pay") toast("success", "Earnings paid", "Affiliate earnings paid out (demo).");
    else if (act === "disable") confirmAction({ title: "Disable affiliate?", onConfirm: () => toast("warning", "Affiliate disabled", "Affiliate disabled.") });
    else toast("info", "Affiliate", "Viewing affiliate (demo).");
  });
  attachTableFilter("affiliateSearch", "#affiliatesTable", [{ id: "affStatusFilter", col: "status" }]);
}

/* =====================================================================
   CHILD PANELS
   ===================================================================== */
function initChildPanelsPage() {
  const tbody = $id("childPanelsTableBody");
  if (!tbody) return;
  tbody.innerHTML = MOCK.childPanels.map(c => `
    <tr data-status="${c.status}">
      <td class="cell-strong">${esc(c.name)}</td>
      <td>${esc(c.owner)}</td>
      <td><span class="cell-link">${esc(c.domain)}</span></td>
      <td>${badge(c.status)}</td>
      <td class="cell-mono">${c.orders.toLocaleString("en-IN")}</td>
      <td class="text-muted small">${esc(c.created)}</td>
      <td class="text-end">${actionMenu([{ key: "view", label: "View", icon: "fa-eye" }, { key: "edit", label: "Edit", icon: "fa-pen" }, { key: "disable", label: "Disable", icon: "fa-ban" }, { divider: true }, { key: "delete", label: "Delete", icon: "fa-trash", danger: true }], "")}</td>
    </tr>`).join("");
  tbody.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return; e.preventDefault();
    const act = a.getAttribute("data-action");
    if (act === "delete") confirmAction({ title: "Delete child panel?", onConfirm: () => toast("success", "Panel deleted", "Child panel removed.") });
    else if (act === "disable") confirmAction({ title: "Disable child panel?", onConfirm: () => toast("warning", "Panel disabled", "Child panel disabled.") });
    else toast("info", "Child panel", "Action performed (demo).");
  });
  attachTableFilter("childPanelSearch", "#childPanelsTable", [{ id: "cpStatusFilter", col: "status" }]);
}

/* =====================================================================
   APPEARANCE
   ===================================================================== */
function initAppearancePage() {
  const swatches = qsa(".color-swatch");
  swatches.forEach(sw => sw.addEventListener("click", () => {
    swatches.forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
    const color = sw.getAttribute("data-color");
    qsa(".ap-navbar, #previewBtn").forEach(el => { el.style.background = color; });
    const cp = $id("primaryColorInput"); if (cp) cp.value = color;
  }));
  $id("primaryColorInput")?.addEventListener("input", (e) => {
    qsa(".ap-navbar, #previewBtn").forEach(el => { el.style.background = e.target.value; });
  });
  $id("saveAppearanceBtn")?.addEventListener("click", () => toast("success", "Appearance saved", "Your branding settings were saved."));
  $id("panelNameInput")?.addEventListener("input", (e) => { const n = $id("apName"); if (n) n.textContent = e.target.value || "Panel Name"; });
}

/* =====================================================================
   SETTINGS
   ===================================================================== */
function initSettingsPage() {
  const items = qsa(".settings-nav .list-group-item");
  items.forEach(it => it.addEventListener("click", () => {
    items.forEach(i => i.classList.remove("active"));
    it.classList.add("active");
    const target = it.getAttribute("data-target");
    qsa(".settings-panel").forEach(p => p.classList.add("d-none"));
    $id(target)?.classList.remove("d-none");
  }));
  qsa("[data-save-settings]").forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); toast("success", "Settings saved", "Your changes have been saved."); }));
}

/* =====================================================================
   DASHBOARD
   ===================================================================== */
function drawBarChart(id, data) {
  const host = $id(id);
  if (!host) return;
  const max = Math.max(...data.map(d => d.v), 1);
  const H = 170;
  host.classList.add("bar-chart");
  host.innerHTML = data.map(d => `<div class="bar-col"><div class="bar" style="height:${Math.max(6, Math.round((d.v / max) * H))}px"></div><div class="bar-label">${d.l}</div></div>`).join("");
}
function initDashboardPage() {
  drawBarChart("ordersChart", [{ l: "Mon", v: 62 }, { l: "Tue", v: 78 }, { l: "Wed", v: 55 }, { l: "Thu", v: 90 }, { l: "Fri", v: 72 }, { l: "Sat", v: 84 }, { l: "Sun", v: 68 }]);
  const ro = $id("recentOrdersBody");
  if (ro) ro.innerHTML = MOCK.orders.slice(0, 6).map(o => `
    <tr><td class="cell-mono">#${o.id}</td><td class="cell-strong">${esc(o.user)}</td><td><div class="text-truncate" style="max-width:150px">${esc(o.service)}</div></td><td class="cell-mono">${o.qty.toLocaleString("en-IN")}</td><td class="cell-mono">${moneyDec(o.charge)}</td><td>${badge(o.status)}</td><td class="text-muted small">${esc(o.created)}</td><td class="text-end"><button class="action-btn" onclick="location.href='admin-orders.html'" aria-label="View"><i class="fa-solid fa-arrow-right"></i></button></td></tr>`).join("");
  const ru = $id("recentUsersBody");
  if (ru) ru.innerHTML = MOCK.users.slice(0, 6).map(u => `
    <tr><td class="cell-mono">#${u.id}</td><td><div class="d-flex align-items-center gap-2"><span class="avatar">${initials(u.username)}</span>${esc(u.username)}</div></td><td class="text-muted">${esc(u.email)}</td><td class="cell-mono cell-strong">${money(u.balance)}</td><td class="cell-mono">${u.orders}</td><td>${badge(u.status)}</td><td class="text-muted small">${esc(u.created)}</td><td class="text-end"><button class="action-btn" onclick="location.href='admin-users.html'" aria-label="View"><i class="fa-solid fa-arrow-right"></i></button></td></tr>`).join("");

  // quick actions
  const map = { "qaAddUser": () => openUserForm(null), "qaAddService": () => openServiceModal(null), "qaAddCategory": () => openCategoryForm(null), "qaAddProvider": () => openProviderForm(null), "qaViewOrders": () => location.href = "admin-orders.html" };
  Object.entries(map).forEach(([id, fn]) => $id(id)?.addEventListener("click", fn));
}

/* =====================================================================
   FORM VALIDATION
   ===================================================================== */
function validateForm(form) {
  if (!form) return true;
  let ok = true;
  qsa("[required]", form).forEach(f => {
    if (!f.value.trim()) { f.classList.add("is-invalid"); ok = false; }
    else f.classList.remove("is-invalid");
  });
  form.classList.add("was-validated");
  return ok;
}

/* =====================================================================
   BOOTSTRAP
   ===================================================================== */
function bootAdmin() {
  renderLayout();
  initDarkMode();
  initNotifications();
  initSearch();
  initLogout();

  const page = document.body.getAttribute("data-page");
  const inits = {
    dashboard: initDashboardPage,
    users: initUsersPage,
    orders: initOrdersPage,
    tasks: initTasksPage,
    services: initServicesPage,
    categories: initCategoriesPage,
    providers: initProvidersPage,
    payments: initPaymentsPage,
    tickets: initTicketsPage,
    reports: initReportsPage,
    affiliates: initAffiliatesPage,
    "child-panels": initChildPanelsPage,
    appearance: initAppearancePage,
    settings: initSettingsPage,
  };
  try { inits[page] && inits[page](); } catch (e) { console.error("Page init error:", e); }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAdmin);
} else {
  bootAdmin();
}
