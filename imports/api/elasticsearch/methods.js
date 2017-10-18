import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Apis } from '../tainacan/api.js'
import { HTTP } from 'meteor/http';
import { Random } from 'meteor/random';

export const HOST = 'http://medialab.ufg.br:9200';
/*
  function that return filters
   repository (number)
       collection (number)
*/
export const getFilters = function(aggregations,query,collections){
    var filters = [];
    _.each(aggregations.repositorios.buckets, function(repo_items) {
        var result = {};
        var total = 0;
        //search for the data about the repo
        _.each(Apis, function(repo) {
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
            }else if(collections && collections[collection.key]){
                var objectCollection = collections[collection.key];
                var filtersCollection = getItemsColletion(repo_items.key,collection.key,query);
                resultCollection.key = collection.key;
                resultCollection.name = objectCollection.post_title;
                resultCollection.itemsFound = collection.doc_count;
                resultCollection.filtersCollection = filtersCollection;
                total+=collection.doc_count;
                result.collections.push(resultCollection);
                result.total = total;
            }

        });

        //Add the repo info in a array
        if(result.collections.length > 0)
            filters.push(result);
    });

    return filters;
}


//buscando os itens da colecao
const getItemsColletion = function(index,collection,query){
    var items = [];
    var arg = (query.indexOf(' ')>=0) ? {"match": {"_all": query}} : {"wildcard": {"_all": "*"+query+"*"}}
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
                            arg
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
    return counters;
}

const verifyMatch = function(query,items){
    var result ={
        post_title:{
            cont:0,
            key:'post_title'
        },
        post_content:{
            cont:0,
            key:'post_content'
        },
        post_author:{
            cont:0,
            key:'post_author.raw'
        },
        link:{
            key:'permalink',
            cont:0

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
                        result.post_title.cont++;
                    }
                    break;
                case 'post_content':
                    if(hasValue(query,value)){
                        result.post_content.cont++;
                    }
                    break;
                case 'permalink':
                    if(hasValue(query,value)){
                        result.link.cont++;
                    }
                    break;
                case 'post_author':
                    if(hasValue(query,value.display_name)||hasValue(query,value.raw)){
                        result.post_author.cont++;
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
                    var block = ['socialdb_object_collection_init','socialdb_channel_id','socialdb_object_guid','socialdb_version_number'];
                    _.each(value, function(meta,meta_key) {
                        if(block.indexOf(meta_key)>=0)
                            return;

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

/**
 * function that performs the search
 *
 * @param rootResponse
 * @param classItem
 * @param query
 * @param from
 * @param size
 * @param filters
 */
export const filterSearch = function (rootResponse,classItem,query,from,size,filters) {
    var query_origin = query;
    //console.log(filters);

    //alter host if necessary
    var link = HOST;

    //filter repository
    if(filters.repo){
        link+='/'+filters.repo;
    }

    //filter collection
    var filterCollection = (filters.collection) ? { "match":  {"collection.ID" : parseInt(filters.collection) } } : { "match":  {'collection.post_status': 'publish' } };

    //filter metadata
    var arg = (query.indexOf(' ')>=0) ? {"match": {"_all": query}} : {"wildcard": {"_all": "*"+query+"*"}}
    var filterMetadata =  arg;
    if(filters.metadata && filters.metadata !== ''){
        var object = {};
        if(query.indexOf(' ')>=0){
            var strings = query.split(' ');
            query = strings[0];
        }

        object[filters.metadata] = '*'+query+'*';
        filterMetadata =  { "wildcard" : object} ;
    }

    //JSON to perform the search
    var jsonStr =  {
        "from": from,
        "size": size,
        "sort" : [
            { "post_date" : {"order" : "desc"}},
            "_score"
        ],
        "query": {
            "bool": {
                "must": [
                    { "match": { "post_type": "object"}},
                    { "match": { "post_status": "publish"}},
                    filterCollection
                ],
                "filter": {
                    "bool": {
                        "must": [
                            filterMetadata
                        ]
                    }
                }
            }
        }
    };

    //query on elasticsearch with filters
    var response = HTTP.post(link+'/_search', {
        headers: {'content-type': 'application/json','Accept': 'application/json'},
        data: jsonStr
    });

    //Extract the content
    response = JSON.parse(response.content);
    if(response.hits.total === 0){
        response = alternateSearch(from,size,filterCollection,link,filters,query_origin);
    }

    var collections = {};
    //iterate with the results
    _.each(response.hits.hits, function(item,index) {
        //add the item on doc
        var doc = {
            item:item,
            total:response.hits.total,
            page: from
        };

        
        if(item._source.collection)
            collections[item._source.collection.ID] = item._source.collection;

        //only in first item to search the filters
        if(index===0 && rootResponse.aggregations){
            doc.filters = getFilters(rootResponse.aggregations,query,collections);
            doc.textFilter = filters;
        }

        //add on Collection for read in client side
        classItem.added('items', Random.id(), doc);
    });
    classItem.ready();
}

/**
 *
 * @param from
 * @param size
 * @param filterCollection
 * @param link
 * @param filters
 */
const alternateSearch = function(from,size,filterCollection,link,filters,query){
    //filter metadata
    var filterMetadata =  {"match": {"_all": query}};
    if(filters.metadata && filters.metadata !== ''){
        var object = {};
        if(query.indexOf(' ')>=0){
            var strings = query.replace(' ',' OR ');
            query = strings;
        }
        object['fields'] = [filters.metadata]
        object['query'] = query;
        filterMetadata =  { "query_string" : object} ;
    }

    var jsonStr =  {
        "from": from,
        "size": size,
        "sort" : [
            { "post_date" : {"order" : "desc"}},
            "_score"
        ],
        "query": {
            "bool": {
                "must": [
                    { "match": { "post_type": "object"}},
                    { "match": { "post_status": "publish"}},
                    filterCollection
                ],
                "filter": {
                    "bool": {
                        "must": [
                            filterMetadata
                        ]
                    }
                }
            }
        }
    };

    var response = HTTP.post(link+'/_search', {
        headers: {'content-type': 'application/json','Accept': 'application/json'},
        data: jsonStr
    });
    //Extract the content
    response = JSON.parse(response.content);console.log(filterMetadata,filterCollection,response.hits.total);
    return response;
}
