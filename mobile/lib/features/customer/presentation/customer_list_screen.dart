import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../data/customer_repository.dart';
import '../domain/customer.dart';
import 'customer_form_screen.dart';

class CustomerListScreen extends ConsumerStatefulWidget {
  const CustomerListScreen({super.key});

  @override
  CustomerListScreenState createState() => CustomerListScreenState();
}

class CustomerListScreenState extends ConsumerState<CustomerListScreen> {
  final _searchController = TextEditingController();
  bool _loading = false;
  String _errorMessage = '';
  String _searchText = '';
  int _currentPage = 1;
  CustomersPage? _loadedPage;

  @override
  void initState() {
    super.initState();
    _loadCustomers(page: 1);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadCustomers({int page = 1}) async {
    setState(() {
      _loading = true;
      _errorMessage = '';
    });

    final repository = ref.read(customerRepositoryProvider);

    try {
      final result = await repository.fetchCustomers(
        search: _searchText,
        page: page,
      );
      setState(() {
        _loadedPage = result;
        _currentPage = result.currentPage;
      });
    } catch (error) {
      setState(() {
        _errorMessage = 'Unable to load customers: $error';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _openCustomerForm([Customer? customer]) async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => CustomerFormScreen(customer: customer)),
    );

    if (changed == true) {
      await _loadCustomers(page: _currentPage);
    }
  }

  Future<void> _deleteCustomer(Customer customer) async {
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Delete Customer'),
            content: Text(
              'Delete ${customer.name}? This action cannot be undone.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Delete'),
              ),
            ],
          ),
        ) ??
        false;

    if (!confirmed) {
      return;
    }

    try {
      await ref.read(customerRepositoryProvider).deleteCustomer(customer.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Customer deleted successfully.')),
      );
      await _loadCustomers(page: _currentPage);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to delete: $error')));
    }
  }

  Widget _buildCustomerCard(Customer customer) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    customer.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit),
                  tooltip: 'Edit',
                  onPressed: () => _openCustomerForm(customer),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline),
                  tooltip: 'Delete',
                  onPressed: () => _deleteCustomer(customer),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Contact: ${customer.contact}'),
            const SizedBox(height: 4),
            Text('Address: ${customer.address}'),
            if (customer.email != null && customer.email!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text('Email: ${customer.email}'),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Customers',
      actions: [
        IconButton(
          icon: const Icon(Icons.add),
          tooltip: 'New Customer',
          onPressed: () => _openCustomerForm(),
        ),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              labelText: 'Search Customers',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isEmpty
                  ? null
                  : IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          _searchText = '';
                        });
                        _loadCustomers(page: 1);
                      },
                    ),
            ),
            textInputAction: TextInputAction.search,
            onChanged: (_) => setState(() {}),
            onSubmitted: (value) {
              _searchText = value.trim();
              _loadCustomers(page: 1);
            },
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage.isNotEmpty
                ? Center(child: Text(_errorMessage))
                : _loadedPage == null || _loadedPage!.items.isEmpty
                ? const Center(child: Text('No customers found.'))
                : ListView.separated(
                    itemCount: _loadedPage!.items.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 8),
                    itemBuilder: (context, index) =>
                        _buildCustomerCard(_loadedPage!.items[index]),
                  ),
          ),
          if (_loadedPage != null && _loadedPage!.items.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  FilledButton.tonal(
                    onPressed: _loadedPage!.hasPrevious
                        ? () => _loadCustomers(page: _currentPage - 1)
                        : null,
                    child: const Text('Previous'),
                  ),
                  Text(
                    'Page ${_loadedPage!.currentPage} / ${_loadedPage!.lastPage}',
                  ),
                  FilledButton.tonal(
                    onPressed: _loadedPage!.hasNext
                        ? () => _loadCustomers(page: _currentPage + 1)
                        : null,
                    child: const Text('Next'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
