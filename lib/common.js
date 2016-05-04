Listings = new Mongo.Collection("listings");	




Meteor.methods({
	addListing: function (bizName, firstName, lastName, email, phone, industry, socialMission, userId){
		Listings.insert({
			bizName: bizName,
			firstName: firstName,
			lastName: lastName,
			email: email,
			phone: phone,
			industry: industry,
			socialMission: socialMission,
			userId: userId,
			createdAt: new Date()
		});
	},

	removeListing: function (id){
		Listings.remove(id);
	},

	updateListing: function(id, checked){
		Listings.update(id, {$set: {checked: checked}});
	},


});