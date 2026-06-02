import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../dashboard/data/dashboard_api.dart';
import '../../../dashboard/domain/dashboard_stats.dart';
import '../../../dashboard/domain/sales_analytics.dart';
import '../../../../core/networking/dio_client.dart';

final dashboardStatsProvider = FutureProvider<DashboardStats>((ref) async {
  final dio = ref.read(dioProvider);
  final api = DashboardApi(dio);
  final res = await api.getStats();
  return DashboardStats.fromJson((res.data ?? <String, dynamic>{}).cast<String, dynamic>());
});

final monthlySalesProvider = FutureProvider<List<MonthlySaleData>>((ref) async {
  final dio = ref.read(dioProvider);
  final api = DashboardApi(dio);
  final res = await api.loadMonthlySales();
  final rawList = (res.data?['monthly_sales'] as List<dynamic>?) ?? const [];
  return rawList.whereType<Map<String, dynamic>>().map(MonthlySaleData.fromJson).toList();
});

final dailySalesProvider = FutureProvider<List<DailySaleData>>((ref) async {
  final dio = ref.read(dioProvider);
  final api = DashboardApi(dio);
  final res = await api.loadDailySales();
  final rawList = (res.data?['daily_sales'] as List<dynamic>?) ?? const [];
  return rawList.whereType<Map<String, dynamic>>().map(DailySaleData.fromJson).toList();
});

class DashboardTab extends ConsumerWidget {
  const DashboardTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(dashboardStatsProvider);
    final monthlySales = ref.watch(monthlySalesProvider);
    final dailySales = ref.watch(dailySalesProvider);

    return stats.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => Center(child: Text('Failed to load: $error')),
      data: (data) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dashboard', 
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.charcoal,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              'Real-time overview of sales performance and active operations.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.charcoalSoft,
                  ),
            ),
            const SizedBox(height: 24),
            // Metric Cards
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                _StatTile(
                  label: 'Total Sales',
                  value: '₱${data.totalSales.toStringAsFixed(2)}',
                  icon: Icons.trending_up_rounded,
                  iconColor: AppColors.success,
                ),
                _StatTile(
                  label: 'Low Stock Items',
                  value: data.lowStockFlowers.toString(),
                  icon: Icons.inventory_2_outlined,
                  iconColor: data.lowStockFlowers > 0 ? AppColors.danger : AppColors.gold,
                ),
                _StatTile(
                  label: 'Pending Orders',
                  value: data.pendingOrders.toString(),
                  icon: Icons.shopping_bag_outlined,
                  iconColor: AppColors.gold,
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Monthly Sales Bar Chart
            monthlySales.when(
              loading: () => const SizedBox(
                height: 160,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (err, _) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.red.withValues(alpha: 0.05),
                ),
                child: Text('Could not load monthly sales: $err', style: const TextStyle(color: Colors.red)),
              ),
              data: (monthlyData) => _MonthlySalesChart(sales: monthlyData),
            ),
            const SizedBox(height: 24),
            // Daily Sales Line/Area Trend Chart
            dailySales.when(
              loading: () => const SizedBox(
                height: 160,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (err, _) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.red.withValues(alpha: 0.05),
                ),
                child: Text('Could not load daily sales: $err', style: const TextStyle(color: Colors.red)),
              ),
              data: (dailyData) => _DailySalesLineChart(sales: dailyData),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.iconColor,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 280,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.gold.withValues(alpha: 0.22)),
          color: Colors.white.withValues(alpha: 0.85),
          boxShadow: [
            BoxShadow(
              color: AppColors.charcoal.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 2,
                        color: AppColors.charcoalSoft,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      value,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.charcoal,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: iconColor,
                  size: 26,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MonthlySalesChart extends StatelessWidget {
  const _MonthlySalesChart({required this.sales});
  final List<MonthlySaleData> sales;

  @override
  Widget build(BuildContext context) {
    if (sales.isEmpty) {
      return const SizedBox(
        height: 160,
        child: Center(child: Text('No monthly sales records found.', style: TextStyle(color: AppColors.charcoalSoft))),
      );
    }

    final sortedSales = List<MonthlySaleData>.from(sales)
      ..sort((a, b) => a.yearMonth.compareTo(b.yearMonth));
    
    final data = sortedSales.length > 6 ? sortedSales.sublist(sortedSales.length - 6) : sortedSales;

    final maxAmount = data.map((e) => e.amount).fold<double>(0, (max, val) => val > max ? val : max);
    final displayMax = maxAmount == 0 ? 1.0 : maxAmount;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.22)),
        boxShadow: [
          BoxShadow(
            color: AppColors.charcoal.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.bar_chart_rounded, color: AppColors.gold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Monthly Revenues',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 180,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: data.map((item) {
                final heightFactor = item.amount / displayMax;
                final barHeight = heightFactor * 120.0;

                return Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        item.amount >= 1000
                            ? '₱${(item.amount / 1000).toStringAsFixed(1)}K'
                            : '₱${item.amount.toInt()}',
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.charcoalSoft),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        height: barHeight < 6 ? 6 : barHeight,
                        width: 24,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.gold, AppColors.charcoal],
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                          ),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.gold.withValues(alpha: 0.15),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.label.split(' ').first,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.charcoalSoft),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _DailySalesLineChart extends StatelessWidget {
  const _DailySalesLineChart({required this.sales});
  final List<DailySaleData> sales;

  @override
  Widget build(BuildContext context) {
    if (sales.isEmpty) {
      return const SizedBox(
        height: 160,
        child: Center(child: Text('No daily sales records found.', style: TextStyle(color: AppColors.charcoalSoft))),
      );
    }

    final sortedSales = List<DailySaleData>.from(sales)
      ..sort((a, b) => (a.saleDate ?? DateTime.now()).compareTo(b.saleDate ?? DateTime.now()));

    final data = sortedSales.length > 10 ? sortedSales.sublist(sortedSales.length - 10) : sortedSales;

    final maxAmount = data.map((e) => e.amount).fold<double>(0, (max, val) => val > max ? val : max);
    final displayMax = maxAmount == 0 ? 1.0 : maxAmount;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.22)),
        boxShadow: [
          BoxShadow(
            color: AppColors.charcoal.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.show_chart_rounded, color: AppColors.gold, size: 20),
              const SizedBox(width: 8),
              Text(
                'Daily Sales Trend (Last 10 Days)',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 160,
            width: double.infinity,
            child: CustomPaint(
              painter: _LineChartPainter(
                data: data,
                maxAmount: displayMax,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LineChartPainter extends CustomPainter {
  _LineChartPainter({required this.data, required this.maxAmount});
  final List<DailySaleData> data;
  final double maxAmount;

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final width = size.width;
    final height = size.height;

    const leftMargin = 10.0;
    const rightMargin = 10.0;
    const topMargin = 15.0;
    const bottomMargin = 20.0;

    final chartWidth = width - leftMargin - rightMargin;
    final chartHeight = height - topMargin - bottomMargin;

    final stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

    final points = <Offset>[];
    for (int i = 0; i < data.length; i++) {
      final x = leftMargin + (i * stepX);
      final y = topMargin + chartHeight - ((data[i].amount / maxAmount) * chartHeight);
      points.add(Offset(x, y));
    }

    final gridPaint = Paint()
      ..color = AppColors.gold.withValues(alpha: 0.15)
      ..strokeWidth = 1.0;

    for (double i = 0; i <= 1.0; i += 0.5) {
      final gy = topMargin + (chartHeight * i);
      canvas.drawLine(Offset(leftMargin, gy), Offset(width - rightMargin, gy), gridPaint);
    }

    if (points.length > 1) {
      final areaPath = Path()
        ..moveTo(points.first.dx, topMargin + chartHeight);

      for (var point in points) {
        areaPath.lineTo(point.dx, point.dy);
      }
      areaPath.lineTo(points.last.dx, topMargin + chartHeight);
      areaPath.close();

      final areaPaint = Paint()
        ..shader = LinearGradient(
          colors: [
            AppColors.gold.withValues(alpha: 0.28),
            AppColors.gold.withValues(alpha: 0.0),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ).createShader(Rect.fromLTRB(leftMargin, topMargin, width - rightMargin, topMargin + chartHeight))
        ..style = PaintingStyle.fill;

      canvas.drawPath(areaPath, areaPaint);
    }

    final linePaint = Paint()
      ..color = AppColors.charcoal
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final linePath = Path()..moveTo(points.first.dx, points.first.dy);
    for (int i = 1; i < points.length; i++) {
      final prev = points[i - 1];
      final curr = points[i];
      final controlX = prev.dx + (curr.dx - prev.dx) / 2;
      linePath.cubicTo(controlX, prev.dy, controlX, curr.dy, curr.dx, curr.dy);
    }
    canvas.drawPath(linePath, linePaint);

    final pointPaint = Paint()
      ..color = AppColors.gold
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = AppColors.charcoal
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    for (int i = 0; i < points.length; i++) {
      final point = points[i];
      canvas.drawCircle(point, 4, pointPaint);
      canvas.drawCircle(point, 4, borderPaint);

      if (i == 0 || i == data.length ~/ 2 || i == data.length - 1) {
        final d = data[i].saleDate;
        final dateLabel = d != null ? '${d.month}/${d.day}' : '';
        
        final textPainter = TextPainter(
          text: TextSpan(
            text: dateLabel,
            style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppColors.charcoalSoft),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        
        textPainter.paint(
          canvas, 
          Offset(point.dx - (textPainter.width / 2), topMargin + chartHeight + 6),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _LineChartPainter oldDelegate) {
    return oldDelegate.data != data || oldDelegate.maxAmount != maxAmount;
  }
}
