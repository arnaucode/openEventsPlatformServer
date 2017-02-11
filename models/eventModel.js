var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var eventSchema = new Schema({
    title: { type: String },
    description:   { type: String },
    img:   { type: String },
    date: { type: Date },
    categories: [{
        name: {type: String}
    }],
    location: {
        direction: { type: String },
        city:   { type: String },
        district: { type: String },
        geolocation: {
            lat: {type: Number},
            long: {type: Number},
            name: { type: String, required: true }
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }
});

eventSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('eventModel', eventSchema);
