/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict'

const expect = require('chai').expect
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const MONGODB_CONNECTION_STRING = process.env.DB
const mongoose = require('mongoose')
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
})

bookSchema.virtual('commentcount').get(function () { return this.comments.length })

const Book = mongoose.model('Book', bookSchema)

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, (err, docs) => {
        res.json(docs.map(doc => doc.toJSON({ virtuals: true })))
      })
    })

    .post(function (req, res) {
      const title = req.body.title
      //response will contain new book object including atleast _id and title
      const book = new Book({ title })
      book.save((err, doc) => {
        if (err) return res.json({ message: 'missing title' })
        res.json(book.toJSON({ virtuals: true }))
      })
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, err => {
        res.json({ message: 'complete delete successful' })
      })
    })



  app.route('/api/books/:id')
    .get(function (req, res) {
      const bookid = req.params.id
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findOne({ _id: bookid }, (err, book) => {
        if (!book) return res.json({message: 'no book exists'})
        res.json(book.toJSON())
      })
    })

    .post(function (req, res) {
      const bookid = req.params.id
      const comment = req.body.comment
      //json res format same as .get
      Book.findByIdAndUpdate(
        bookid,
        { $push: { 'comments': comment } },
        { lean: true , new: true},
        (err, book) => {
          if (err) return res.json({message: 'no book exists'})
          res.json(book)
        })
    })

    .delete(function (req, res) {
      const bookid = req.params.id
      //if successful response will be 'delete successful'
      Book.findById(bookid, (err, book) => {
        if (!book) return res.json({message: 'no book exists'})
        book.remove((err, doc) => res.json({message: 'delete successful'}))
      })
    })
}
