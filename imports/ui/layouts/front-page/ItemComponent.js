import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';


import './ItemComponent.html';

Template.ItemComponent.onCreated(function(){
    console.log(this.data);
});

Template.ItemComponent.helpers({

});
