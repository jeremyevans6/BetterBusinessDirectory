

Template.allListings.helpers({
	listings: function(){
		return Listings.find();
	},
});


Template.listing.helpers({
	focus: function(){
		var focusedKey = this._id+'_focus';

		if(Template.instance().listingDictionary.get(focusedKey) == null){
			Template.instance().listingDictionary.set(focusedKey, false)
		}
		return Template.instance().listingDictionary.get(focusedKey);
	},

	industryClass: function(industry){
		return industry;
	},

 websitePretty: function(website){
 	if(website !== undefined){
  		var websitePretty = website.replace('http://','').replace('https://','').replace(/\/.*/g,'');
  }
  return websitePretty;
 }

});





Template.allListings.onCreated(function () {
	    this.subscribe('listings');
});
Template.listing.onCreated(function () {
    this.subscribe('listings');

  this.listingDictionary = new ReactiveDict();
});




Template.listing.onCreated(function() {




});


//rendered!
Template.allListings.rendered = function (){
		if (!this.rendered){
			this.rendered = true;
			setTimeout(function(){
				$listingsGrid = $('#allList').isotope({
					  itemSelector: '.listing',
					  percentPosition: true,
					  stagger: 30,
					  packery: {
					    gutter: 1
					  }
					});

				$listingsGrid.imagesLoaded().progress( function() {
				  $listingsGrid.isotope('layout');
				});

				}, 777);

			setTimeout(function(){
				$('.filter-button-group').on( 'click', 'button', function() {

					$('.filter-button-group button').removeClass('active');
					$(event.target).addClass('active');
				  var filterValue = $(this).attr('data-filter');
				  $listingsGrid.isotope({ filter: filterValue });

				});

				$(window).trigger('resize');
			}, 999);

		} else {
			$(window).trigger('resize');
		}
	}





Template.listing.events({

	'mousedown .listing': function(event, template){

		var $listing;
		if($(event.target).hasClass('.listing')){
			$listing = $(event.target);
		} else {
		 $listing = $(event.target).parents('.listing');
		}
		

  if (event.target.nodeName === "A" || $(event.target).parents('.map').length > 0){
   $listing.changing = false; 
  } else {
   $listing.changing = true;
  }

		var focusedKey = this._id+'_focus';
		var focused = template.listingDictionary.get(focusedKey);
  var newFocused = !focused;
  
  
  var locLat = this.location[0];
  var locLng = this.location[1];
  var mapName = this._id+"_Map";

		 if (GoogleMaps.loaded() && ( GoogleMaps.maps[mapName] === undefined || !GoogleMaps.maps[mapName].rendered) ) {

		  		GoogleMaps.create({
		  		 name: mapName,
		  			element: $($listing).find('.map')[0],
		  			options: {
		  				backgroundColor: '#800080',
								center: new google.maps.LatLng(locLat, locLng),
		      zoom: 6,
		      styles: mapStyle
		  			}
		  	 });

		  		var urlFriendlyBizName = this.bizName.replace(/ /g,'+');
		  		var bizSearchUrl = "https://www.google.com/maps/search/"+urlFriendlyBizName;

		    var marker = new google.maps.Marker({
		      position: GoogleMaps.maps[mapName].options.center,
		      map: GoogleMaps.maps[mapName].instance,
		      mapOptions: GoogleMaps.maps[mapName].options,
		      url: bizSearchUrl,
		      animation: google.maps.Animation.DROP
		     });


		    google.maps.event.addListener(marker, 'click', function() {
		    	  var win = window.open(this.url, '_blank');
  							win.focus();
						});

						GoogleMaps.maps[mapName].marker = marker;

						GoogleMaps.maps[mapName].rendered = true;

		   }	
	

  if($listing.changing === true){

   template.listingDictionary.set(focusedKey, newFocused); 

  	setTimeout(function(){
   	if (newFocused){
   		$($listing).addClass('focus');

   	} else {
   		$($listing).removeClass('focus');
   	}

   	google.maps.event.trigger(GoogleMaps.maps[mapName].instance, "resize");

   	var marker = GoogleMaps.maps[mapName].marker;
   	GoogleMaps.maps[mapName].instance.panTo(marker.getPosition());



   }, 111);

  }

		setTimeout(function(){
			$listingsGrid.isotope('layout')
		}, 333);
		setTimeout(function(){
			$listingsGrid.isotope('layout')
		}, 777);

	}


});




















