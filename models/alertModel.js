var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var alertSchema = new Schema({
    title: { type: String },
    description:   { type: String },
    img:   { type: String },
    date: { type: Date },
    location:{
        direction: { type: String },
        city:   { type: String },
        district: { type: String },
        geo: {
            lat: {type: Number},
            long: {type: Number},
            name: { type: String }
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }
});

alertSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('alertModel', alertSchema);
