import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authTokenStorageProvider = Provider<AuthTokenStorage>((ref) {
  const storage = FlutterSecureStorage();
  return AuthTokenStorage(storage);
});

class AuthTokenStorage {
  AuthTokenStorage(this._storage);

  static const _kTokenKey = 'auth_token';

  final FlutterSecureStorage _storage;

  Future<String?> readToken() => _storage.read(key: _kTokenKey);

  Future<void> writeToken(String token) => _storage.write(key: _kTokenKey, value: token);

  Future<void> clearToken() => _storage.delete(key: _kTokenKey);
}

