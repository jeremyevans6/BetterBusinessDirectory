Router.configure({
	layoutTemplate:'layout',
	notFoundTemplate: 'loader',
	loadingTemplate: 'loader'
});

var SEO_options = {
  title: "We Do Business Better",
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

Router.plugin('seo', SEO_options);


Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/saturn', {
    name: 'saturn',
    template: 'saturn'
});
Router.route('/privacy', {
    name: 'privacy',
    template: 'privacy'
});
Router.route('/listings', {
    name: 'allListings',
    template: 'allListings',
    subscriptions: function(){
    	return Meteor.subscribe("listings");
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
    }
});

Router.route('/profile/:bizNameUrl', {
	name: 'profile',
	template: 'profile',
	data: function(){
    var currentBiz = this.params.bizNameUrl;
    return Listings.findOne({ bizNameUrl: currentBiz });
	}
});

Router.route('/profile/edit/:bizNameUrl', {
	name: 'updateListing',
	template: 'updateListing',
  waitOn: function () {
    Meteor.subscribe('images');
    Meteor.subscribe('Listings');
  },
 // action: function () {
  //  this.render('updateListing', {to: 'main'});
 // },
	data: function(){
		if(this.ready()){
			var currentBiz = this.params.bizNameUrl;
	    return Listings.findOne({ bizNameUrl: currentBiz });
		}
	}
});



Router.onBeforeAction('loading');
