-- postgres 슈퍼유저로 실행
CREATE USER appuser WITH PASSWORD 'apppassword';
CREATE DATABASE restaurant_board OWNER appuser;
