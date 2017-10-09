import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { _ } from 'meteor/underscore';
import { Random } from 'meteor/random'

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
    };
    try {
        var response = HTTP.post('http://medialab.ufg.br:9200/_search', {
            headers: {'content-type': 'application/json','Accept': 'application/json'},
            data: jsonStr
        });
        response = JSON.parse(response.content);
        _.each(response.hits.hits, function(item) {
            var doc = {
                item:item,
                total:response.hits.total,
                page: from
            };
            self.added('items', Random.id(), doc);
        });

        self.ready();
    } catch(error) {
        console.log(error);
    }
});