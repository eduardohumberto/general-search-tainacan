import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Apis } from '../tainacan/api.js'
import { HTTP } from 'meteor/http';

export const HOST = 'http://192.168.99.100:9200';
/*
  function that return filters
   repository (number)
       collection (number)
*/
export const getFilters = function(aggregations,query){
    var filters = [];
    _.each(aggregations.repositorios.buckets, function(repo_items) {
        var result = {};
        var total = 0;
        //search for the data about the repo
        _.each(Apis, function(repo) {
             //console.log(repo.index,repo_items.key,repo.index == repo_items.key);
             if(repo.index == repo_items.key){
                 result.name = repo.title;
                 result.itemsFound = repo_items.doc_count;
                 result.collections = [];
                 result.apiUrl = repo.api;
                 result.key = repo.index
             }
        });

        //looking in collection
        _.each(repo_items.collections.buckets, function(collection) {
            var resultCollection = {};
            var response = HTTP.get(HOST+'/_search?q=ID:'+collection.key);
            response = JSON.parse(response.content);
            if(response.hits.hits[0]){
                //var data = getMetadata( result.apiUrl+'/collections/'+collection.key+'/metadata');
                //if there is not metadata just return
                // if(data.length === 0)
                //     return;

                var filtersCollection = getItemsColletion(repo_items.key,collection.key,query);

                resultCollection.key = response.hits.hits[0]._source.post_id;
                resultCollection.name = response.hits.hits[0]._source.post_title;
                resultCollection.itemsFound = collection.doc_count;
                resultCollection.filtersCollection = filtersCollection;
                total+=collection.doc_count;
                result.collections.push(resultCollection);
                result.total = total;
            }

        });

        //Add the repo info in a array
        //console.log(result,'inserting repo');
        filters.push(result);
    });

    return filters;
}

//buscando os metadados da colecao na api do tainacan
const getMetadata = function (api_url){
    var array = [];
    var response = HTTP.get(api_url);
    response = JSON.parse(response.content);
    if(response.length>0){
        _.each(response,function(tab) {
            _.each(tab["tab-properties"],function(property) {
                array.push(property);
            })
        })
    }
    return array;
}

//buscando os itens da colecao
const getItemsColletion = function(index,collection,query){
    var items = [];
    var jsonStr =  {
        "size": 10000,
        "query": {
            "bool": {
                "must": [
                    {"match": {"post_type": "object"}},
                    {"match": {"post_status": "publish"}},
                    { "match":  {"collection.ID" : collection } }
                ],
                "filter": {
                    "bool": {
                        "must": [
                            {"match": {"_all": query}}
                        ]
                    }
                }
            }
        }
    };
    var response = HTTP.post(HOST+'/'+index+'/_search', {
        headers: {'content-type': 'application/json','Accept': 'application/json'},
        data: jsonStr
    });
    response = JSON.parse(response.content);
    var counters = verifyMatch(query,response.hits.hits);
    //console.log('------');
    //console.log(counters);
    return counters;
}

const verifyMatch = function(query,items){
    var result ={
        title:{
            cont:0,
            key:''
        },
        post_content:{
            cont:0,
            key:''
        },
        post_author:{
            cont:0,
            key:''
        },
        link:{
            cont:0,
            key:''
        },
        // terms:{
        //     cont:0
        // }
    }
    _.each(items, function(item,index) {
        _.each(item._source, function(value,index) {
            switch (index){
                case 'post_title':
                    if(hasValue(query,value)){
                        result.title.cont++;
                        result.title.key = 'post_title';
                    }
                    break;
                case 'post_content':
                    if(hasValue(query,value)){
                        result.post_content.cont++;
                        result.post_content.key = 'post_content';
                    }
                    break;
                case 'permalink':
                    if(hasValue(query,value)){
                        result.link.cont++;
                        result.link.key = 'permalink';
                    }
                    break;
                case 'post_author':
                    //console.log('author',value);
                    if(hasValue(query,value.display_name)||hasValue(query,value.raw)){
                        result.post_author.cont++;
                        result.post_author.key = 'post_author';
                    }
                    break;
                // case 'terms':
                //     _.each(value.socialdb_category_type, function(category) {
                //         if(hasValue(query,category.name)){
                //             result.terms.cont++;
                //         }
                //     });
                //     break;
                case 'post_meta':
                    _.each(value, function(meta,meta_key) {
                        if(meta_key.indexOf('socialdb_property')<0) {
                            _.each(meta, function (val) {
                                if (val && hasValue(query, val)) {
                                    if (result[meta_key]) {
                                        var obj = result[meta_key];
                                        obj['cont']++;
                                        result[meta_key] = obj;
                                    } else {
                                        result[meta_key] = {cont: 1,key:'post_meta.'+meta_key}
                                    }
                                }
                            });
                        }
                    });
                    break;
            }
        })
    });
    return result;
}

// verify if string in value
const hasValue = function(string,value){
    var array = string.split(' ');
    var isMatch = false;
    _.each(array, function(word){
        if(value.toLowerCase().indexOf(word.toLowerCase())>=0){
            isMatch = true;
        }
    });
    return isMatch;
}
