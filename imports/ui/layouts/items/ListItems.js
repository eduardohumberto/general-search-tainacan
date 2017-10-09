import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session} from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './ListItems.html';

Template.ListItems.onCreated(function(){
   //console.log(this.data,'template items');
});

Template.ListItems.helpers({
    countItems: function() {
        return Template.instance().data.total;
    },
    prevHasClass: function(){
        if(Session.get('page') && Session.get('page') === 1)
            return 'none'
        else
            return 'block';
    },
    nextHasClass: function(){
        if(((parseInt(Session.get('page'))) * 10) >= Template.instance().data.total )
            return 'none'
        else
            return 'block';
    }
});

Template.ListItems.events({
    'click .prevPageClass': function(){
        var currentPage = parseInt(Session.get('page')) || 1;
        var previousPage = currentPage === 1 ? 1 : currentPage - 1;
        Session.set('page',previousPage);
    },
    'click .nextPageClass': function(){
        var currentPage = parseInt(Session.get('page')) || 1;
        var nextPage = currentPage + 1;
        Session.set('page',nextPage);
    }
});
