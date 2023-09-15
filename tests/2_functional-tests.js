/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done) {
    chai.request(server)
      .get('/api/books')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */
  let id1 = "";
  const invalidId = new mongoose.Types.ObjectId();

  suite('Routing tests', function() {
    this.timeout(5000);

    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        chai
          .request(server)
          .keepOpen()
          .post('/api/books')
          .send({
            title: "title test #1"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'title test #1')
            id1 = res.body._id;
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            done();
          });
      });
      test('Test POST /api/books with no title given', function(done) {
        chai
          .request(server)
          .keepOpen()
          .post('/api/books')
          .send({ title: '' })
          .end(function(err, res) {
            assert.equal(res.text, 'missing required field title')
            done();
          });
      });

    });


    suite('GET /api/books => array of books', function() {

      test('Test GET /api/books', function(done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function() {

      test('Test GET /api/books/[id] with id not in db', function(done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/books/123')
          .end(function(err, res) {
            assert.equal(res.status, 500);
            assert.equal(res.text, 'no book exists')
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done) {
        chai
          .request(server)
          .keepOpen()
          .get(`/api/books/${id1}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            done();
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function() {

      test('Test POST /api/books/[id] with comment', function(done) {
        chai
          .request(server)
          .keepOpen()
          .post(`/api/books/${id1}`)
          .send({
            comment: 'test comment'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            let lastPos = res.body.comments.length - 1;
            assert.equal(res.body.comments[lastPos], 'test comment')
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        chai
          .request(server)
          .keepOpen()
          .post(`/api/books/${id1}`)
          .send({ comment: '' })
          .end(function(err, res) {
            assert.equal(res.text, 'missing required field comment')
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
        chai
          .request(server)
          .keepOpen()
          .post('/api/books/' + invalidId)
          .send({ comment: 'test comment invalid id' })
          .end(function(err, res) {
            assert.equal(res.text, 'no book exists')
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done) {
        chai
          .request(server)
          .keepOpen()
          .delete(`/api/books/${id1}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful')
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done) {
        chai
          .request(server)
          .keepOpen()
          .delete('/api/books/' + invalidId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists')
            done();
          });
      });

    });

  });

});
