/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';


//Mongoose config
require('dotenv').config()
let bodyParser = require('body-parser');
const mongoose = require('mongoose');

const mySecret = process.env['MONGO_URI']

try {
  mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('db connected')
} catch (err) {
  console.log(err)
}

const { Schema } = mongoose;

const BookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  comments: [],
  commentCount: {
    type: Number,
    default: 0,
  },
});
const Book = mongoose.model('Book', BookSchema);

exports.Book = Book;
// End of mongoose config


module.exports = function(app) {

  app.route('/api/books')
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      Book.find()
        .then((books) => {
          const simplifiedBooks = books.map((book) => {
            return {
              _id: book._id,
              title: book.title,
              commentcount: book.commentCount
            };
          });
          res.status(200).json(simplifiedBooks)
        })
        .catch((err) => {
          res.status(500).json({ error: 'Error getting books' });
        });
    })

    .post(async function(req, res) {
      let title = req.body.title;

      //response will contain new book object including atleast _id and title
      if (!title || title === '') {
        return res.send('missing required field title');
      }

      const newBook = new Book({
        title: title,
        comments: [],
        commentCount: 0
      });

      newBook.save()
        .then((book) => {
          res.status(200).json({ _id: newBook._id, title: newBook.title });
        })
        .catch((err) => {
          res.status(500).json({ error: 'Error creating book' });
        });
    })

    .delete(async function(req, res) {
      //if successful response will be 'complete delete successful'

      await Book.deleteMany({})
        .then((book) => {
          res.status(200).send("complete delete successful");
        })
        .catch((err) => {
          res.status(500).send("error deleting all books");
        });
    })



  app.route('/api/books/:id')
    .get(function(req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      Book.find({ _id: bookid })
        .then((book) => {
          if (book.length === 0) {
            return res.status(200).send("no book exists");
          } else {
            return res.status(200).json(book[0]);
          }
        })
        .catch((err) => {
          res.status(500).send("no book exists");
        });
    })

    .post(async function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) {
        return res.send('missing required field comment');
      }

      const book = await Book.findOne({ _id: bookid });
      if (!book) {
        return res.send('no book exists');
      } else {
        book.comments.push(comment);

        book.save()
          .then((book) => {
            res.status(200).json(book);
          })
          .catch((err) => {
            res.status(500).send('error creating comment');
          });
      }

    })

    .delete(async function(req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      await Book.deleteOne({ _id: bookid })
        .then((data) => {
          if (data.deletedCount === 1) {
            res.status(200).send("delete successful");
          } else {
            res.status(200).send("no book exists");
          }
        })
        .catch((err) => {
          res.status(500).send("error deleting books");
        });
    })


};
