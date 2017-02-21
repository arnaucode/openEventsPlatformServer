var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var eventSchema = new Schema({
    title: { type: String, required: true },
    description:   { type: String, required: true },
    img:   { type: String },
    generateddate: { type: Date, required: true },
    date: { type: Date, required: true },
    categories: [{
        name: {type: String}
    }],
    location: {
        direction: { type: String },
        city:   { type: String },
        district: { type: String },
        geo: {
            lat: {type: Number},
            long: {type: Number},
            name: { type: String}
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    type: {type: String}
});

eventSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('eventModel', eventSchema);
