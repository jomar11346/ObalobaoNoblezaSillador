import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Matches web Tailwind theme variables (frontend/src/index.css).
  static const Color cream = Color(0xFFFDFBF7); // yb-cream
  static const Color creamDark = Color(0xFFF5F0E8); // yb-cream-dark
  static const Color charcoal = Color(0xFF2D2926); // yb-charcoal
  static const Color charcoalSoft = Color(0xFF4A4541); // yb-charcoal-soft
  static const Color gold = Color(0xFFB8956C); // yb-gold
  static const Color goldMuted = Color(0xFFD4C4A8); // yb-gold-muted

  static const Color primary = charcoal;
  static const Color secondary = gold;
  static const Color background = cream;
  static const Color surface = Colors.white;
  static const Color danger = Color(0xFFDC2626);
  static const Color success = Color(0xFF16A34A);
  static const Color text = charcoal;
  static const Color mutedText = charcoalSoft;
}

