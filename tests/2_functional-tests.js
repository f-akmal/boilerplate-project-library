/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .post('/api/books')
      .send({ title: 'Of Mice and Men' })
      .end((err, res) => {
        chai.request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body, 'response should be an array')
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
            assert.property(res.body[0], 'title', 'Books in array should contain title')
            assert.property(res.body[0], '_id', 'Books in array should contain _id')
            done()
          })
      })
  })
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {


    suite('POST /api/books with title => create book object/expect book object', function () {

      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'The Old Man and the Sea' })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.title, 'The Old Man and the Sea')
            assert.exists(res.body._id)
            done()
          })
      })

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.message, 'missing title')
            done()
          })
      })
    })


    suite('GET /api/books => array of books', function () {

      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body, 'response should be an array')
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
            assert.property(res.body[0], 'title', 'Books in array should contain title')
            assert.property(res.body[0], '_id', 'Books in array should contain _id')
            done()
          })
      })
    })


    suite('GET /api/books/[id] => book object with [id]', function () {

      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get('/api/books/fakeIdfakeId')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.message, 'no book exists')
            done()
          })
      })

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Peter and Jane' })
          .end((err, res) => {
            const { _id } = res.body
            chai.request(server)
              .get(`/api/books/${_id}`)
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.body.title, 'Peter and Jane')
                assert.equal(res.body._id, _id)
                assert.isArray(res.body.comments)
                done()
              })
          })
      })
    })


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Peter and Jane' })
          .end((err, res) => {
            const { _id } = res.body
            chai.request(server)
              .post(`/api/books/${_id}`)
              .send({ comment: 'Great book for kids' })
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.body.title, 'Peter and Jane')
                assert.equal(res.body._id, _id)
                assert.isArray(res.body.comments)
                assert.include(res.body.comments, 'Great book for kids')
                done()
              })
          })
      })
    })

    suite('DELETE /api/books/[id] => delete a book from the collection', () => {
      test('Test DELETE /api/books/[id] with id not in db', done => {
        chai.request(server)
          .delete('/api/books/fakeIdfakeId')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.message, 'no book exists')
            done()
          })
      })
      test('Test DELETE /api/books/[id] with valid id in db', done => {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Peter and Jane' })
          .end((err, res) => {
            const { _id } = res.body
            chai.request(server)
              .delete(`/api/books/${_id}`)
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.body.message, 'delete successful')
                done()
              })
          })
      })
    })

    suite('DELETE /api/books => delete all books in the database', () => {
      test('Test DELETE /api/books', done => {
        chai.request(server)
          .delete('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.message, 'complete delete successful')
            done()
          })
      })
    })
  })
})
