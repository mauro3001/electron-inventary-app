CREATE DATABASE inventoryDB;

USE inventoryDB;

CREATE TABLE product(
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	description VARCHAR(255),
	price DECIMAL(10,2) NOT NULL,
	PRIMARY KEY (id)
);

DESC product;