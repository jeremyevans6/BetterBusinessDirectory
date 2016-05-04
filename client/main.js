import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
//import './main.html';


//helpers!

Template.registerHelper('isCurrentUser', function(userId) {
  return userId === Meteor.userId();
});

Template.allListings.helpers({
	listings: function(){
		return Listings.find();
	},
});

Template.profile.helpers({
	listings: function(){

		return Listings.find();
	},


  findListing: function(){
    var currentListing = this.bizName;
    return Listings.find({ bizName: currentListing }, {sort: {createdAt: -1}})
  }

});


//template subscriptions!
Template.profile.onCreated(function () {
    this.subscribe('listings');
});
Template.createListing.onCreated(function () {
    this.subscribe('listings');
});
Template.listing.onCreated(function () {
    this.subscribe('listings');
});


//rendered!
Template.allListings.rendered = function (){
	/*
		if (!this.rendered){
			this.rendered = true;
			setTimeout(function(){
				$('#allList').isotope({
				  itemSelector: '.listing',
				  masonry: {
				    columnWidth: 200
				  }
				});
			}, 2222);
		};
		*/
	}



//events!

Template.createListing.events({
	'submit .newListing': function(event){
		var bizName = event.target.bizName.value;
		var firstName = event.target.firstName.value;
		var lastName = event.target.lastName.value;
		var email = event.target.email.value;
		var phone = event.target.phone.value;
		var industry = event.target.industry.value;
		var socialMission = event.target.socialMission.value;
		var userId = Meteor.userId();

		Meteor.call("addListing", bizName, firstName, lastName, email, phone, industry, socialMission, userId);

		event.target.bizName.value = "";
		event.target.firstName.value = "";
		event.target.lastName.value = "";
		event.target.email.value = "";
		event.target.phone.value = "";
		event.target.industry.value = "";
		event.target.socialMission.value = "";
		return false;
	}

});


Template.listing.events({

	'click .listing': function(event){
		$(event.target).toggleClass('focus');
  	$grid.masonry('layout');
	},

	'click .delete': function(){
		if(confirm("Delete Listing?")){
			Meteor.call("removeListing", this._id);
		}
	},

	'click .check-select': function(){
		Meteor.call("updateListing", this._id, !this.checked)
	}
});


Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
            email: email,
            password: password
        });
    }
});

