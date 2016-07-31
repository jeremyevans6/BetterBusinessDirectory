
Template.profile.helpers({

 profilePageMapOptions: function() {

   if (GoogleMaps.loaded()) {
    return {
     backgroundColor: '#1E001E',
      center: new google.maps.LatLng(40.0202397, -105.0844522),
      zoom: 1,
      mapTypeId: 'hybrid',
      styles: mapStyle,
      streetViewControl: true
    };
   }
 },

 websitePretty: function(website){
  if(website !== undefined){
   var websitePretty = website.replace('http://','').replace('https://','').replace(/\/.*/g,'');
  }
  return websitePretty;
 }

});





Template.profile.onCreated(function() {
 var thisListing = Listings.findOne();


 GoogleMaps.ready('profileMap', function(map) {
  var thisId = document.getElementsByClassName('_id')[0].innerHTML;
  var thisListing = Listings.findOne({_id: thisId});
  var locLat = thisListing.location[0];
  var locLng = thisListing.location[1];
  var mapName = thisListing._id+"_Map";
  var markerPosition = getLatLngFromString(locLat, locLng);

  var urlFriendlyBizName = thisListing.bizName.replace(/ /g,'+');
  var bizSearchUrl = "https://www.google.com/maps/search/"+urlFriendlyBizName;

  var marker = new google.maps.Marker({
    position: markerPosition,
    map: map.instance,
    title: thisListing.bizName,
    url: bizSearchUrl,
    animation: google.maps.Animation.DROP
  });

  google.maps.event.addListener(marker, 'click', function() {
    var win = window.open(this.url, '_blank');
    win.focus();
  });

  setTimeout(function(){
   var map = GoogleMaps.maps.profileMap.instance; 
    map.panTo(marker.getPosition());
    smoothZoom(map, 14, map.getZoom());

   }, 1111);

 });


});

Template.profile.rendered = function(){
  setTimeout(function(){
   $(window).trigger('resize');
  }, 3333);
  setTimeout(function(){
   $(window).trigger('resize');
  }, 10000);
  setTimeout(function(){
   $(window).trigger('resize');
  }, 20000);
}