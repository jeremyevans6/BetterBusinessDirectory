import { Meteor } from 'meteor/meteor';
import {FS} from 'meteor/cfs:standard-packages';
import {GridFS} from 'meteor/cfs:gridfs';


Meteor.startup(function(){
  // code to run on server at startup

  Meteor.publish("listings", function(){
   //Meteor._sleepForMs(5000);
   return Listings.find();
  });

  Meteor.publish('images', function () { 
    Meteor.Images.find({});
  });

  reCAPTCHA.config({
    privatekey: '6LeLvyITAAAAAH4-TlJbuZl69v4tNwS-00yJ34HX'
   });

  Accounts.config({
   sendVerificationEmail: true, 
   forbidClientAccountCreation: false}); 


  smtp = {
    username: 'jeremy@betterbetterbetter.org',   // eg: server@gentlenode.com
    password: 'Qazsxdrewazx1',   // eg: 3eeP1gtizk5eziohfervU
    server:   'smtp.gmail.com',  // eg: mail.gandi.net
    port: 25
  }

  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;


});

Images.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc) {
        return true;
    },
    download: function (userId) {
        return true;
    }
}); 

Listings.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc) {
        return true;
    }
});