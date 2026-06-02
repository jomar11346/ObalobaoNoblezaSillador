import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../customer/data/customer_repository.dart';
import '../../../customer/domain/customer.dart';

class CustomersTab extends ConsumerStatefulWidget {
  const CustomersTab({super.key});

  @override
  ConsumerState<CustomersTab> createState() => _CustomersTabState();
}

class _CustomersTabState extends ConsumerState<CustomersTab> {
  final _searchController = TextEditingController();
  List<Customer> _customers = const [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load({String? search}) async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final page = await ref.read(customerRepositoryProvider).fetchCustomers(search: search, page: 1);
      setState(() {
        _customers = page.items;
      });
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _addCustomerDialog() async {
    final nameCtrl = TextEditingController();
    final contactCtrl = TextEditingController();
    final addressCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    bool saving = false;

    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setLocalState) => AlertDialog(
          title: const Text('Add Customer'),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 420,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Name')),
                  const SizedBox(height: 12),
                  TextField(controller: contactCtrl, decoration: const InputDecoration(labelText: 'Contact')),
                  const SizedBox(height: 12),
                  TextField(controller: addressCtrl, decoration: const InputDecoration(labelText: 'Address')),
                  const SizedBox(height: 12),
                  TextField(
                    controller: emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email (optional)'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: saving
                  ? null
                  : () async {
                      setLocalState(() => saving = true);
                      try {
                        await ref.read(customerRepositoryProvider).storeCustomer(
                              name: nameCtrl.text.trim(),
                              contact: contactCtrl.text.trim(),
                              address: addressCtrl.text.trim(),
                              email: emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
                            );
                        if (!context.mounted) return;
                        Navigator.pop(context);
                        _load(search: _searchController.text.trim());
                      } finally {
                        if (context.mounted) {
                          setLocalState(() => saving = false);
                        }
                      }
                    },
              child: const Text('SAVE'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerCard(Customer c) {
    final nameParts = c.name.trim().split(RegExp(r'\s+'));
    String initials = '';
    if (nameParts.isNotEmpty && nameParts[0].isNotEmpty) {
      initials += nameParts[0][0];
      if (nameParts.length > 1 && nameParts[1].isNotEmpty) {
        initials += nameParts[1][0];
      }
    }
    initials = initials.toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.22)),
        boxShadow: [
          BoxShadow(
            color: AppColors.charcoal.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Initials Avatar with premium cream/gold style
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1.2),
              ),
              alignment: Alignment.center,
              child: Text(
                initials.isEmpty ? '?' : initials,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.charcoal,
                  letterSpacing: 1,
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Customer Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.phone_outlined, size: 13, color: AppColors.charcoalSoft),
                      const SizedBox(width: 4),
                      Text(
                        c.contact,
                        style: const TextStyle(fontSize: 12, color: AppColors.charcoalSoft),
                      ),
                      const SizedBox(width: 16),
                      const Icon(Icons.location_on_outlined, size: 13, color: AppColors.charcoalSoft),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          c.address,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, color: AppColors.charcoalSoft),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Custom email badge on the right
            if (c.email != null && c.email!.isNotEmpty) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.creamDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.15)),
                ),
                child: Text(
                  c.email!,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: AppColors.charcoalSoft,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Customers', 
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.charcoal,
                      ),
                ),
              ),
              ElevatedButton.icon(
                onPressed: _addCustomerDialog,
                icon: const Icon(Icons.add),
                label: const Text('ADD CUSTOMER'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: 320,
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search customers...',
                prefixIcon: Icon(Icons.search, size: 20),
              ),
              onSubmitted: (value) => _load(search: value.trim()),
            ),
          ),
          const SizedBox(height: 18),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? Center(child: Text(_error))
                    : _customers.isEmpty
                        ? const Center(child: Text('No records found'))
                        : ListView.builder(
                            itemCount: _customers.length,
                            itemBuilder: (context, index) {
                              return _buildCustomerCard(_customers[index]);
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
