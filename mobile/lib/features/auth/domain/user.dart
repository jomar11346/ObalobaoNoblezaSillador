class User {
  User({
    required this.id,
    required this.username,
    required this.name,
  });

  final int id;
  final String username;
  final String name;

  factory User.fromJson(Map<String, dynamic> json) {
    final idValue = json['user_id'] ?? json['id'];
    final id = (idValue is num) ? idValue.toInt() : int.tryParse('$idValue') ?? 0;

    final firstName = (json['first_name'] as String?)?.trim();
    final middleName = (json['middle_name'] as String?)?.trim();
    final lastName = (json['last_name'] as String?)?.trim();
    final suffixName = (json['suffix_name'] as String?)?.trim();

    final fullNameParts = <String>[
      if (firstName != null && firstName.isNotEmpty) firstName,
      if (middleName != null && middleName.isNotEmpty) middleName,
      if (lastName != null && lastName.isNotEmpty) lastName,
      if (suffixName != null && suffixName.isNotEmpty) suffixName,
    ];

    final derivedName = fullNameParts.join(' ').trim();
    final explicitName =
        (json['name'] as String?) ?? (json['full_name'] as String?) ?? derivedName;

    return User(
      id: id,
      username: (json['username'] as String?) ?? '',
      name: explicitName,
    );
  }
}

