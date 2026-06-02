import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/dio_client.dart';
import '../domain/customer.dart';
import 'customer_api.dart';

final customerRepositoryProvider = Provider<CustomerRepository>((ref) {
  final dio = ref.read(dioProvider);
  return CustomerRepository(CustomerApi(dio));
});

class CustomersPage {
  CustomersPage({
    required this.items,
    required this.currentPage,
    required this.lastPage,
    required this.total,
    required this.perPage,
  });

  final List<Customer> items;
  final int currentPage;
  final int lastPage;
  final int total;
  final int perPage;

  bool get hasNext => currentPage < lastPage;
  bool get hasPrevious => currentPage > 1;
}

class CustomerRepository {
  CustomerRepository(this._api);

  final CustomerApi _api;

  Future<CustomersPage> fetchCustomers({String? search, int page = 1}) async {
    final response = await _api.loadCustomers(search: search, page: page);
    final payload = response.data ?? <String, dynamic>{};
    final rawPagination =
        (payload['customers'] as Map<String, dynamic>?) ?? <String, dynamic>{};

    final items = <Customer>[];
    final rawItems = rawPagination['data'] as List<dynamic>?;
    if (rawItems != null) {
      for (final rawItem in rawItems) {
        if (rawItem is Map<String, dynamic>) {
          items.add(Customer.fromJson(rawItem));
        }
      }
    }

    return CustomersPage(
      items: items,
      currentPage: (rawPagination['current_page'] as num?)?.toInt() ?? 1,
      lastPage: (rawPagination['last_page'] as num?)?.toInt() ?? 1,
      total: (rawPagination['total'] as num?)?.toInt() ?? 0,
      perPage: (rawPagination['per_page'] as num?)?.toInt() ?? 15,
    );
  }

  Future<void> storeCustomer({
    required String name,
    required String contact,
    required String address,
    String? email,
  }) async {
    await _api.storeCustomer(
      name: name,
      contact: contact,
      address: address,
      email: email,
    );
  }

  Future<Customer> updateCustomer({
    required int customerId,
    required String name,
    required String contact,
    required String address,
    String? email,
  }) async {
    final response = await _api.updateCustomer(
      customerId: customerId,
      name: name,
      contact: contact,
      address: address,
      email: email,
    );

    final payload = response.data ?? <String, dynamic>{};
    final customerJson =
        (payload['customer'] as Map<String, dynamic>?) ?? <String, dynamic>{};
    return Customer.fromJson(customerJson);
  }

  Future<void> deleteCustomer(int customerId) async {
    await _api.destroyCustomer(customerId);
  }
}
