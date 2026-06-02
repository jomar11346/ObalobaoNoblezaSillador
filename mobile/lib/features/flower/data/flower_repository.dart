import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/dio_client.dart';
import '../domain/flower.dart';
import 'flower_api.dart';

final flowerRepositoryProvider = Provider<FlowerRepository>((ref) {
  final dio = ref.read(dioProvider);
  return FlowerRepository(FlowerApi(dio));
});

class FlowerRepository {
  FlowerRepository(this._api);

  final FlowerApi _api;

  Future<List<Flower>> fetchFlowers() async {
    final response = await _api.loadFlowers();
    final payload = response.data ?? <String, dynamic>{};
    final rawItems = payload['flowers'] as List<dynamic>? ?? const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(Flower.fromJson)
        .toList();
  }

  Future<void> createFlower({
    required String name,
    required double price,
    required int stockQuantity,
    File? imageFile,
  }) async {
    MultipartFile? multipart;
    if (imageFile != null) {
      final filename = imageFile.path.split(Platform.pathSeparator).last;
      multipart = await MultipartFile.fromFile(imageFile.path, filename: filename);
    }
    await _api.storeFlower(
      name: name,
      price: price,
      stockQuantity: stockQuantity,
      image: multipart,
    );
  }
}

