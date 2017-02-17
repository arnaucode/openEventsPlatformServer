var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email:   { type: String, required: true },
    password: { type: String, required: true, select: false },
    tokens: [{
        userAgent: {type: String, select: false},
        token: {type: String, select: false},
        os: {type: String, select: false},
        browser: {type: String, select: false},
        device: {type: String, select: false},
        os_version: {type: String, select: false},
        browser_version: {type: String, select: false},
        ip: {type: String, select: false},
        lastLogin: {type: Date, select: false},
        birthdate: {type: Date, select: false},
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
        geo: {
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
