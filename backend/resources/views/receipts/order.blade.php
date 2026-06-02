<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Receipt #{{ $order->order_id }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #2d2926;
            line-height: 1.45;
        }
        .receipt {
            max-width: 520px;
            margin: 0 auto;
            padding: 28px 32px;
        }
        .brand {
            text-align: center;
            border-bottom: 2px solid #2d2926;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }
        .brand h1 {
            font-size: 22px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .brand p {
            font-size: 11px;
            color: #4a4541;
        }
        .meta {
            margin-bottom: 18px;
        }
        .meta-row {
            display: table;
            width: 100%;
            margin-bottom: 6px;
        }
        .meta-label {
            display: table-cell;
            width: 38%;
            font-weight: bold;
            color: #4a4541;
        }
        .meta-value {
            display: table-cell;
            width: 62%;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #4a4541;
            margin: 18px 0 8px;
            border-bottom: 1px solid #e8e4df;
            padding-bottom: 4px;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.items th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #4a4541;
            border-bottom: 1px solid #2d2926;
            padding: 6px 4px;
        }
        table.items th.qty,
        table.items th.price,
        table.items th.sub {
            text-align: right;
        }
        table.items td {
            padding: 8px 4px;
            border-bottom: 1px solid #f0ebe6;
            vertical-align: top;
        }
        table.items td.qty,
        table.items td.price,
        table.items td.sub {
            text-align: right;
            white-space: nowrap;
        }
        .total-row {
            margin-top: 8px;
            padding-top: 10px;
            border-top: 2px solid #2d2926;
            text-align: right;
        }
        .total-row .label {
            font-size: 13px;
            font-weight: bold;
            margin-right: 12px;
        }
        .total-row .amount {
            font-size: 16px;
            font-weight: bold;
        }
        .status {
            display: inline-block;
            padding: 3px 10px;
            border: 1px solid #2d2926;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .footer {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1px dashed #c9c2ba;
            text-align: center;
            font-size: 10px;
            color: #4a4541;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="brand">
            <h1>Yui Blooms</h1>
            <p>Official Order Receipt</p>
        </div>

        <div class="meta">
            <div class="meta-row">
                <span class="meta-label">Receipt No.</span>
                <span class="meta-value">#{{ $order->order_id }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Order Date</span>
                <span class="meta-value">{{ \Carbon\Carbon::parse($order->order_date)->format('F j, Y') }}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Status</span>
                <span class="meta-value"><span class="status">{{ $order->status }}</span></span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Generated</span>
                <span class="meta-value">{{ $generatedAt }}</span>
            </div>
        </div>

        <p class="section-title">Customer</p>
        <div class="meta">
            <div class="meta-row">
                <span class="meta-label">Name</span>
                <span class="meta-value">{{ $customer->name ?? '—' }}</span>
            </div>
            @if(!empty($customer->contact))
            <div class="meta-row">
                <span class="meta-label">Contact</span>
                <span class="meta-value">{{ $customer->contact }}</span>
            </div>
            @endif
            @if(!empty($customer->email))
            <div class="meta-row">
                <span class="meta-label">Email</span>
                <span class="meta-value">{{ $customer->email }}</span>
            </div>
            @endif
            @if(!empty($customer->address))
            <div class="meta-row">
                <span class="meta-label">Address</span>
                <span class="meta-value">{{ $customer->address }}</span>
            </div>
            @endif
        </div>

        <p class="section-title">Order Items</p>
        <table class="items">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="qty">Qty</th>
                    <th class="price">Unit Price</th>
                    <th class="sub">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($items as $item)
                @php
                    $unitPrice = (float) $item->price;
                    $qty = (int) $item->quantity;
                    $lineTotal = $unitPrice * $qty;
                    $flowerName = $item->flower->name ?? 'Flower #' . $item->flower_id;
                @endphp
                <tr>
                    <td>{{ $flowerName }}</td>
                    <td class="qty">{{ $qty }}</td>
                    <td class="price">₱{{ number_format($unitPrice, 2) }}</td>
                    <td class="sub">₱{{ number_format($lineTotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-row">
            <span class="label">Total Amount</span>
            <span class="amount">₱{{ number_format((float) $order->total_amount, 2) }}</span>
        </div>

        <div class="footer">
            <p>Thank you for choosing Yui Blooms!</p>
            <p>Please keep this receipt for your records.</p>
        </div>
    </div>
</body>
</html>
