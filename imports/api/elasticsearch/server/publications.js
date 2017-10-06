import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { _ } from 'meteor/underscore';


Meteor.publish('simpleSearch', function(query) {
    var self = this;
    var jsonStr =  JSON.stringify({
        "size": 50,
        "query": {
            "bool": {
                "must": [
                    {"match": {"post_type": "object"}},
                    {"match": {"post_status": "publish"}}
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
            "types": {
                "terms": {"field": "_index"},
                "aggs": {
                    "collections": {
                        "terms": {
                            "field": "post_parent"
                        }
                    }
                }
            }
        }
    });
    try {
        var response = HTTP.post('http://medialab.ufg.br:9200/_search', {
            headers: {'content-type': 'application/json','Accept': 'application/json'},
            data: jsonStr 
        });

        console.log('result',response);
        // _.each(response.hits.hits, function(item) {
        //     var doc = {
        //         item:item,
        //         total:response.hits.total
        //     };
        //
        //     self.added('items', Random.id(), doc);
        // });

        self.ready();

    } catch(error) {
        console.log(error);
    }
});