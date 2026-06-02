import 'package:dio/dio.dart';

class OrderApi {
  OrderApi(this._dio);

  final Dio _dio;

  Future<Response<Map<String, dynamic>>> loadOrders({String? search}) {
    return _dio.get<Map<String, dynamic>>(
      '/api/order/loadOrders',
      queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
  }

  Future<void> storeOrder({
    required int customerId,
    required String orderDate,
    required List<Map<String, dynamic>> items,
  }) async {
    await _dio.post(
      '/api/order/storeOrder',
      data: {
        'customer_id': customerId,
        'order_date': orderDate,
        'items': items,
      },
    );
  }

  Future<void> updateOrderStatus({
    required int orderId,
    required String status,
  }) async {
    await _dio.post(
      '/api/order/updateOrderStatus/$orderId',
      data: {'status': status},
    );
  }
}

