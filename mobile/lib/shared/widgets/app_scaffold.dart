import 'package:flutter/material.dart';

import 'yb_background.dart';

class AppScaffold extends StatelessWidget {
  const AppScaffold({
    super.key,
    required this.title,
    required this.child,
    this.actions,
    this.showAppBar = true,
  });

  final String title;
  final Widget child;
  final List<Widget>? actions;
  final bool showAppBar;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: showAppBar ? AppBar(title: Text(title), actions: actions) : null,
      body: YbBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: child,
          ),
        ),
      ),
    );
  }
}

