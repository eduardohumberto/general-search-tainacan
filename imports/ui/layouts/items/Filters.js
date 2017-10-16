import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session} from 'meteor/session';
import { _ } from 'meteor/underscore';
import { TAPi18n } from 'meteor/tap:i18n';

import './Filters.html';

Template.Filters.onCreated(function(){
   console.log(this.data,'template Filters');
});

Template.Filters.helpers({
    listFilters: function() {
        return Template.instance().data.filters;
    },
    listType: function(collection){
        var metadata = [];
        _.each(collection.filtersCollection, function(object,type) {
            switch(type){
                case 'post_title':
                    metadata.push({label:TAPi18n.__('Title'),count:object.cont});
                    break;
                case 'post_author':
                    metadata.push( {label:TAPi18n.__('Author'),count:object.cont} );
                    break;
                case 'post_content':
                    metadata.push({label:TAPi18n.__('Description'),count:object.cont});
                    break;
                case 'link':
                    metadata.push({label:TAPi18n.__('Link'),count:object.cont});
                    break;
                default:
                    metadata.push({label:type,count:object.cont});
                    break;
            }
        });
        console.log(metadata);
        return metadata;
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
