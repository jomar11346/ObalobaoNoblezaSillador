import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/yb_background.dart';
import '../../auth/presentation/auth_controller.dart';
import 'tabs/customers_tab.dart';
import 'tabs/dashboard_tab.dart';
import 'tabs/flowers_tab.dart';
import 'tabs/orders_tab.dart';
import 'tabs/users_tab.dart';

enum HomeTab { dashboard, flowers, customers, orders, users }

class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  HomeTab _tab = HomeTab.dashboard;
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  String get _tabLabel {
    final name = _tab.name;
    return '${name[0].toUpperCase()}${name.substring(1)}';
  }

  Widget _tabBody() {
    return switch (_tab) {
      HomeTab.dashboard => const DashboardTab(),
      HomeTab.flowers => const FlowersTab(),
      HomeTab.customers => const CustomersTab(),
      HomeTab.orders => const OrdersTab(),
      HomeTab.users => const UsersTab(),
    };
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final userName = authState.maybeWhen(
      data: (state) => state is Authenticated ? state.user.username : 'Admin',
      orElse: () => 'Admin',
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final useRail = constraints.maxWidth >= 900;

        final destinations = <({HomeTab tab, IconData icon, IconData selectedIcon, String label})>[
          (tab: HomeTab.dashboard, icon: Icons.dashboard_outlined, selectedIcon: Icons.dashboard, label: 'Dashboard'),
          (tab: HomeTab.flowers, icon: Icons.local_florist_outlined, selectedIcon: Icons.local_florist, label: 'Flowers'),
          (tab: HomeTab.customers, icon: Icons.people_outline, selectedIcon: Icons.people, label: 'Customers'),
          (tab: HomeTab.orders, icon: Icons.receipt_long_outlined, selectedIcon: Icons.receipt_long, label: 'Orders'),
          (tab: HomeTab.users, icon: Icons.admin_panel_settings_outlined, selectedIcon: Icons.admin_panel_settings, label: 'Users'),
        ];

        Widget navList({required bool inDrawer}) {
          return ListView(
            padding: EdgeInsets.zero,
            children: [
              if (inDrawer)
                const DrawerHeader(
                  child: Align(
                    alignment: Alignment.bottomLeft,
                    child: Text(
                      'Yui Blooms',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              for (final d in destinations)
                ListTile(
                  leading: Icon(_tab == d.tab ? d.selectedIcon : d.icon),
                  title: Text(d.label),
                  selected: _tab == d.tab,
                  onTap: () {
                    setState(() => _tab = d.tab);
                    if (inDrawer) Navigator.of(context).pop();
                  },
                ),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Logout'),
                onTap: () => ref.read(authControllerProvider.notifier).logout(),
              ),
            ],
          );
        }

        final content = Column(
          children: [
            Container(
              height: 52,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              alignment: Alignment.centerLeft,
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.charcoal)),
              ),
              child: Row(
                children: [
                  if (!useRail)
                    IconButton(
                      icon: const Icon(Icons.menu),
                      onPressed: () => _scaffoldKey.currentState?.openDrawer(),
                    ),
                  Expanded(
                    child: Text(
                      '$userName • $_tabLabel',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(child: _tabBody()),
          ],
        );

        if (!useRail) {
          return Scaffold(
            key: _scaffoldKey,
            drawer: Drawer(child: navList(inDrawer: true)),
            body: YbBackground(child: SafeArea(child: content)),
          );
        }

        return Scaffold(
          body: YbBackground(
            child: SafeArea(
              child: Row(
                children: [
                  NavigationRail(
                    selectedIndex: HomeTab.values.indexOf(_tab),
                    onDestinationSelected: (index) {
                      setState(() => _tab = HomeTab.values[index]);
                    },
                    labelType: NavigationRailLabelType.all,
                    backgroundColor: AppColors.cream.withValues(alpha: 0.92),
                    leading: const Padding(
                      padding: EdgeInsets.only(top: 12, bottom: 8),
                      child: Text(
                        'Yui Blooms',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                      ),
                    ),
                    trailing: Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: IconButton(
                        icon: const Icon(Icons.logout),
                        tooltip: 'Logout',
                        onPressed: () =>
                            ref.read(authControllerProvider.notifier).logout(),
                      ),
                    ),
                    destinations: [
                      for (final d in destinations)
                        NavigationRailDestination(
                          icon: Icon(d.icon),
                          selectedIcon: Icon(d.selectedIcon),
                          label: Text(d.label),
                        ),
                    ],
                  ),
                  const VerticalDivider(width: 1),
                  Expanded(child: content),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
