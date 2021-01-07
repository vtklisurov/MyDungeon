CREATE TABLE addresses
(
  id bigint NOT NULL,
  user_id bigserial NOT NULL,
  country text NOT NULL,
  postal text NOT NULL,
  city text NOT NULL,
  str_address text NOT NULL
);

ALTER TABLE addresses ADD CONSTRAINT pk_addresses
  PRIMARY KEY (id);

CREATE TABLE cart_products
(
  card_id bigserial NOT NULL,
  product_id bigserial NOT NULL,
  quantity integer NOT NULL,
  price bigint NOT NULL
);

ALTER TABLE cart_products ADD CONSTRAINT pk_cart_products
  PRIMARY KEY (card_id, product_id);

CREATE TABLE carts
(
  cart_id bigserial NOT NULL,
  user_id bigserial NOT NULL,
  created timestamp NOT NULL
);

ALTER TABLE carts ADD CONSTRAINT pk_carts
  PRIMARY KEY (cart_id);

CREATE TABLE order_products
(
  order_id bigserial NOT NULL,
  product_id bigserial NOT NULL,
  quantity integer NOT NULL,
  price bigint NOT NULL
);

ALTER TABLE order_products ADD CONSTRAINT pk_order_products
  PRIMARY KEY (order_id, product_id);

CREATE TABLE orders
(
  id bigserial NOT NULL,
  cart_id bigserial NOT NULL,
  user_id bigserial NOT NULL,
  placed timestamp NOT NULL,
  status smallint NOT NULL,
  address_id bigint
);

ALTER TABLE orders ADD CONSTRAINT pk_orders
  PRIMARY KEY (id);

CREATE TABLE orders_status
(
  status smallint NOT NULL,
  meaning varchar(50) NOT NULL
);

ALTER TABLE orders_status ADD CONSTRAINT pk_orders_status
  PRIMARY KEY (status);

CREATE TABLE payment_type
(
  type smallint NOT NULL,
  meaninig varchar(50) NOT NULL
);

ALTER TABLE payment_type ADD CONSTRAINT pk_payment_type
  PRIMARY KEY (type);

CREATE TABLE payments
(
  id bigserial NOT NULL,
  order_id bigserial NOT NULL,
  is_paid boolean NOT NULL,
  time_paid time,
  type smallint NOT NULL,
  amount bigint NOT NULL
);

ALTER TABLE payments ADD CONSTRAINT pk_payments
  PRIMARY KEY (id);

CREATE TABLE products
(
  id bigserial NOT NULL,
  name text NOT NULL,
  image_loc text,
  description text,
  stock integer NOT NULL,
  price bigint NOT NULL,
  for_sale boolean NOT NULL
);

ALTER TABLE products ADD CONSTRAINT pk_products
  PRIMARY KEY (id);

CREATE TABLE staff
(
  staff_id bigserial NOT NULL,
  username text NOT NULL,
  pass text NOT NULL,
  fname text NOT NULL,
  lname text NOT NULL,
  email text NOT NULL,
  created timestamp NOT NULL,
  last_login timestamp
);

ALTER TABLE staff ADD CONSTRAINT pk_staff
  PRIMARY KEY (staff_id);

CREATE TABLE user_status
(
  status smallint NOT NULL,
  meaning varchar(50)
);

ALTER TABLE user_status ADD CONSTRAINT pk_user_status
  PRIMARY KEY (status);

CREATE TABLE users
(
  user_id bigserial NOT NULL,
  username text NOT NULL,
  pass text NOT NULL,
  fname text NOT NULL,
  lname text NOT NULL,
  email text NOT NULL,
  status smallint NOT NULL,
  hash text NOT NULL,
  created timestamp NOT NULL,
  last_login timestamp
);

ALTER TABLE users ADD CONSTRAINT pk_users
  PRIMARY KEY (user_id);

CREATE TABLE wishlists
(
  user_id bigserial NOT NULL,
  product_id bigserial NOT NULL
);

ALTER TABLE wishlists ADD CONSTRAINT pk_wishlists
  PRIMARY KEY (user_id, product_id);

ALTER TABLE addresses ADD CONSTRAINT fk_addresses_user_id
  FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE cart_products ADD CONSTRAINT fk_cart_products_cart_id
  FOREIGN KEY (card_id) REFERENCES carts (cart_id);

ALTER TABLE cart_products ADD CONSTRAINT fk_cart_products_pid
  FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE carts ADD CONSTRAINT fk_carts_user_id
  FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE order_products ADD CONSTRAINT fk_order_products_id
  FOREIGN KEY (order_id) REFERENCES orders (id);

ALTER TABLE order_products ADD CONSTRAINT fk_order_products_pid
  FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE orders ADD CONSTRAINT fk_orders_cart_id
  FOREIGN KEY (cart_id) REFERENCES carts (cart_id);

ALTER TABLE orders ADD CONSTRAINT fk_orders_id
  FOREIGN KEY (address_id) REFERENCES addresses (id);

ALTER TABLE orders ADD CONSTRAINT fk_orders_status
  FOREIGN KEY (status) REFERENCES orders_status (status);

ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id
  FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE payments ADD CONSTRAINT fk_payments_id
  FOREIGN KEY (order_id) REFERENCES orders (id);

ALTER TABLE payments ADD CONSTRAINT fk_payments_type
  FOREIGN KEY (type) REFERENCES payment_type (type);

ALTER TABLE users ADD CONSTRAINT fk_users_status
  FOREIGN KEY (status) REFERENCES user_status (status);

ALTER TABLE wishlists ADD CONSTRAINT fk_wishlists_pid
  FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE wishlists ADD CONSTRAINT fk_wishlists_user_id
  FOREIGN KEY (user_id) REFERENCES users (user_id);
