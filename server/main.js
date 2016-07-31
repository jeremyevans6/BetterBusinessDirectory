import { Meteor } from 'meteor/meteor';
import {FS} from 'meteor/cfs:standard-packages';
import {GridFS} from 'meteor/cfs:gridfs';






Meteor.startup(function(){



  Meteor.publish("listings", function(){
   //Meteor._sleepForMs(5000);
   return Listings.find({}, {
    sort: {createdAt: -1}
   });
  });


  Listings._ensureIndex({ "_id": 1});

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

Meteor.methods({

 insert: function (bizName, bizNameUrl, firstName, lastName, ownerPicture, facebookPersonal, twitterPersonal, linkedInPersonal, instagramPersonal, pinterestPersonal, facebookBusiness, twitterBusiness, linkedInBusiness, instagramBusiness, pinterestBusiness, email, phone, industry, location, website, logo, socialMission, userId, createdAt, captchaData){

   var self = this;

   var clientIP = headers.methodClientIP(self);

   var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(clientIP, captchaData);


   if (!verifyCaptchaResponse.success) {
       console.log('reCAPTCHA check failed!', verifyCaptchaResponse);
       throw new Meteor.Error(422, 'reCAPTCHA Failed: ' + verifyCaptchaResponse.error);
   }

  Listings.insert({
   bizName: bizName,
   bizNameUrl: bizNameUrl,
   firstName: firstName,
   lastName: lastName,
   ownerPicture: ownerPicture,
   facebookPersonal: facebookPersonal,
   twitterPersonal: twitterPersonal,
   linkedInPersonal: linkedInPersonal,
   instagramPersonal: instagramPersonal,
   pinterestPersonal: pinterestPersonal,
   facebookBusiness: facebookBusiness,
   twitterBusiness: twitterBusiness,
   linkedInBusiness: linkedInBusiness,
   instagramBusiness: instagramBusiness,
   pinterestBusiness: pinterestBusiness,
   email: email,
   phone: phone,
   website: website,
   industry: industry,
   location: location,
   logo: logo,
   socialMission: socialMission,
   userId: userId,
   createdAt: new Date()
  });

 }

});