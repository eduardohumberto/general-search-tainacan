import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './ItemComponent.html';

Template.ItemComponent.onCreated(function(){
    //console.log(this.data);
});

Template.ItemComponent.helpers({
    getDate: function (mySQLDate) {
        var data = new Date(Date.parse(mySQLDate.replace('-','/','g')));
        return data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear();
    }
});
