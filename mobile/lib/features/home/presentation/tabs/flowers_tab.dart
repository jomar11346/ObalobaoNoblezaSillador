import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../flower/data/flower_repository.dart';
import '../../../flower/domain/flower.dart';

import 'dashboard_tab.dart';

class FlowersTab extends ConsumerStatefulWidget {
  const FlowersTab({super.key});

  @override
  ConsumerState<FlowersTab> createState() => _FlowersTabState();
}

class _FlowersTabState extends ConsumerState<FlowersTab> {
  final _searchController = TextEditingController();
  List<Flower> _flowers = const [];
  bool _loading = true;
  String _error = '';
  String _query = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final items = await ref.read(flowerRepositoryProvider).fetchFlowers();
      setState(() {
        _flowers = items;
      });
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _openAddDialog() async {
    final didSave = await showDialog<bool>(
      context: context,
      builder: (context) => const _AddFlowerDialog(),
    );
    if (didSave == true) {
      ref.invalidate(dashboardStatsProvider);
      _load();
    }
  }

  Widget _buildFlowerCard(Flower flower) {
    final hasStock = flower.stockQuantity > 0;
    final lowStock = flower.stockQuantity <= 10;
    
    Color stockColor = AppColors.success;
    String stockText = 'In Stock';
    if (!hasStock) {
      stockColor = AppColors.danger;
      stockText = 'Out of Stock';
    } else if (lowStock) {
      stockColor = AppColors.gold;
      stockText = 'Low Stock';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.22)),
        boxShadow: [
          BoxShadow(
            color: AppColors.charcoal.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Elegant circular flower image with borders
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.gold.withValues(alpha: 0.3), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.charcoal.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: flower.imageUrl != null && flower.imageUrl!.isNotEmpty
                  ? Image.network(
                      flower.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: AppColors.creamDark,
                        child: const Icon(Icons.local_florist_outlined, color: AppColors.gold, size: 28),
                      ),
                    )
                  : Container(
                      color: AppColors.creamDark,
                      child: const Icon(Icons.local_florist_outlined, color: AppColors.gold, size: 28),
                    ),
            ),
            const SizedBox(width: 16),
            // Flower details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    flower.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.charcoal,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: stockColor.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: stockColor.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          '$stockText: ${flower.stockQuantity}',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: stockColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Price column
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Text(
                  'PRICE',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                    color: AppColors.charcoalSoft,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '₱${flower.price.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.charcoal,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _flowers
        .where((f) => f.name.toLowerCase().contains(_query.toLowerCase()))
        .toList();

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Flowers', 
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.charcoal,
                      ),
                ),
              ),
              ElevatedButton.icon(
                onPressed: _openAddDialog,
                icon: const Icon(Icons.add),
                label: const Text('ADD FLOWER'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: 320,
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search flowers...',
                prefixIcon: Icon(Icons.search, size: 20),
              ),
              onChanged: (v) => setState(() => _query = v.trim()),
            ),
          ),
          const SizedBox(height: 18),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? Center(child: Text(_error))
                    : filtered.isEmpty
                        ? const Center(child: Text('No flowers found'))
                        : ListView.builder(
                            itemCount: filtered.length,
                            itemBuilder: (context, index) {
                              return _buildFlowerCard(filtered[index]);
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

class _AddFlowerDialog extends ConsumerStatefulWidget {
  const _AddFlowerDialog();

  @override
  ConsumerState<_AddFlowerDialog> createState() => _AddFlowerDialogState();
}

class _AddFlowerDialogState extends ConsumerState<_AddFlowerDialog> {
  final _nameController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController();
  File? _pickedFile;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Flower'),
      content: SingleChildScrollView(
        child: SizedBox(
          width: 420,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Name')),
              const SizedBox(height: 12),
              TextField(
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Price'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _stockController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Stock Quantity'),
              ),
              const SizedBox(height: 14),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () async {
                    final picker = ImagePicker();
                    final picked = await picker.pickImage(source: ImageSource.gallery);
                    if (picked != null) {
                      setState(() => _pickedFile = File(picked.path));
                    }
                  },
                  icon: const Icon(Icons.image_outlined, color: AppColors.gold),
                  label: Text(
                    _pickedFile == null ? 'Choose Image' : 'Image selected',
                    style: const TextStyle(color: AppColors.charcoalSoft),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        ElevatedButton(
          onPressed: _saving
              ? null
              : () async {
                  final name = _nameController.text.trim();
                  final price = double.tryParse(_priceController.text.trim());
                  final stock = int.tryParse(_stockController.text.trim());
                  if (name.isEmpty || price == null || stock == null) return;

                  setState(() => _saving = true);
                  try {
                    await ref.read(flowerRepositoryProvider).createFlower(
                          name: name,
                          price: price,
                          stockQuantity: stock,
                          imageFile: _pickedFile,
                        );
                    if (!context.mounted) return;
                    Navigator.of(context).pop(true);
                  } finally {
                    if (mounted) setState(() => _saving = false);
                  }
                },
          child: const Text('SAVE'),
        ),
      ],
    );
  }
}
