<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, bool $ok, string $message): never {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Method not allowed.');
}

// Honeypot spam field
if (!empty($_POST['website'] ?? '')) {
    respond(200, true, 'OK');
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($message === '') {
    respond(422, false, 'Please enter an idea or recommendation.');
}
if (mb_strlen($message) > 5000 || mb_strlen($name) > 100 || mb_strlen($email) > 160) {
    respond(422, false, 'Submission is too long.');
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, false, 'Please enter a valid email address.');
}

$name = str_replace(["\r", "\n"], ' ', $name);
$email = str_replace(["\r", "\n"], '', $email);

$configFile = __DIR__ . '/smtp-config.php';
if (!is_file($configFile)) {
    respond(500, false, 'Email service is not configured yet.');
}

$config = require $configFile;
$host = (string)($config['host'] ?? 'smtp.ionos.com');
$port = (int)($config['port'] ?? 465);
$username = (string)($config['username'] ?? '');
$password = (string)($config['password'] ?? '');
$from = (string)($config['from'] ?? $username);
$to = (string)($config['to'] ?? 'mo@moomaf.com');

if ($username === '' || $password === '' || $from === '' || $to === '') {
    respond(500, false, 'SMTP credentials are incomplete.');
}

function smtpRead($socket): string {
    $data = '';
    while (($line = fgets($socket, 515)) !== false) {
        $data .= $line;
        if (preg_match('/^\d{3} /', $line)) break;
    }
    return $data;
}

function smtpExpect($socket, array $codes): string {
    $response = smtpRead($socket);
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $codes, true)) {
        throw new RuntimeException('SMTP error ' . $code);
    }
    return $response;
}

function smtpCommand($socket, string $command, array $codes): string {
    fwrite($socket, $command . "\r\n");
    return smtpExpect($socket, $codes);
}

try {
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false
        ]
    ]);

    $socket = stream_socket_client(
        "ssl://{$host}:{$port}",
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket) {
        throw new RuntimeException("Could not connect to SMTP server.");
    }

    stream_set_timeout($socket, 20);

    smtpExpect($socket, [220]);
    smtpCommand($socket, 'EHLO moomaf.com', [250]);
    smtpCommand($socket, 'AUTH LOGIN', [334]);
    smtpCommand($socket, base64_encode($username), [334]);
    smtpCommand($socket, base64_encode($password), [235]);
    smtpCommand($socket, 'MAIL FROM:<' . $from . '>', [250]);
    smtpCommand($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
    smtpCommand($socket, 'DATA', [354]);

    $safeName = $name !== '' ? $name : 'Anonymous';
    $safeEmail = $email !== '' ? $email : 'Not provided';
    $subject = 'New Moomaf community idea';

    $headers = [
        'From: Moomaf Website <' . $from . '>',
        'To: <' . $to . '>',
        'Subject: ' . $subject,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8'
    ];
    if ($email !== '') {
        $headers[] = 'Reply-To: ' . $email;
    }

    $body =
        "New idea submitted on Moomaf.com\r\n\r\n" .
        "Name: {$safeName}\r\n" .
        "Email: {$safeEmail}\r\n\r\n" .
        "Idea / recommendation:\r\n{$message}\r\n\r\n" .
        "Submitted: " . gmdate('Y-m-d H:i:s') . " UTC\r\n";

    // SMTP dot-stuffing
    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $body;
    $payload = preg_replace('/(?m)^\./', '..', $payload);

    fwrite($socket, $payload . "\r\n.\r\n");
    smtpExpect($socket, [250]);
    smtpCommand($socket, 'QUIT', [221]);
    fclose($socket);

    respond(200, true, 'Submitted successfully.');
} catch (Throwable $e) {
    error_log('Moomaf SMTP error: ' . $e->getMessage());
    respond(500, false, 'Email delivery failed. Please try again later.');
}
