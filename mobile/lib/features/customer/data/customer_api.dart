import 'package:dio/dio.dart';

class CustomerApi {
  CustomerApi(this._dio);

  final Dio _dio;

  Future<Response<Map<String, dynamic>>> loadCustomers({
    String? search,
    int page = 1,
  }) {
    return _dio.get<Map<String, dynamic>>(
      '/api/customer/loadCustomers',
      queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
      },
    );
  }

  Future<Response<Map<String, dynamic>>> storeCustomer({
    required String name,
    required String contact,
    required String address,
    String? email,
  }) {
    return _dio.post<Map<String, dynamic>>(
      '/api/customer/storeCustomer',
      data: {
        'name': name,
        'contact': contact,
        'address': address,
        'email': email,
      },
    );
  }

  Future<Response<Map<String, dynamic>>> updateCustomer({
    required int customerId,
    required String name,
    required String contact,
    required String address,
    String? email,
  }) {
    return _dio.post<Map<String, dynamic>>(
      '/api/customer/updateCustomer/$customerId',
      data: {
        'name': name,
        'contact': contact,
        'address': address,
        'email': email,
      },
    );
  }

  Future<Response<Map<String, dynamic>>> destroyCustomer(int customerId) {
    return _dio.put<Map<String, dynamic>>(
      '/api/customer/destroyCustomer/$customerId',
    );
  }
}
