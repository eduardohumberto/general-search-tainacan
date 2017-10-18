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
        var block = ['socialdb_object_collection_init','socialdb_channel_id','socialdb_object_guid','socialdb_version_number','socialdb_version_date'];
        var returnValues = [];
        var postmeta = Template.instance().data.item._source.post_meta;
        _.each(postmeta, function(values,meta_key) {
            if(meta_key.indexOf('socialdb_property')<0)
                if(block.indexOf(meta_key)>=0)
                    return;
                else if(meta_key==='socialdb_version_comment')
                    returnValues.push({metakey:TAPi18n.__('Filters.version-comment'),values:values});
                else if(meta_key==='socialdb_object_dc_source')
                    returnValues.push({metakey:TAPi18n.__('Filters.source'),values:values});
                else if(meta_key==='socialdb_object_content')
                    returnValues.push({metakey:TAPi18n.__('Filters.content'),values:values});
                else if(meta_key === 'socialdb_uri_imported' )
                    returnValues.push({metakey:TAPi18n.__('Filters.socialdb_uri_imported'),values:values});
                else if(meta_key === 'socialdb_object_dc_type' )
                    returnValues.push({metakey:TAPi18n.__('Filters.socialdb_object_dc_type'),values:values});
                else if(meta_key === 'socialdb_object_from' )
                    returnValues.push({metakey:TAPi18n.__('Filters.socialdb_object_from'),values:values});
                else
                    returnValues.push({ metakey: meta_key.replace(/_/g,' '), values:values  })
        });
        return returnValues;
    }
});
