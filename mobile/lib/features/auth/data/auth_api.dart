import 'package:dio/dio.dart';

class AuthApi {
  AuthApi(this._dio);

  final Dio _dio;

  Future<Response<Map<String, dynamic>>> login({
    required String username,
    required String password,
  }) {
    return _dio.post<Map<String, dynamic>>(
      '/api/auth/login',
      data: {
        'username': username,
        'password': password,
      },
    );
  }

  Future<Response<Map<String, dynamic>>> me() {
    return _dio.get<Map<String, dynamic>>('/api/auth/me');
  }

  Future<void> logout() async {
    await _dio.post('/api/auth/logout');
  }
}

