import 'package:dio/dio.dart';

class FlowerApi {
  FlowerApi(this._dio);

  final Dio _dio;

  Future<Response<Map<String, dynamic>>> loadFlowers() {
    return _dio.get<Map<String, dynamic>>('/api/flower/loadFlowers');
  }

  Future<void> storeFlower({
    required String name,
    required double price,
    required int stockQuantity,
    MultipartFile? image,
  }) async {
    final payload = <String, dynamic>{
      'name': name,
      'price': price,
      'stock_quantity': stockQuantity,
      'image': image,
    }..removeWhere((key, value) => value == null);
    final formData = FormData.fromMap(payload);
    await _dio.post('/api/flower/storeFlower', data: formData);
  }
}

