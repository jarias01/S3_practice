if (Meteor.isClient) {
  var uploader = new Slingshot.Upload("myFileUploads");

  Template.upload.events({
    "click button": function () {
      uploader.send(document.getElementById('input').files[0], function(error, downloadUrl) {
            if (error) {
              console.error ('Error uploading', uploader.xhr.response);
              alert (error);
            }
            else {
              Meteor.users.update(Meteor.userId(), {$push: {"profile.files": downloadUrl}});
            }
          });
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Slingshot.fileRestrictions("myFileUploads", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
    maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited)
  });

  /*Template.progressBar.helpers({
  progress: function () {
    return Math.round(this.uploader.progress() * 100);
  }
  });*/

  /*Template.myPicture.helpers({
  url: function () {
    //if we are uploading an image, pass true to download the image into cache
    //this will preload the image before using the remote image url.
    return this.uploader.url(true);
  }
});*/
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Slingshot.fileRestrictions("myFileUploads", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
    maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited)
  });
  
  Slingshot.createDirective("myFileUploads", Slingshot.S3Storage, {
    bucket: "ccpracticeone",

    acl: "public-read",

    authorize: function () {
      //Deny uploads if user is not logged in.
      if (!this.userId) {
        var message = "Please login before posting files";
        throw new Meteor.Error("Login Required", message);
      }

      return true;
    },

    key: function (file) {
      //Store file into a directory by the user's username.
      var user = Meteor.users.findOne(this.userId);
      return user.username + "/" + file.name;
    }
  });
}