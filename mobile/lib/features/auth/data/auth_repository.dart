import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/dio_client.dart';
import '../../../core/storage/auth_token_storage.dart';
import '../domain/user.dart';
import 'auth_api.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.read(dioProvider);
  final tokenStorage = ref.read(authTokenStorageProvider);
  return AuthRepository(AuthApi(dio), tokenStorage);
});

class AuthRepository {
  AuthRepository(this._api, this._tokenStorage);

  final AuthApi _api;
  final AuthTokenStorage _tokenStorage;

  Future<User> login({
    required String username,
    required String password,
  }) async {
    final res = await _api.login(username: username, password: password);
    final data = res.data ?? <String, dynamic>{};
    final token = (data['token'] as String?) ?? '';
    if (token.isEmpty) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        type: DioExceptionType.badResponse,
        error: 'Missing token in response',
      );
    }
    await _tokenStorage.writeToken(token);
    return User.fromJson((data['user'] as Map).cast<String, dynamic>());
  }

  Future<User> me() async {
    final res = await _api.me();
    final data = res.data ?? <String, dynamic>{};
    final userJson = data['user'];
    if (userJson is Map) {
      return User.fromJson(userJson.cast<String, dynamic>());
    }
    throw DioException(
      requestOptions: res.requestOptions,
      response: res,
      type: DioExceptionType.badResponse,
      error: 'Missing user in /me response',
    );
  }

  Future<void> logout() async {
    try {
      await _api.logout();
    } finally {
      await _tokenStorage.clearToken();
    }
  }
}

