<?php
file_put_contents(__DIR__ . '/webhook_log.txt', date('Y-m-d H:i:s') . " - " . file_get_contents('php://input') . "\n", FILE_APPEND);
http_response_code(200);
echo json_encode(['status' => 'ok']);
