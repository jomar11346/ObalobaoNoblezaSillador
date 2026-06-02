import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  Env._();

  static String get appName => dotenv.env['APP_NAME'] ?? 'Yui Blooms';

  static String get apiBaseUrl =>
      (dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:8000').replaceAll(RegExp(r'/*$'), '');

  static String get imageBaseUrl =>
      (dotenv.env['IMAGE_BASE_URL'] ?? apiBaseUrl).replaceAll(RegExp(r'/*$'), '');
}

