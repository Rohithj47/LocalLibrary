var mongoose = require('mongoose')
var { DateTime } = require('luxon')

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual to get and set Full name of document 
AuthorSchema
.virtual('fullname')
.get(function(){
    var fullname = ' '
    if(this.first_name && this.family_name){
        fullname = this.first_name + ' ' + this.family_name
    }
    else{
        fullname = ' '
    }
    return fullname
})
.set(function(v){
    const first_name = v.substring(0, v.indexof(' '))
    const family_name = v.substring(v.indexof(' ') + 1)
})

AuthorSchema.virtual('lifespan')
.get(function(){
    var lifespan = ''
    if(this.date_of_birth){
        lifespan = this.date_of_birth.getYear().toString();
    }
    lifespan += ' - '
    if(this.date_of_death){
        lifespan += this.date_of_death.getYear()
    }
    return lifespan
})

AuthorSchema.virtual('dob')
.get(function(){
    if (this.date_of_birth){
        return DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }
    return null
})

AuthorSchema.virtual('dod')
.get(function(){
    if (this.date_of_death){
        return DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    }
    return null  
})
// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema)