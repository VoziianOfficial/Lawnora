<?php

/**
 * Lawnora contact/request form endpoint.
 *
 * This endpoint only sends emails on a server that supports PHP mail().
 * For local testing, run:
 *
 * php -S localhost:8000
 *
 * Then open:
 * http://localhost:8000/contact.html
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Please submit the form using POST.');
}

$recipientEmail = 'support@lawnora.com';
$brandName = 'Lawnora';

$requiredFields = [
    'fullName',
    'email',
    'phone',
    'service',
    'message',
    'privacyConsent'
];

$honeypot = trim((string)($_POST['website'] ?? ''));

if ($honeypot !== '') {
    respond(false, 'Please check the required fields and try again.');
}

$formStartedAt = (string)($_POST['formStartedAt'] ?? '');
$minimumSeconds = 3;

if ($formStartedAt !== '' && ctype_digit($formStartedAt)) {
    $elapsedSeconds = (time() * 1000 - (int)$formStartedAt) / 1000;

    if ($elapsedSeconds < $minimumSeconds) {
        respond(false, 'Please check the required fields and try again.');
    }
}

foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || trim((string)$_POST[$field]) === '') {
        respond(false, 'Please check the required fields and try again.');
    }
}

$fullName = sanitizeText((string)$_POST['fullName']);
$email = sanitizeEmail((string)$_POST['email']);
$phone = sanitizeText((string)$_POST['phone']);
$service = sanitizeText((string)$_POST['service']);
$message = sanitizeTextarea((string)$_POST['message']);
$sourcePage = sanitizeText((string)($_POST['sourcePage'] ?? 'Unknown page'));
$privacyConsent = sanitizeText((string)($_POST['privacyConsent'] ?? ''));
$formBrand = sanitizeText((string)($_POST['brand'] ?? $brandName));
$formRecipient = sanitizeEmail((string)($_POST['recipient'] ?? $recipientEmail));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please check the required fields and try again.');
}

if ($formRecipient !== '' && filter_var($formRecipient, FILTER_VALIDATE_EMAIL)) {
    $recipientEmail = $formRecipient;
}

if (strtolower($privacyConsent) !== 'yes') {
    respond(false, 'Please check the required fields and try again.');
}

$subject = 'New Lawnora Lawn Care Request';

$emailBody = buildEmailBody([
    'Brand' => $formBrand,
    'Full name' => $fullName,
    'Email' => $email,
    'Phone' => $phone,
    'Service category' => $service,
    'Message' => $message,
    'Source page' => $sourcePage,
    'Privacy consent' => $privacyConsent,
    'Submitted at' => date('Y-m-d H:i:s')
]);

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: Lawnora Website <no-reply@' . getServerDomain() . '>';
$headers[] = 'Reply-To: ' . $fullName . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$mailSent = @mail(
    $recipientEmail,
    encodeSubject($subject),
    $emailBody,
    implode("\r\n", $headers)
);

if (!$mailSent) {
    respond(false, 'Please check the required fields and try again.');
}

respond(true, 'Thank you. Your request has been received.');

function sanitizeText(string $value): string
{
    $value = trim($value);
    $value = strip_tags($value);
    $value = preg_replace('/[\r\n]+/', ' ', $value);
    $value = preg_replace('/\s+/', ' ', $value);

    return mb_substr($value, 0, 300);
}

function sanitizeTextarea(string $value): string
{
    $value = trim($value);
    $value = strip_tags($value);
    $value = preg_replace("/\r\n|\r|\n/", "\n", $value);
    $value = preg_replace("/[ \t]+/", ' ', $value);

    return mb_substr($value, 0, 4000);
}

function sanitizeEmail(string $value): string
{
    $value = trim($value);
    $value = filter_var($value, FILTER_SANITIZE_EMAIL);

    return mb_substr((string)$value, 0, 254);
}

function buildEmailBody(array $fields): string
{
    $lines = [];

    $lines[] = 'New Lawnora lawn care provider-matching request';
    $lines[] = '================================================';
    $lines[] = '';

    foreach ($fields as $label => $value) {
        $lines[] = $label . ':';
        $lines[] = (string)$value;
        $lines[] = '';
    }

    $lines[] = 'Aggregator clarification:';
    $lines[] = 'Lawnora is an independent provider-matching platform and does not perform lawn care directly. Final pricing, scheduling, availability, service scope, warranties, and terms are provided by participating providers.';

    return implode("\n", $lines);
}

function encodeSubject(string $subject): string
{
    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

function getServerDomain(): string
{
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $host = preg_replace('/[^a-zA-Z0-9\.\-]/', '', $host);

    if (!$host) {
        return 'localhost';
    }

    return $host;
}

function respond(bool $success, string $message): void
{
    echo json_encode([
        'success' => $success,
        'message' => $message
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    exit;
}
