import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/config/env.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/auth_controller.dart';
import 'features/home/presentation/home_shell.dart';

class YuiBloomsApp extends StatelessWidget {
  const YuiBloomsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(390, 844), // iPhone 14-ish baseline
      minTextAdapt: true,
      builder: (context, _) => MaterialApp(
        title: Env.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        home: const AppGate(),
      ),
    );
  }
}

class AppGate extends ConsumerWidget {
  const AppGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);

    return auth.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (_, stackTrace) => const LoginScreen(),
      data: (state) {
        return switch (state) {
          Authenticated() => const HomeShell(),
          _ => const LoginScreen(),
        };
      },
    );
  }
}

