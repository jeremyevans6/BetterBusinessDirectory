

Listings = new Mongo.Collection("listings"); 

Listings.permit(['insert', 'update', 'deleter']).ifLoggedIn();


     mapStyle = [
         {
           "featureType": "water",
           "stylers": [
             { "hue": "#8800ff" },
             { "saturation": 19 },
             { "lightness": -80 }
           ]
         },{
           "featureType": "landscape.natural",
           "stylers": [
             { "hue": "#ff00aa" },
             { "saturation": 50 },
             { "lightness": -15 }
           ]
         },{
           "featureType": "landscape.man_made",
           "stylers": [
             { "hue": "#ff00ee" },
             { "saturation": 100 },
             { "lightness": -15 },
             { "gamma": 0.76 }
           ]
         }
       ];


Listings.attachSchema(new SimpleSchema({
 bizName: {
  type: String,
  label: 'Business Name',
  max: 200
 },
 bizNameUrl: {
  type: String,
  label: 'Business Name, URL Friendly',
  max: 200
 },
 firstName: {
  type: String,
  label: 'Owner\'s First Name',
  optional: true
 },
 lastName: {
  type: String,
  label: 'Owner\'s Last Name',
  optional: true
 },
 ownerPicture: {
    type: String,
  label: 'Headshot of the Owner',
  optional: true,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images',
        label: 'Upload a file'
      }
    }
  },
  facebookPersonal: {
   type: String,
   label: 'Facebook',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  twitterPersonal: {
   type: String,
   label: 'Twitter',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  linkedInPersonal: {
   type: String,
   label: 'LinkedIn',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  instagramPersonal: {
   type: String,
   label: 'Instagram',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  pinterestPersonal: {
   type: String,
   label: 'Pinterest',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  facebookBusiness: {
   type: String,
   label: 'Facebook',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  twitterBusiness: {
   type: String,
   label: 'Twitter',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  linkedInBusiness: {
   type: String,
   label: 'LinkedIn',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  instagramBusiness: {
   type: String,
   label: 'Instagram',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
  pinterestBusiness: {
   type: String,
   label: 'Pinterest',
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
 email: {
  type: String,
  label: 'Customer-facing Email',
  regEx: SimpleSchema.RegEx.Email,
  optional: true
 },
 phone: {
  type: Number,
  label: 'Customer-facing Phone',
  optional: true
 },
 website: {
   type: String,
   regEx: SimpleSchema.RegEx.Url,
   optional: true
  },
 industry: {
    type: String,
    label: "Industry",
    allowedValues: ['Art', 'Entrepreneur', 'Finance', 'Hospitality', 'Health', 'Communications', 'Earth Stewardship', 'Social Reform', 'Transportation'],
    autoform: {
      options: [
        {label: "Art / Fashion / Expression", value: "Art"},
        {label: "Entrepreneurship / Empowerment", value: "Entrepreneur"},
        {label: "Finance / Lending", value: "Finance"},
        {label: "Food / Hospitality", value: "Hospitality"},
        {label: "Health / Beauty / Fitness", value: "Health"},
        {label: "Information Technology / Communications", value: "Communications"},
        {label: "Outdoor Stewardship / Agriculture / Landscaping", value: "Earth Stewardship"},
        {label: "Political Activism / Reform", value: "Social Reform"},
        {label: "Transportation", value: "Transportation"}
      ]
    }
 },
 socialMission: {
  type: String,
  label: 'Social Mission',
  optional: false,
   autoform: {
      type: "froalaEditor",
      afFieldInput:{
        froalaOptions:{
          theme: 'red',
          inlineMode: true,
          buttons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertVideo', 'insertTable', '|', 'quote', 'insertHR', 'undo', 'redo', 'clearFormatting', 'selectAll', 'html'],
          height: '400'
         },
       },
     },
 },
 location: {
    type: [Number],
    decimal: true,
    autoform:{
      type: 'map',
      afFieldInput:{
        zoom: 8,
        geolocation: true,
        searchBox: true,
        autolocate: true,
        mapType: 'satellite',
        googleMap: {
         height: '450px',
         width: "66%",
         backgroundColor: '#800080',
         mapTypeId: 'hybrid',
         styles: mapStyle,
         streetViewControl: true,
         zoom: 8
        }
      },
     },
  },
 logo: {
  type: String,
  label: 'Logo',
  optional: true,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images',
        label: 'Upload a file'
      }
    }
  },
 userId: {
  type: String,
  label: 'User Id'
 },
 createdAt: {
  type: Date,
  label: 'Created At:'
 }

}));


Meteor.methods({
 insert: function (bizName, bizNameUrl, firstName, lastName, ownerPicture, facebookPersonal, twitterPersonal, linkedInPersonal, instagramPersonal, pinterestPersonal, facebookBusiness, twitterBusiness, linkedInBusiness, instagramBusiness, pinterestBusiness, email, phone, industry, location, website, logo, socialMission, userId, createdAt, captchaData){

  /*
  var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captchaData);

  if (!verifyCaptchaResponse.success) {
      console.log('reCAPTCHA check failed!', verifyCaptchaResponse);
      throw new Meteor.Error(422, 'reCAPTCHA Failed: ' + verifyCaptchaResponse.error);
  }
*/

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

  setTimeout(function(){
   $listingsGrid.isotope('layout')
  }, 777);

 },

 deleter: function (id){
  Listings.remove(id);
 },

 update: function(_id, bizName, bizNameUrl, firstName, lastName, ownerPicture, facebookPersonal, twitterPersonal, linkedInPersonal, instagramPersonal, pinterestPersonal, facebookBusiness, twitterBusiness, linkedInBusiness, instagramBusiness, pinterestBusiness, email, phone, industry, location, website, logo, socialMission, userId){


  Listings.update({_id: _id},{$set:{
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
   userId: userId
  }});
 }


});


var imageStore = new FS.Store.GridFS("images", {
 //this for options

});

Images = new FS.Collection("images", {
    stores: [imageStore]
});





