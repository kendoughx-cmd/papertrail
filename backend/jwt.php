<?php
require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWT_Helper
{
  // Load configuration from .env
  private static function loadConfig()
  {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    $dotenv->required(['JWT_SECRET', 'APP_ENV']);
  }

  // Get secret key from environment
  private static function getSecretKey()
  {
    self::loadConfig();
    return $_ENV['JWT_SECRET'];
  }

  private static function getAlgorithm()
  {
    return $_ENV['JWT_ALGORITHM'] ?? 'HS256';
  }

  private static function getExpireTime()
  {
    return $_ENV['JWT_EXPIRE'] ?? 3600;
  }

  public static function generateToken($user_data)
  {
    $issued_at = time();
    $expiration_time = $issued_at + self::getExpireTime();

    $payload = [
      'iat' => $issued_at,
      'exp' => $expiration_time,
      'iss' => $_ENV['APP_NAME'] ?? 'your-app-name',
      'data' => $user_data
    ];

    return JWT::encode($payload, self::getSecretKey(), self::getAlgorithm());
  }

  public static function validateToken($token)
  {
    try {
      $decoded = JWT::decode($token, new Key(self::getSecretKey(), self::getAlgorithm()));
      return (array) $decoded->data;
    } catch (Exception $e) {
      return false;
    }
  }
}
