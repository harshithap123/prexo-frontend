export const authRoles = {
    Mis: ['MIS'], // Only Super Admin has access
    admin: ['super-admin'], // Only SA & Admin has access
    Warehouse: ['Warehouse'], // Only SA & Admin & Editor has access
    bot: ['Bag Opening'], // Everyone has access
    sorting: ['Sorting Agent'],
    charging: ['Charging'],
    bqc: ['BQC'],
    audit: ['Audit'],
    RDL_FLS: ['RDL-FLS'],
    Sales_Agent: ['Sales Agent'],
    pricing_Agent: ['Pricing Agent'],
    reporting: ['Reporting'],
    RDL_2: ['RDL-two'],
    RMWAREHOUSE: ['SP User'],
    SPMIS:['Sp mis'],
    PURCHASERM:['Purchase RM']
}

// Check out app/views/dashboard/DashboardRoutes.js
// Only SA & Admin has dashboard access

// const dashboardRoutes = [
//   {
//     path: "/dashboard/analytics",
//     component: Analytics,
//     auth: authRoles.admin <===============
//   }
// ];

// Check navigaitons.js

// {
//   name: "Dashboard",
//   path: "/dashboard/analytics",
//   icon: "dashboard",
//   auth: authRoles.admin <=================
// }
