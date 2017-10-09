import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session} from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './FrontPageLayout.html';

Session.set('searching', false);
Session.set('page', 1);

Template.FrontPageLayout.onCreated(function(){
    this.getRandomImage = new ReactiveVar(Math.floor((Math.random() * 5) + 1));
    this.items = new Mongo.Collection('items');
    var items = this.items;

    Tracker.autorun(function() {
        if (Session.get('query')) {
            //console.log(Session.get('query'),'created');
            var searchHandle = Meteor.subscribe('simpleSearch', Session.get('query'),Session.get('page'));
            Session.set('searching', ! searchHandle.ready());
            if (searchHandle.ready()) {
                var item = items.findOne();
                console.log(item,'ready');
            }
        }
    });
});

Template.FrontPageLayout.helpers({
    getRandomImage:function(){
      return Template.instance().getRandomImage.get();
    },
    items: function(){
      return Template.instance().items.find();
    },
    searching: function() {
        return Session.get('searching');
    },
    countItems: function() {
        return Template.instance().items.find().fetch()[0].total;
    },
    didQuery:function(){
        return (Session.get('query')) ? true : false;
    }
});

Template.FrontPageLayout.events({
    'submit form': function(event, template) {
        event.preventDefault();
        var query = template.$('input[type=text]').val();
        if(Session.get('query') && query !== Session.get('query')){
            Session.set('page', 1);
        }
        if (query)
            Session.set('query', query);
    }
});
