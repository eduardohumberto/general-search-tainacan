import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { _ } from 'meteor/underscore';
import { Random } from 'meteor/random';
import { getFilters,HOST } from "../methods.js";


Meteor.publish('simpleSearch', function(query,from,size) {
    var self = this;
    from = (parseInt(from) === 1) ? 0 : ( ( parseInt(from) - 1) *  10) ;
    size = (!size) ? 10 : size;
    var jsonStr =  {
        "from": from,
        "size": size,
        "query": {
            "bool": {
                "must": [
                    {"match": {"post_type": "object"}},
                    {"match": {"post_status": "publish"}},
                    { "match":  {"collection.post_status" : "publish" } }
                ],
                "filter": {
                    "bool": {
                        "must": [
                            {"match": {"_all": query}}
                        ]
                    }
                }
            }
        },
        "aggs": {
            "repositorios": {
                "terms": {"field": "_index"},
                "aggs": {
                    "collections": {
                        "terms": {
                            "field": "collection.ID"
                        }
                    }
                }
            }
        }
    };
    try {
        var response = HTTP.post(HOST+'/_search', {
            headers: {'content-type': 'application/json','Accept': 'application/json'},
            data: jsonStr
        });
        response = JSON.parse(response.content);
        _.each(response.hits.hits, function(item,index) {
            var doc = {
                item:item,
                total:response.hits.total,
                page: from
            };

            //only in first item to search the filters
            if(index===0 && response.aggregations){
                doc.filters = getFilters(response.aggregations,query);
            }

            self.added('items', Random.id(), doc);
        });

        self.ready();
    } catch(error) {
        console.log(error);
    }
});

