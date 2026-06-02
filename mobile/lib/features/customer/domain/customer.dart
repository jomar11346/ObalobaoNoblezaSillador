class Customer {
  Customer({
    required this.id,
    required this.name,
    required this.contact,
    required this.address,
    this.email,
  });

  final int id;
  final String name;
  final String contact;
  final String address;
  final String? email;

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: (json['customer_id'] as num).toInt(),
      name: json['name'] as String? ?? '',
      contact: json['contact'] as String? ?? '',
      address: json['address'] as String? ?? '',
      email: json['email'] as String?,
    );
  }
}
