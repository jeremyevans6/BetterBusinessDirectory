Router.configure({
	layoutTemplate:'layout',
	notFoundTemplate: 'loader',
	loadingTemplate: 'loader'
});

var SEO_options = {
  title: "Better Business Directory",
  suffix: 'BBB',
  separator: '·',
  description: 'The Better Business Directory showcases businesses\' commitment to improving our lives through a social mission.',        // Will apply to meta, Twitter and OpenGraph.
  image: 'http://betterbetterbetter.org/wp-content/uploads/2015/12/common-205x205-7931.png',// Will apply to Twitter and OpenGraph.
  meta: {
    keywords: ['social business','capitalism','marketing','business directory']
  },
  twitter: {
    card: 'The Better Business Directory showcases businesses\' commitment to improving our lives through a social mission.',
    creator: '@betterbetterbe'
  },
  og: {
    site_name: 'Better Business Directory',
    image: 'http://betterbetterbetter.org/wp-content/uploads/2015/12/common-205x205-7931.png'
  }
};

Router.plugin('seo', 
	{defaults: SEO_options}
	);


Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/saturn', {
    name: 'saturn',
    template: 'saturn',
    seo: {
 	   title: {
      text: 'Saturn Symbolism'
    }
  }

});
Router.route('/privacy', {
    name: 'privacy',
    template: 'privacy',
    seo: {
 	   title: {
      text: 'Privacy'
    	}
    }
});
Router.route('/listings', {
    name: 'allListings',
    template: 'allListings',
    subscriptions: function(){
    	return Meteor.subscribe("listings");
    },
    seo: {
 	   title: {
      text: 'Better Business Listing'
    	}
    }
});
Router.route('/map', {
    name: 'mapPage',
    template: 'mapPage',
    waitOn: function () {
        Meteor.subscribe('listings');
    },
    action: function () {
        this.render('mapPage', {to: 'main'});
    },
    seo: {
 	   title: {
      text: 'Better Business Map'
    }
   }
});
Router.route('/new', {
    name: 'new',
    template: 'createListing',
    waitOn: function () {
        Meteor.subscribe('images');
    },
    action: function () {
        this.render('createListing', {to: 'main'});
    },
    seo: {
 	   title: {
      text: 'New Listing'
    	}
  	}
});

Router.route('/profile/:bizNameUrl', {
	name: 'profile',
	template: 'profile',
	waitOn: function () {
    return Meteor.subscribe('listings');
  },
	data: function(){
	    var currentBiz = this.params.bizNameUrl;
	    return Listings.findOne({ bizNameUrl: currentBiz });
	},
  seo: {
    title: function() {
      return this.data().bizName;
    },
    meta: {
      keywords: function(){
      	var socialM = this.data().socialMission;
      	var kwordsArray = new Array();
      	kwordsArray = socialM.match(/<strong>(.*?)<\/strong>|<b>(.*?)<\/b>/g).map(function(val){
				   return val.replace(/<\/?strong>|<\/?b>/g,'');
				});
      	console.log('Keywords: '+kwordsArray);
      	return kwordsArray;
      },
      author: function(){
      	var first = this.data().firstName;
      	var last = this.data().lastName;
      	var ownerName = first+" "+last;
      	console.log('Owner\'s Name: '+ownerName);
      	return ownerName;
      }
    },
    description: function() {
    	var socialM = this.data().socialMission;
    	var smParsed = socialM.replace(/<.*?>/gi, "");
			var maxLength = 120;
			var trimmedString = smParsed.substr(0, maxLength);
			var description = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
    	console.log('Description: '+description);
      return description;
    },
    image: function() {
    	var img = "https://wedobusinessbetter.com"+this.data().logo;
      return img;
    },
    twitter: {
      creator: function() {
        var twitUrl = this.data().twitterBusiness;
        var twitHandle = twitUrl.replace('https://twitter.com/', '');
        return twithandle;
      }
    },
    og: {
      type: 'business.business'
    }
  }
});

Router.route('/profile/edit/:bizNameUrl', {
	name: 'updateListing',
	template: 'updateListing',
  waitOn: function () {
  	return Meteor.subscribe('listings')
  },
	data: function(){
		if(this.ready()){
			var currentBiz = this.params.bizNameUrl;
	    return Listings.findOne({ bizNameUrl: currentBiz });
	  }
	},
  seo: {
    title: function() {
      return this.data().bizName;
    },
    meta: {
      keywords: function(){
      	var socialM = this.data().socialMission;
      	var kwordsArray = new Array();
      	kwordsArray = socialM.match(/<strong>(.*?)<\/strong>|<b>(.*?)<\/b>/g).map(function(val){
				   return val.replace(/<\/?strong>|<\/?b>/g,'');
				});
      	console.log('Keywords: '+kwordsArray);
      	return kwordsArray;
      },
      author: function(){
      	var first = this.data().firstName;
      	var last = this.data().lastName;
      	var ownerName = first+" "+last;
      	console.log('Owner\'s Name: '+ownerName);
      	return ownerName;
      }
    },
    description: function() {
    	var socialM = this.data().socialMission;
    	var smParsed = socialM.replace(/<.*?>/gi, "");
			var maxLength = 120;
			var trimmedString = smParsed.substr(0, maxLength);
			var description = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
    	console.log('Description: '+description);
      return description;
    },
    image: function() {
    	var img = "https://wedobusinessbetter.com"+this.data().logo;
      return img;
    },
    twitter: {
      creator: function() {
        var twitUrl = this.data().twitterBusiness;
        var twitHandle = twitUrl.replace('https://twitter.com/', '');
        return twithandle;
      }
    },
    og: {
      type: 'business.business'
    }
  }
});



Router.onBeforeAction('loading');

Router.onAfterAction(function() {
  if (this.ready()) {
    return Meteor.isReadyForSpiderable = true;
  }
});