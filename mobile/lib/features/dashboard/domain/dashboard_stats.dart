class DashboardStats {
  DashboardStats({
    required this.totalSales,
    required this.pendingOrders,
    required this.lowStockFlowers,
  });

  final num totalSales;
  final int pendingOrders;
  final int lowStockFlowers;

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalSales: num.tryParse(json['total_sales']?.toString() ?? '') ?? 0,
      pendingOrders: (json['pending_orders'] as num?)?.toInt() ?? 0,
      lowStockFlowers: (json['low_stock_flowers'] as num?)?.toInt() ?? 0,
    );
  }
}

