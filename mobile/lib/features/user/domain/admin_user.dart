class AdminUser {
  AdminUser({
    required this.id,
    required this.fullName,
    required this.gender,
    required this.birthDate,
    required this.age,
  });

  final int id;
  final String fullName;
  final String gender;
  final String birthDate;
  final int age;

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    final first = (json['first_name'] as String?) ?? '';
    final middle = (json['middle_name'] as String?) ?? '';
    final last = (json['last_name'] as String?) ?? '';
    final suffix = (json['suffix_name'] as String?) ?? '';
    return AdminUser(
      id: (json['user_id'] as num).toInt(),
      fullName: [first, middle, last, suffix].where((e) => e.trim().isNotEmpty).join(' '),
      gender: ((json['gender'] as Map<String, dynamic>?)?['gender'] as String?) ?? '',
      birthDate: (json['birth_date'] as String?) ?? '',
      age: (json['age'] as num?)?.toInt() ?? 0,
    );
  }
}

class GenderOption {
  GenderOption({required this.id, required this.label});
  final int id;
  final String label;

  factory GenderOption.fromJson(Map<String, dynamic> json) => GenderOption(
        id: (json['gender_id'] as num).toInt(),
        label: (json['gender'] as String?) ?? '',
      );
}

