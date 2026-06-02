import 'package:dio/dio.dart';

class UserApi {
  UserApi(this._dio);
  final Dio _dio;

  Future<Response<Map<String, dynamic>>> loadUsers({String? search}) {
    return _dio.get<Map<String, dynamic>>(
      '/api/user/loadUsers',
      queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
  }

  Future<Response<Map<String, dynamic>>> loadGenders() {
    return _dio.get<Map<String, dynamic>>('/api/gender/loadGenders');
  }
}

