import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Apis } from '../tainacan/api.js'
import { HTTP } from 'meteor/http';


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
             }
        });

        //looking in collection
        _.each(repo_items.collections.buckets, function(collection) {
            var resultCollection = {};
            var response = HTTP.get('http://medialab.ufg.br:9200/_search?q=ID:'+collection.key);
            response = JSON.parse(response.content);
            if(response.hits.hits[0]){
                var data = getMetadata( result.apiUrl+'/collections/'+collection.key+'/metadata');
                //s
                if(data.length === 0)
                    return;

                resultCollection.name = response.hits.hits[0]._source.post_title;
                resultCollection.itemsFound = collection.doc_count;
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
const getItemsColletion = function(index,collection){
    var items = [];
    var jsonStr =  {
        "size": 10000,
        "query": {
            "bool": {
                "must": [
                    {"match": {"post_type": "object"}},
                    {"match": {"post_status": "publish"}},
                    { "match":  {"post_parent" : collection } }
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
    var response = HTTP.post('http://medialab.ufg.br:9200/'+index+'/_search', {
        headers: {'content-type': 'application/json','Accept': 'application/json'},
        data: jsonStr
    });
    response = JSON.parse(response.content);
    _.each(response.hits.hits, function(item,index) {
        items.push(item._source);
    });
    return items;
}
