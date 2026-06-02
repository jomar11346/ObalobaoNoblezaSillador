import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/dio_client.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../customer/presentation/customer_list_screen.dart';
import '../data/dashboard_api.dart';
import '../domain/dashboard_stats.dart';

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  final dio = ref.read(dioProvider);
  final api = DashboardApi(dio);
  final res = await api.getStats();
  return DashboardStats.fromJson(
    (res.data ?? <String, dynamic>{}).cast<String, dynamic>(),
  );
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(dashboardStatsProvider);

    return AppScaffold(
      title: 'Dashboard',
      actions: [
        IconButton(
          icon: const Icon(Icons.people_outline),
          tooltip: 'Customers',
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const CustomerListScreen()),
            );
          },
        ),
        IconButton(
          onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          icon: const Icon(Icons.logout),
          tooltip: 'Logout',
        ),
      ],
      child: stats.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load stats: $e')),
        data: (s) => LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth;
            final cols = width >= 900 ? 3 : (width >= 560 ? 2 : 1);
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Dashboard',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Today’s overview for sales and operations',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                _StatsGrid(
                  columns: cols,
                  children: [
                    _StatCard(
                      title: 'Total Sales',
                      value: s.totalSales.toString(),
                      icon: Icons.payments_outlined,
                    ),
                    _StatCard(
                      title: 'Pending Orders',
                      value: s.pendingOrders.toString(),
                      icon: Icons.pending_actions,
                    ),
                    _StatCard(
                      title: 'Low Stock',
                      value: s.lowStockFlowers.toString(),
                      icon: Icons.inventory_2_outlined,
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.columns, required this.children});

  final int columns;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        for (final child in children)
          SizedBox(width: _cellWidth(context), child: child),
      ],
    );
  }

  double _cellWidth(BuildContext context) {
    final maxWidth = MediaQuery.sizeOf(context).width - 32;
    final totalSpacing = 12.0 * (columns - 1);
    return (maxWidth - totalSpacing) / columns;
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.6,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            CircleAvatar(
              radius: 22,
              backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
              foregroundColor: Theme.of(
                context,
              ).colorScheme.onSecondaryContainer,
              child: Icon(icon),
            ),
          ],
        ),
      ),
    );
  }
}
