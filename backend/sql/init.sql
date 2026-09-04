CREATE DATABASE IF NOT EXISTS restaurant_board
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON restaurant_board.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
