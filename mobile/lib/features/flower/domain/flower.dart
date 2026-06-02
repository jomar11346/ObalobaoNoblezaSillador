class Flower {
  Flower({
    required this.id,
    required this.name,
    required this.price,
    required this.stockQuantity,
    this.imageUrl,
  });

  final int id;
  final String name;
  final double price;
  final int stockQuantity;
  final String? imageUrl;

  factory Flower.fromJson(Map<String, dynamic> json) {
    return Flower(
      id: (json['flower_id'] as num).toInt(),
      name: (json['name'] as String?) ?? '',
      price: double.tryParse(json['price']?.toString() ?? '') ?? 0.0,
      stockQuantity: (json['stock_quantity'] as num?)?.toInt() ?? 0,
      imageUrl: json['image'] as String?,
    );
  }
}

