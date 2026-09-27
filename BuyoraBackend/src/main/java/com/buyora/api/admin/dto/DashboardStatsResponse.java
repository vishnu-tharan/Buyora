package com.buyora.api.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record DashboardStatsResponse(
  BigDecimal todaySales,
  int todayOrders,
  int totalCustomers,
  int totalProducts,
  int lowStockCount,
  int pendingOrdersCount,
  List<RecentOrder> recentOrders,
  List<SalesOverview> salesOverview
) {
  public record RecentOrder(String orderNumber, BigDecimal total, String status, Instant createdAt) {}
  public record SalesOverview(String date, BigDecimal revenue, int orders) {}
}
