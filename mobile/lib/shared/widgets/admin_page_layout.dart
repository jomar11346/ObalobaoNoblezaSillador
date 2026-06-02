import 'package:flutter/material.dart';

/// Shared page chrome used by admin tabs (title, search, actions, scrollable body).
class AdminPageLayout extends StatelessWidget {
  const AdminPageLayout({
    super.key,
    required this.title,
    required this.subtitle,
    required this.body,
    this.searchField,
    this.actions = const [],
  });

  final String title;
  final String subtitle;
  final Widget body;
  final Widget? searchField;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'YUI BLOOMS',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            letterSpacing: 2.8,
                            color: Theme.of(context).colorScheme.secondary,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(title, style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                ),
              ),
              ...actions,
            ],
          ),
          if (searchField != null) ...[
            const SizedBox(height: 12),
            SizedBox(width: 320, child: searchField),
          ],
          const SizedBox(height: 12),
          Expanded(child: body),
        ],
      ),
    );
  }
}

class AdminPanel extends StatelessWidget {
  const AdminPanel({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.black45),
        color: Colors.white.withValues(alpha: 0.78),
      ),
      child: child,
    );
  }
}
