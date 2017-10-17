import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import './itemModal.html';

Template.itemModal.onCreated(function(){
    //console.log(this.data);
});

Template.itemModal.helpers({
    getDate: function (mySQLDate) {
        var data = new Date(Date.parse(mySQLDate.replace('-','/','g')));
        return data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear();
    },
    listMetadata:function(){
        var returnValues = [];
        var postmeta = Template.instance().data.item._source.post_meta;
        _.each(postmeta, function(values,meta_key) {
            if(meta_key.indexOf('socialdb_property')<0 && meta_key.indexOf('socialdb_object')<0)
                returnValues.push({ metakey: meta_key.replace(/_/g,' '), values:values  })
        });
        return returnValues;
    }
});
