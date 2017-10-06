import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/layouts/app-body.js';

//rotas
FlowRouter.route('/',{
  name: 'front-page',
  action(){
    //GAnalytics.pageview();
    BlazeLayout.render('FrontPageLayout');
  }
});

//rotas
FlowRouter.route('/criar-colecao',{
  name: 'create-collection',
  action(){
    //GAnalytics.pageview();
    BlazeLayout.render('App_body',{main:'createCollection'})
  }
});

//rotas
FlowRouter.route('/tainacan/colecoes',{
  name: 'list-collections',
  action(){
    //GAnalytics.pageview();
    BlazeLayout.render('App_body',{main:'listCollections'})
  }
});
