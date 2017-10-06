import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session} from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './FrontPageLayout.html';

Template.FrontPageLayout.onCreated(function(){
  this.getRandomImage = new ReactiveVar(Math.floor((Math.random() * 5) + 1));
  this.items = new Mongo.Collection('items');
  Session.setDefault('searching', false);

    Tracker.autorun(function() {
        if (Session.get('query')) {
            console.log(Session.get('query'));
            var searchHandle = Meteor.subscribe('simpleSearch', Session.get('query'));
            Session.set('searching', ! searchHandle.ready());
        }
    });
});

Template.FrontPageLayout.helpers({
  getRandomImage:function(){
    return Template.instance().getRandomImage.get();
  },
  items: function(){
      return Template.instance().items.find();
  }
});

Template.FrontPageLayout.events({
    'submit form': function(event, template) {
        event.preventDefault();
        var query = template.$('input[type=text]').val();
        console.log(query);
        if (query)
            Session.set('query', query);
    }
});
