var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GameSchema = new Schema(
  {
    choices: [{type: String, required: true}],
    question: [{type: String}],
    answer: [{type: String}],
    fails: {type: Number, required: true},
  }
)

// Virtual for remaining character(s)
GameSchema.virtual('charsRemaining').get(function () {
  return this.question.length - this.answer.length;
});

//Export model
module.exports = mongoose.model('Game', GameSchema);
