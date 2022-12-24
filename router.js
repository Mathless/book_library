const _ = require('lodash');
const uuid = require('uuid');
const express = require('express');
const router = express.Router();
const fs = require('fs');

function addStatus(book) {
  book.status = 'В наличии';
  if (book.reader && new Date(book.reader.returnDate) < new Date()) {
    book.status = 'Возврат просрочен';
  } else if (book.reader) {
    book.status = 'У читателя';
  }
  if (!book.reader) {
    book.reader = {};
  }
}

function getLibrary() {
  const rawdata = fs.readFileSync('library.json');
  const library = JSON.parse(rawdata);

  library.books.forEach((book) => {
    addStatus(book);
  });
  return library;
}

const library = getLibrary();

router.get('/', (req, res) => {
  res.render('table', {
    value: library.books,
  });
});

router.get('/book/:id', (req, res) => {
  const book = library.books.filter((book) => {
    return book.id === req.params.id;
  });
  if (book.length > 0)
    res.render('book', {
      book: book[0],
    });
});

router.get('/add-book', (req, res) => {
  res.render('add-book', {});
});

router.post('/add-book', (req, res, next) => {
  const body = req.body;
  if (body === undefined || !body.title || !body.author || !body.releaseDate) {
    res.status(400);
    res.json({ message: 'Bad Request' });
  } else {
    const book = {
      id: uuid.v4(),
      title: body.title,
      author: body.author,
      releaseDate: body.releaseDate,
    };
    addStatus(book);
    library.books.push(book);
    res.status(200);
    res.send(book);
  }
});

router.post('/give-to-reader', (req, res, next) => {
  const body = req.body;
  if (body === undefined || !body?.reader?.FIO || !body?.reader?.returnDate || !body?.id) {
    res.status(400);
    res.json({ message: 'Bad Request' });
  } else {
    const booksArray = library.books.filter((val) => val.id === body.id);
    if (booksArray.length > 0) {
      booksArray[0].reader = body.reader;
    }
    addStatus(booksArray[0]);
    res.status(200);
    res.send(booksArray[0]);
  }
});

router.put('/edit-book', (req, res, next) => {
  const body = req.body;
  if (body === undefined || !body?.id) {
    res.status(400);
    res.json({ message: 'Bad Request' });
  } else {
    const booksArray = library.books.filter((val) => val.id === body.id);
    if (booksArray.length > 0) {
      _.merge(booksArray[0], req.body);
      res.status(200);
      res.send(booksArray[0]);
    }
  }
});

router.post('/return-book', (req, res, next) => {
  const body = req.body;
  if (body === undefined || !body?.id) {
    res.status(400);
    res.json({ message: 'Bad Request' });
  } else {
    const booksArray = library.books.filter((val) => val.id === body.id);
    if (booksArray.length > 0) {
      delete booksArray[0].reader;
      addStatus(booksArray[0]);
    }
    res.status(200);
    res.send(booksArray[0]);
  }
});

router.delete('/book/:id', (req, res) => {
  library.books = library.books.filter((book) => {
    return book.id !== req.params.id;
  });
  res.status(200);
  res.send();
});

router.get('/filter-by-status', (req, res) => {
  res.send(library.books.filter((val) => val.status === 'В наличии'));
});
router.get('/sort-by-return-date', (req, res) => {
  res.send(
    library.books.sort((a, b) => {
      return (
        new Date(a.reader?.returnDate ? a.reader?.returnDate : '9001-01-01') -
        new Date(b.reader?.returnDate ? b.reader?.returnDate : '9001-01-01')
      );
    })
  );
});
module.exports = router;
