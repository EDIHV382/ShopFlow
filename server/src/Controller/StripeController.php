<?php

namespace App\Controller;

use Stripe\Stripe;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/stripe')]
class StripeController extends AbstractController
{
    public function __construct(
        #[Autowire('%env(STRIPE_SECRET_KEY)%')]
        private string $stripeSecretKey,
    ) {}

    #[Route('/create-payment-intent', methods: ['POST'])]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $data   = json_decode($request->getContent(), true) ?? [];
        $amount = (int) round(($data['amount'] ?? 0) * 100); // cents

        if ($amount <= 0) {
            return $this->json(['error' => 'Monto inválido'], 400);
        }

        try {
            Stripe::setApiKey($this->stripeSecretKey);

            $intent = \Stripe\PaymentIntent::create([
                'amount'   => $amount,
                'currency' => 'usd',
                'metadata' => ['user_id' => $this->getUser()?->getUserIdentifier()],
            ]);

            return $this->json(['clientSecret' => $intent->client_secret]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }
}
