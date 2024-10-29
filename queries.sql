CREATE TABLE books (
id SERIAL PRIMARY KEY,
book_name VARCHAR(100) UNIQUE NOT NULL,
author VARCHAR(100) NOT NULL
);

CREATE TABLE notes (
id SERIAL PRIMARY KEY,
book_id INT NOT NULL REFERENCES books(id),
note TEXT
);

CREATE TABLE ratings (
id SERIAL PRIMARY KEY,
book_id INT NOT NULL REFERENCES books(id),
rating INT NOT NULL
);

CREATE TABLE completion_date (
id SERIAL PRIMARY KEY,
book_id INT NOT NULL REFERENCES books(id),
month VARCHAR(9) NOT NULL,
year INT NOT NULL
);

CREATE TABLE wishlist (
id SERIAL PRIMARY KEY,
book_name VARCHAR(100) NOT NULL UNIQUE,
author VARCHAR(100) NOT NULL,
api_id VARCHAR (100)
);

-- //////////// Select content for My Books list ////////////////

SELECT books.id, book_name, author, note, rating, month, year FROM books
INNER JOIN notes ON notes.book_id = books.id
INNER JOIN ratings ON ratings.book_id = books.id
INNER JOIN completion_date ON completion_date.book_id = books.id
