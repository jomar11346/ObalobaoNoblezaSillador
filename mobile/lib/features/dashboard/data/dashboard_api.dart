import 'package:dio/dio.dart';

class DashboardApi {
  DashboardApi(this._dio);
  final Dio _dio;

  Future<Response<Map<String, dynamic>>> getStats() {
    return _dio.get<Map<String, dynamic>>('/api/dashboard/getDashboardStats');
  }

  Future<Response<Map<String, dynamic>>> loadMonthlySales() {
    return _dio.get<Map<String, dynamic>>('/api/dashboard/loadMonthlySales');
  }

  Future<Response<Map<String, dynamic>>> loadDailySales() {
    return _dio.get<Map<String, dynamic>>('/api/dashboard/loadDailySales');
  }
}
