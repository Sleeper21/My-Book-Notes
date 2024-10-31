CREATE TABLE books (
id SERIAL PRIMARY KEY,
book_name VARCHAR(100) UNIQUE NOT NULL,
author VARCHAR(100) NOT NULL,
api_id TEXT NOT NULL DEFAULT 'n/a'
);

CREATE TABLE notes (
id SERIAL PRIMARY KEY,
book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
note TEXT
);

CREATE TABLE ratings (
id SERIAL PRIMARY KEY,
book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
rating INT NOT NULL
);

CREATE TABLE completion_date (
id SERIAL PRIMARY KEY,
book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
month VARCHAR(9) NOT NULL,
year INT NOT NULL
);

CREATE TABLE thumbnails (
id SERIAL PRIMARY KEY,
book_id IN NOT NULL REFERENCES books(id) ON DELETE CASCADE,
small_image TEXT,
image TEXT
)

CREATE TABLE wishlist (
id SERIAL PRIMARY KEY,
book_name VARCHAR(100) NOT NULL UNIQUE,
author VARCHAR(100) NOT NULL,
api_id VARCHAR (100)
);

-- //////////// Select content for My Books list ////////////////

SELECT books.id, book_name, author, api_id, note, rating, month, year, small_image
FROM books 
INNER JOIN notes ON notes.book_id = books.id 
INNER JOIN ratings ON ratings.book_id = books.id 
INNER JOIN completion_date ON completion_date.book_id = books.id 
INNER JOIN thumbnails ON thumbnails.book_id = books.id 
ORDER BY books.id DESC;

-- //////////// Select content for edit notes ////////////////
SELECT books.id, book_name, author, api_id, note, rating, month, year, small_image
FROM books
INNER JOIN notes ON notes.book_id = books.id
INNER JOIN ratings ON ratings.book_id = books.id 
INNER JOIN completion_date ON completion_date.book_id = books.id 
INNER JOIN thumbnails ON thumbnails.book_id = books.id
WHERE api_id = $1, [id]
