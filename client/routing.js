Router.configure({
	layoutTemplate:'layout',
	loadingTemplate: 'loading'
});

Router.route('/', {
    name: 'home',
    template: 'home'
});
Router.route('/listings', {
    name: 'allListings',
    template: 'allListings',
    subscriptions: function(){
    	return Meteor.subscribe("listings");
    }
});
Router.route('/new', {
    name: 'new',
    template: 'createListing'
});

Router.route('/profile/:bizName', {
	name: 'profile',
	template: 'profile',
	data: function(){
    var currentBiz = this.params.bizName;
    return Listings.findOne({ bizName: currentBiz });
	}
});


