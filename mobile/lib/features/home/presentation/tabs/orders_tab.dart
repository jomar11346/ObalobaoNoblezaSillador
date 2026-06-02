import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../customer/data/customer_repository.dart';
import '../../../customer/domain/customer.dart';
import '../../../flower/data/flower_repository.dart';
import '../../../flower/domain/flower.dart';
import '../../../order/data/order_repository.dart';
import '../../../order/domain/order.dart';

import 'dashboard_tab.dart';

class OrdersTab extends ConsumerStatefulWidget {
  const OrdersTab({super.key});

  @override
  ConsumerState<OrdersTab> createState() => _OrdersTabState();
}

class _OrdersTabState extends ConsumerState<OrdersTab> {
  final _searchController = TextEditingController();
  bool _loading = true;
  String _error = '';
  List<Order> _orders = const [];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders({String? search}) async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final orders = await ref.read(orderRepositoryProvider).fetchOrders(search: search);
      setState(() => _orders = orders);
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _changeStatus(Order order, String status) async {
    await ref.read(orderRepositoryProvider).changeStatus(orderId: order.id, status: status);
    ref.invalidate(dashboardStatsProvider);
    ref.invalidate(monthlySalesProvider);
    ref.invalidate(dailySalesProvider);
    _loadOrders(search: _searchController.text.trim());
  }

  Future<void> _openCreateOrderDialog() async {
    final customersPage = await ref.read(customerRepositoryProvider).fetchCustomers(page: 1);
    final flowers = await ref.read(flowerRepositoryProvider).fetchFlowers();
    if (!mounted) return;
    final created = await showDialog<bool>(
      context: context,
      builder: (_) => _CreateOrderDialog(customers: customersPage.items, flowers: flowers),
    );
    if (created == true) {
      ref.invalidate(dashboardStatsProvider);
      ref.invalidate(monthlySalesProvider);
      ref.invalidate(dailySalesProvider);
      _loadOrders();
    }
  }

  Widget _buildOrderCard(Order order) {
    Color statusColor;
    Color statusBgColor;

    switch (order.status) {
      case 'Completed':
        statusColor = AppColors.success;
        statusBgColor = AppColors.success.withValues(alpha: 0.08);
        break;
      case 'Ready':
        statusColor = AppColors.gold;
        statusBgColor = AppColors.gold.withValues(alpha: 0.12);
        break;
      case 'Confirmed':
        statusColor = const Color(0xFF2563EB); // Modern blue
        statusBgColor = const Color(0xFF2563EB).withValues(alpha: 0.08);
        break;
      case 'Cancelled':
        statusColor = AppColors.danger;
        statusBgColor = AppColors.danger.withValues(alpha: 0.08);
        break;
      case 'Pending':
      default:
        statusColor = const Color(0xFFD97706); // Dark Amber
        statusBgColor = const Color(0xFFD97706).withValues(alpha: 0.08);
        break;
    }

    const statuses = [
      'Pending',
      'Confirmed',
      'Ready',
      'Completed',
      'Cancelled',
    ];

    final dateStr = order.orderDate?.toIso8601String().split('T').first ?? '';

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
            // Order ID circle avatar
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.creamDark,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.25)),
              ),
              alignment: Alignment.center,
              child: Text(
                '#${order.id}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.charcoal,
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Order details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    order.customerName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 12, color: AppColors.charcoalSoft),
                      const SizedBox(width: 4),
                      Text(
                        dateStr,
                        style: const TextStyle(fontSize: 12, color: AppColors.charcoalSoft),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '₱${order.totalAmount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.charcoal,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Interactive status pill button
            PopupMenuButton<String>(
              tooltip: 'Update status',
              initialValue: order.status,
              onSelected: (value) => _changeStatus(order, value),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              itemBuilder: (context) => statuses
                  .map(
                    (status) => PopupMenuItem<String>(
                      value: status,
                      child: Text(status),
                    ),
                  )
                  .toList(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: statusBgColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      order.status.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(width: 2),
                    Icon(Icons.arrow_drop_down, size: 14, color: statusColor),
                  ],
                ),
              ),
            ),
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
                  'Orders', 
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.charcoal,
                      ),
                ),
              ),
              ElevatedButton.icon(
                onPressed: _openCreateOrderDialog,
                icon: const Icon(Icons.add),
                label: const Text('ADD ORDER'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: 320,
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search orders...',
                prefixIcon: Icon(Icons.search, size: 20),
              ),
              onSubmitted: (value) => _loadOrders(search: value.trim()),
            ),
          ),
          const SizedBox(height: 18),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? Center(child: Text(_error))
                    : _orders.isEmpty
                        ? const Center(child: Text('No records found'))
                        : ListView.builder(
                            itemCount: _orders.length,
                            itemBuilder: (context, index) {
                              return _buildOrderCard(_orders[index]);
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

class _CreateOrderDialog extends ConsumerStatefulWidget {
  const _CreateOrderDialog({
    required this.customers,
    required this.flowers,
  });

  final List<Customer> customers;
  final List<Flower> flowers;

  @override
  ConsumerState<_CreateOrderDialog> createState() => _CreateOrderDialogState();
}

class _CreateOrderDialogState extends ConsumerState<_CreateOrderDialog> {
  int? _customerId;
  DateTime _date = DateTime.now();
  final List<_LineItemState> _lineItems = [const _LineItemState()];
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create Order'),
      content: SizedBox(
        width: 560,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<int>(
                initialValue: _customerId,
                decoration: const InputDecoration(labelText: 'Customer'),
                items: widget.customers
                    .map((c) => DropdownMenuItem(value: c.id, child: Text(c.name)))
                    .toList(),
                onChanged: (v) => setState(() => _customerId = v),
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Order Date'),
                subtitle: Text(_date.toIso8601String().split('T').first),
                trailing: TextButton(
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                      initialDate: _date,
                    );
                    if (picked != null) setState(() => _date = picked);
                  },
                  child: const Text('Change'),
                ),
              ),
              const SizedBox(height: 12),
              for (var i = 0; i < _lineItems.length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          initialValue: _lineItems[i].flowerId,
                          hint: const Text('Flower'),
                          items: widget.flowers
                              .map((f) => DropdownMenuItem(value: f.id, child: Text(f.name)))
                              .toList(),
                          onChanged: (v) => setState(() => _lineItems[i] = _lineItems[i].copyWith(flowerId: v)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 90,
                        child: TextFormField(
                          initialValue: _lineItems[i].quantity?.toString() ?? '',
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Qty'),
                          onChanged: (v) => setState(
                            () => _lineItems[i] = _lineItems[i].copyWith(quantity: int.tryParse(v)),
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: _lineItems.length == 1
                            ? null
                            : () => setState(() => _lineItems.removeAt(i)),
                        icon: const Icon(Icons.delete_outline),
                      ),
                    ],
                  ),
                ),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => setState(() => _lineItems.add(const _LineItemState())),
                  icon: const Icon(Icons.add, color: AppColors.gold),
                  label: const Text('Add Item', style: TextStyle(color: AppColors.charcoalSoft)),
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        ElevatedButton(
          onPressed: _saving
              ? null
              : () async {
                  if (_customerId == null) return;
                  final items = _lineItems
                      .where((e) => e.flowerId != null && (e.quantity ?? 0) > 0)
                      .map((e) => OrderItemRequest(
                            flowerId: e.flowerId!,
                            quantity: e.quantity!,
                          ))
                      .toList();
                  if (items.isEmpty) return;

                  setState(() => _saving = true);
                  try {
                    await ref.read(orderRepositoryProvider).createOrder(
                          customerId: _customerId!,
                          orderDate: _date,
                          items: items,
                        );
                    if (!context.mounted) return;
                    Navigator.of(context).pop(true);
                  } finally {
                    if (mounted) setState(() => _saving = false);
                  }
                },
          child: const Text('SAVE ORDER'),
        ),
      ],
    );
  }
}

class _LineItemState {
  const _LineItemState({this.flowerId, this.quantity});
  final int? flowerId;
  final int? quantity;

  _LineItemState copyWith({int? flowerId, int? quantity}) {
    return _LineItemState(
      flowerId: flowerId ?? this.flowerId,
      quantity: quantity ?? this.quantity,
    );
  }
}
