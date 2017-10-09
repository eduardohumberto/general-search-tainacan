import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session} from 'meteor/session';

import './Header.html';

Template.Header.onCreated(function () {
});

//retorna a collection para o autoForm
Template.Header.helpers({
    getCurrentUserEmail: function () {
        var user = Meteor.user();
        var email = user && user.emails && user.emails[0].address
        return email.split('@')[0];
    }
});



Template.Header.events({
    'click .logo-tainacan': function () {
        Session.set('query', '');
    },
    'click .login': function () {
        FlowRouter.go('entrar');
    },
    'click .register': function () {
        FlowRouter.go('registrar');
    },
    'click .logout': function (e) {
        e.preventDefault();
        Meteor.logout();
    },
    'submit #form_new_collection': function (event) {
        event.preventDefault();
        var target = $('#collection_name').val().trim();
        // Insert a task into the collection
        if (target != '') {
            Meteor.call('collection.insert', target, function (error, result) {
                $('#modalCreateCollection').modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                if (error) {
                    if (error.error === 'slug-already-exist') {
                        Bert.alert({title: TAPi18n.__('attention'),
                            message: TAPi18n.__('collection.create-collection.name-exist'),
                            type: 'danger',
                            style: 'growl-top-right',
                            icon: 'fa-warning'});
                    } else if (error.error === 'not-authorized') {
                        Bert.alert({title: TAPi18n.__('attention'),
                            message: TAPi18n.__('not-authorized'),
                            type: 'danger',
                            style: 'growl-top-right',
                            icon: 'fa-warning'});
                    }
                } else if (result) {
                    Bert.alert({title: TAPi18n.__('success'),
                        message: TAPi18n.__('collection.create-collection.success'),
                        type: 'success',
                        style: 'growl-top-right',
                        icon: 'fa-check-square'});
                    FlowRouter.go('/' + result);
                }
            });
        } else {
            Bert.alert({title: TAPi18n.__('attention'),
                message: TAPi18n.__('collection.create-collection.empty'),
                type: 'danger',
                style: 'growl-top-right',
                icon: 'fa-warning'});
        }
    }
});
