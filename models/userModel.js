var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email:   { type: String, required: true },
    password: { type: String, required: true, select: false },
    tokens: [{
        userAgent: {type: String},
        token: {type: String, select: false},
        os: {type: String},
        browser: {type: String},
        device: {type: String},
        os_version: {type: String},
        browser_version: {type: String},
        ip: {type: String},
        lastLogin: {type: Date},
        birthdate: {type: Date},
    }],
    description:   { type: String },
    img:   { type: String, default: "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png" },
    contact: {
        twitter:   { type: String },
        facebook:   { type: String },
        telegram:   { type: String },
        web:   { type: String },
        phone: { type: Number }
    },
    location:{
        direction: { type: String },
        city:   { type: String },
        district: { type: String },
        geolocation: {
            lat: {type: Number},
            long: {type: Number},
            name: { type: String}
        }
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'eventModel'
    }]
});

userSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('userModel', userSchema);
