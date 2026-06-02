import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/dio_client.dart';
import '../domain/admin_user.dart';
import 'user_api.dart';

final userRepositoryProvider = Provider<UserRepository>((ref) {
  final dio = ref.read(dioProvider);
  return UserRepository(UserApi(dio));
});

class UserRepository {
  UserRepository(this._api);
  final UserApi _api;

  Future<List<AdminUser>> fetchUsers({String? search}) async {
    final response = await _api.loadUsers(search: search);
    final payload = response.data ?? <String, dynamic>{};
    final usersPage = (payload['users'] as Map<String, dynamic>?) ?? <String, dynamic>{};
    final list = usersPage['data'] as List<dynamic>? ?? const [];
    return list.whereType<Map<String, dynamic>>().map(AdminUser.fromJson).toList();
  }

  Future<List<GenderOption>> fetchGenders() async {
    final response = await _api.loadGenders();
    final payload = response.data ?? <String, dynamic>{};
    final list = payload['genders'] as List<dynamic>? ?? const [];
    return list.whereType<Map<String, dynamic>>().map(GenderOption.fromJson).toList();
  }
}

