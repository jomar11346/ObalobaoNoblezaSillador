import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class YbBackground extends StatelessWidget {
  const YbBackground({
    super.key,
    required this.child,
    this.color,
  });

  final Widget child;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: CustomPaint(
        painter: _DotsPainter(baseColor: color ?? AppColors.background),
        child: ColoredBox(
          color: color ?? AppColors.background,
          child: child,
        ),
      ),
    );
  }
}

class _DotsPainter extends CustomPainter {
  _DotsPainter({required this.baseColor});

  final Color baseColor;

  // Matches the web pattern: 1px dot, 22px spacing, ~0.14 opacity gold.
  static const _spacing = 22.0;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.gold.withValues(alpha: 0.14)
      ..style = PaintingStyle.fill;

    for (double y = 1; y < size.height; y += _spacing) {
      for (double x = 1; x < size.width; x += _spacing) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DotsPainter oldDelegate) {
    return oldDelegate.baseColor != baseColor;
  }
}

