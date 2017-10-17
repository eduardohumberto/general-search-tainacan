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
    },
    hasFilter:function(){
        if( Template.instance().data.textFilters){
            return true;
        }else{
            return false
        }

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
    },
    'click .list-filter-repo':function(event){
        Session.set('page',1);
        Session.set('filters',
            {
                hasFilter:true,
                repo:$(event.target).attr('repo'),
                repoTitle:$(event.target).attr('repoTitle')
            });
    },
    'click .list-filter-collection':function(){
        Session.set('page',1);
        Session.set('filters',
            {
                hasFilter:true,
                repo:$(event.target).attr('repo'),
                repoTitle:$(event.target).attr('repoTitle'),
                collection:$(event.target).attr('collection'),
                collectionTitle:$(event.target).attr('collectionTitle')
            })
    },
    'click .list-filter-metadata':function(){
        Session.set('page',1);
        Session.set('filters',
            {
                hasFilter:true,
                repo:$(event.target).attr('repo'),
                repoTitle:$(event.target).attr('repoTitle'),
                collection:$(event.target).attr('collection'),
                collectionTitle:$(event.target).attr('collectionTitle'),
                metadata: $(event.target).attr('metadata'),
                metadataTitle: $(event.target).attr('metadataTitle')
            })
    },
    'click .list-no-filters':function(){
        Session.set('page',1);
        Session.set('filters',{hasFilter:false})
    }
});
