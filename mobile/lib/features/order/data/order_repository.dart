import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/dio_client.dart';
import '../domain/order.dart';
import 'order_api.dart';

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final dio = ref.read(dioProvider);
  return OrderRepository(OrderApi(dio));
});

class OrderRepository {
  OrderRepository(this._api);

  final OrderApi _api;

  Future<List<Order>> fetchOrders({String? search}) async {
    final response = await _api.loadOrders(search: search);
    final payload = response.data ?? <String, dynamic>{};
    final pagination = (payload['orders'] as Map<String, dynamic>?) ?? <String, dynamic>{};
    final rawItems = pagination['data'] as List<dynamic>? ?? const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(Order.fromJson)
        .toList();
  }

  Future<void> createOrder({
    required int customerId,
    required DateTime orderDate,
    required List<OrderItemRequest> items,
  }) async {
    await _api.storeOrder(
      customerId: customerId,
      orderDate: orderDate.toIso8601String().split('T').first,
      items: items.map((e) => e.toJson()).toList(),
    );
  }

  Future<void> changeStatus({
    required int orderId,
    required String status,
  }) async {
    await _api.updateOrderStatus(orderId: orderId, status: status);
  }
}

