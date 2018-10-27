CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products
(
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(45) NOT NULL,
    price INT default 0,
    stock_quantity INT default 0,
    PRIMARY KEY(item_id)
);

INSERT INTO products (product_name,  department_name, price, stock_quantity) 
VALUES ("Nicolas Cage Pillow Case", "Home", 15, 200);
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Bacon Flavored Floss", "Health", 5, 200);
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Tongue Brush for Cat", "Pets", 9.95, 200)
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Mullet Headband", "Fashion", 17, 200)
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Cat Riding Llamacorn T-shirt", "Fashion", 15, 200);
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Sushi Bazooka", "Kitchen", 25, 200);
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Cat Turntable Scratching Post", "Pets", 25, 200);
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Inflatable Unicorn Horn for Cats", "Pets", 8, 200);
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Shakespearean Insult Bandages", "Health", 6, 200);
INSERT INTO products (product_name,  department_name, price, stock_quantity)
VALUES ("Glow in the Dark Zombie Playset", "Toys", 11, 200);