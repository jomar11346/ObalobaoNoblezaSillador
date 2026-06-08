<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N8nWebhookService
{
    public function notifyNewOrder(Order $order): void
    {
        $this->send($this->buildPayload($order, 'order_created'));
    }

    public function notifyOrderCompleted(Order $order): void
    {
        $this->send($this->buildPayload($order, 'order_completed'));
    }

    private function buildPayload(Order $order, string $event): array
    {
        $order->loadMissing(['customer', 'orderItems.flower']);

        $items = $order->orderItems->map(fn ($item) => [
            'flower_name' => $item->flower?->name ?? 'Unknown',
            'quantity' => (int) $item->quantity,
            'price' => (float) $item->price,
            'line_total' => (float) ($item->quantity * $item->price),
        ])->values()->all();

        return [
            'event' => $event,
            'order_id' => $order->order_id,
            'customer_name' => $order->customer?->name ?? 'Unknown',
            'total_amount' => (float) $order->total_amount,
            'order_date' => $order->order_date?->format('Y-m-d'),
            'status' => $order->status,
            'items' => $items,
            'app_name' => config('app.name', 'Obalobao Nobleza Sillador'),
            'triggered_at' => now()->timezone(config('app.timezone', 'Asia/Manila'))->toIso8601String(),
        ];
    }

    private function send(array $payload): void
    {
        if (! config('services.n8n.enabled')) {
            return;
        }

        foreach ($this->resolveWebhookUrls() as $url) {
            if ($this->postToWebhook($url, $payload)) {
                return;
            }
        }
    }

    /**
     * @return list<string>
     */
    private function resolveWebhookUrls(): array
    {
        $urls = array_filter([
            config('services.n8n.webhook_url'),
            config('services.n8n.webhook_fallback_url'),
        ]);

        $normalized = [];

        foreach ($urls as $url) {
            if (str_contains($url, '/webhook-test/')) {
                $url = str_replace('/webhook-test/', '/webhook/', $url);
            }

            if (! in_array($url, $normalized, true)) {
                $normalized[] = $url;
            }
        }

        return $normalized;
    }

    private function postToWebhook(string $url, array $payload): bool
    {
        $request = Http::timeout((int) config('services.n8n.timeout', 15))
            ->acceptJson()
            ->asJson()
            ->withOptions([
                'curl' => [
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                ],
            ]);

        $headers = [];

        $secret = config('services.n8n.webhook_secret');

        if (! empty($secret)) {
            $headers['X-N8N-Webhook-Secret'] = $secret;
        }

        if (str_contains($url, 'ngrok-free.app') || str_contains($url, 'ngrok-free.dev') || str_contains($url, 'ngrok.io')) {
            $headers['ngrok-skip-browser-warning'] = 'true';
        }

        if ($headers !== []) {
            $request = $request->withHeaders($headers);
        }

        $maxAttempts = 3;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $response = $request->post($url, $payload);

                if ($response->successful()) {
                    Log::info('n8n webhook sent', [
                        'url' => $url,
                        'event' => $payload['event'] ?? null,
                        'order_id' => $payload['order_id'] ?? null,
                    ]);

                    return true;
                }

                Log::warning('n8n webhook failed', [
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                    'url' => $url,
                    'event' => $payload['event'] ?? null,
                    'order_id' => $payload['order_id'] ?? null,
                    'attempt' => $attempt,
                ]);

                return false;
            } catch (\Throwable $e) {
                if ($attempt < $maxAttempts) {
                    usleep(500_000 * $attempt);
                    continue;
                }

                Log::warning('n8n webhook error: '.$e->getMessage(), [
                    'url' => $url,
                    'event' => $payload['event'] ?? null,
                    'order_id' => $payload['order_id'] ?? null,
                    'attempt' => $attempt,
                ]);
            }
        }

        return false;
    }
}
