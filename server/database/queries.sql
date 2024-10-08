//users TABLE

CREATE TABLE users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(30) NOT NULL
);

SELECT * FROM users;

CREATE TABLE list(
    user_id INTEGER,
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status BOOL NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
);

DROP TABLE list;

SELECT * FROM list;

INSERT INTO list VALUES
(1,1,'hello from database',FALSE),
(1,2,'yup this one is completed',TRUE)
;

INSERT INTO list (user_id, title, status) VALUES
(1, 'yup this one is for completed', FALSE);


SELECT content,type from list where user_id=1;

SELECT list.id,title,status
FROM list
JOIN users ON users.id=list.user_id
WHERE username='virajsurve@gmail.com';

DELETE FROM list
WHERE id=7;

UPDATE list 
SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END
WHERE id = 5;
