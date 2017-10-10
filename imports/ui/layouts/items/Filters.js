import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session} from 'meteor/session';

import './Filters.html';

Template.Filters.onCreated(function(){
   console.log(this.data,'template Filters');
});

Template.Filters.helpers({
    listFilters: function() {
        return Template.instance().data.filters;
    }
});

Template.Filters.events({
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
