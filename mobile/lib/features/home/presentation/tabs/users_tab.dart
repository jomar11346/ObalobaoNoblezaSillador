import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../user/data/user_repository.dart';
import '../../../user/domain/admin_user.dart';

class UsersTab extends ConsumerStatefulWidget {
  const UsersTab({super.key});

  @override
  ConsumerState<UsersTab> createState() => _UsersTabState();
}

class _UsersTabState extends ConsumerState<UsersTab> {
  final _searchController = TextEditingController();
  bool _loading = true;
  String _error = '';
  List<AdminUser> _users = const [];

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
      final users = await ref.read(userRepositoryProvider).fetchUsers(search: search);
      setState(() => _users = users);
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Widget _buildUserCard(AdminUser user) {
    final nameParts = user.fullName.trim().split(RegExp(r'\s+'));
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
            // Initials circular avatar with charcoal theme
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.charcoal.withValues(alpha: 0.06),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.charcoal.withValues(alpha: 0.25), width: 1.2),
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
            // User identity & details columns
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user.fullName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.wc_outlined, size: 13, color: AppColors.charcoalSoft),
                      const SizedBox(width: 4),
                      Text(
                        user.gender,
                        style: const TextStyle(fontSize: 12, color: AppColors.charcoalSoft),
                      ),
                      const SizedBox(width: 16),
                      const Icon(Icons.cake_outlined, size: 13, color: AppColors.charcoalSoft),
                      const SizedBox(width: 4),
                      Text(
                        user.birthDate,
                        style: const TextStyle(fontSize: 12, color: AppColors.charcoalSoft),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Age badge on the right
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.25)),
              ),
              child: Text(
                'Age: ${user.age}',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.charcoal,
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
          Text(
            'Admin Users', 
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.charcoal,
                ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: 320,
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search admin users...',
                prefixIcon: Icon(Icons.search, size: 20),
              ),
              onSubmitted: (v) => _load(search: v.trim()),
            ),
          ),
          const SizedBox(height: 18),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? Center(child: Text(_error))
                    : _users.isEmpty
                        ? const Center(child: Text('No records found'))
                        : ListView.builder(
                            itemCount: _users.length,
                            itemBuilder: (context, index) {
                              return _buildUserCard(_users[index]);
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
