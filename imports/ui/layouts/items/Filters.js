import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session} from 'meteor/session';
import { _ } from 'meteor/underscore';
import { TAPi18n } from 'meteor/tap:i18n';

import './Filters.html';

Template.Filters.onCreated(function(){
   console.log(this.data,'template Filters',TAPi18n.__('Filters.Title'));
});

Template.Filters.helpers({
    listFilters: function() {
        return Template.instance().data.filters;
    },
    listType: function(collection){
        var metadata = [];
        _.each(collection.filtersCollection, function(object,type) {
            if(object.cont==0)
                return;

            switch(type){
                case 'post_title':
                    metadata.push({label:TAPi18n.__('Filters.title-label'),count:object.cont,key:object.key});
                    break;
                case 'post_author':
                    metadata.push( {label:TAPi18n.__('Filters.Author'),count:object.cont,key:object.key} );
                    break;
                case 'post_content':
                    metadata.push({label:TAPi18n.__('Filters.Description'),count:object.cont,key:object.key});
                    break;
                case 'link':
                    metadata.push({label:TAPi18n.__('Filters.URL'),count:object.cont,key:object.key});
                    break;
                default:
                    metadata.push({label:type,count:object.cont,key:object.key});
                    break;
            }
        });
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
    },
    'click .filter-repo':function(event){
        Session.set('page',1);
        Session.set('filters',
            {
                hasFilter:true,
                repo:$(event.target).attr('repo'),
                repoTitle:$(event.target).attr('repoTitle')
            });
    },
    'click .filter-collection':function(){
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
    'click .filter-metadata':function(){
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
    'click .no-filters':function(){
        Session.set('page',1);
        Session.set('filters',{hasFilter:false})
    }
});
