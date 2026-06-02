class Order {
  Order({
    required this.id,
    required this.customerName,
    required this.totalAmount,
    required this.status,
    required this.orderDate,
  });

  final int id;
  final String customerName;
  final double totalAmount;
  final String status;
  final DateTime? orderDate;

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: (json['order_id'] as num).toInt(),
      customerName: ((json['customer'] as Map<String, dynamic>?)?['name'] as String?) ?? '',
      totalAmount: double.tryParse(json['total_amount']?.toString() ?? '') ?? 0.0,
      status: (json['status'] as String?) ?? 'Pending',
      orderDate: DateTime.tryParse((json['order_date'] as String?) ?? ''),
    );
  }
}

class OrderItemRequest {
  OrderItemRequest({
    required this.flowerId,
    required this.quantity,
  });

  final int flowerId;
  final int quantity;

  Map<String, dynamic> toJson() => {
        'flower_id': flowerId,
        'quantity': quantity,
      };
}

