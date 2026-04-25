<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $hasher,
        private JWTTokenManagerInterface $jwt,
        private UserRepository $users,
        private ValidatorInterface $validator,
    ) {}

    #[Route('/register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        // Validate input
        $constraints = new Assert\Collection([
            'name'     => [new Assert\NotBlank(), new Assert\Length(['min' => 2, 'max' => 100])],
            'email'    => [new Assert\NotBlank(), new Assert\Email()],
            'password' => [new Assert\NotBlank(), new Assert\Length(['min' => 8])],
        ]);
        $violations = $this->validator->validate($data, $constraints);
        if (count($violations)) {
            return $this->json(['error' => $violations[0]->getMessage()], 400);
        }

        // Enforce password strength
        if (!preg_match('/^(?=.*[A-Z])(?=.*\d).{8,}$/', $data['password'])) {
            return $this->json(['error' => 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número'], 400);
        }

        if ($this->users->findByEmail($data['email'])) {
            return $this->json(['error' => 'Este email ya está registrado'], 409);
        }

        $user = new User();
        $user->setName($data['name'])
             ->setEmail($data['email'])
             ->setPasswordHash($this->hasher->hashPassword($user, $data['password']))
             ->setRoles(['ROLE_USER']);

        $this->em->persist($user);
        $this->em->flush();

        $token = $this->jwt->createFromPayload($user, [
            'userId' => $user->getId(),
            'email'  => $user->getEmail(),
            'roles'  => $user->getRoles(),
        ]);

        return $this->json([
            'token' => $token,
            'user'  => $this->serializeUser($user),
        ], 201);
    }

    #[Route('/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'No autenticado'], 401);
        }
        return $this->json($this->serializeUser($user));
    }

    #[Route('/logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // JWT is stateless — client just discards the token
        return $this->json(['message' => 'Sesión cerrada']);
    }

    private function serializeUser(User $u): array
    {
        return [
            'id'    => $u->getId(),
            'name'  => $u->getName(),
            'email' => $u->getEmail(),
            'roles' => $u->getRoles(),
        ];
    }
}
