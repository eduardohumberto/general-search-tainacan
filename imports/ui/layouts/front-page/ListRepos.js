import { Template } from 'meteor/templating';
import { Apis } from  '../../../api/tainacan/api'

import './ListRepos.html';

Template.ListRepos.helpers({
    listRepositories:function(){
        return Apis;
    }
});

Template.ListRepos.events({

});
