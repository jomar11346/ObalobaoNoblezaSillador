class MonthlySaleData {
  MonthlySaleData({
    required this.id,
    required this.yearMonth,
    required this.label,
    required this.amount,
    required this.orderCount,
  });

  final int id;
  final String yearMonth;
  final String label;
  final double amount;
  final int orderCount;

  factory MonthlySaleData.fromJson(Map<String, dynamic> json) {
    return MonthlySaleData(
      id: (json['monthly_sale_id'] as num?)?.toInt() ?? 0,
      yearMonth: (json['year_month'] as String?) ?? '',
      label: (json['label'] as String?) ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '') ?? 0.0,
      orderCount: (json['order_count'] as num?)?.toInt() ?? 0,
    );
  }
}

class DailySaleData {
  DailySaleData({
    required this.id,
    required this.saleDate,
    required this.amount,
    required this.notes,
    required this.source,
  });

  final int id;
  final DateTime? saleDate;
  final double amount;
  final String notes;
  final String source;

  factory DailySaleData.fromJson(Map<String, dynamic> json) {
    return DailySaleData(
      id: (json['daily_sale_id'] as num?)?.toInt() ?? 0,
      saleDate: DateTime.tryParse(json['sale_date']?.toString() ?? ''),
      amount: double.tryParse(json['amount']?.toString() ?? '') ?? 0.0,
      notes: (json['notes'] as String?) ?? '',
      source: (json['source'] as String?) ?? 'manual',
    );
  }
}
