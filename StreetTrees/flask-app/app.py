from elasticsearch import Elasticsearch, exceptions
import os
import time
from flask import Flask, jsonify, request, render_template
import sys
import requests

es = Elasticsearch(host='es')

app = Flask(__name__)

def load_data_in_es():
    """ creates an index in elasticsearch """
    url = "http://data.providenceri.gov/resource/b77h-59tz.json?$limit=50000"
    r = requests.get(url)
    data = r.json()

    print("Loading data in elasticsearch ...")
    for id, tree in enumerate(data):
        res = es.index(index="provdata", doc_type="trees", id=id, body=tree)
    print("Total trees loaded: ", len(data))

def safe_check_index(index, retry=30):
    """ connect to ES with retry """
    if not retry:
        print("Out of retries. Bailing out...")
        sys.exit(1)
    try:
        status = es.indices.exists(index)
        return status
    except exceptions.ConnectionError as e:
        print("Unable to connect to ES. Retrying in 5 secs...")
        time.sleep(5)
        safe_check_index(index, retry-1)

def check_and_load_index():
    """ checks if index exits and loads the data accordingly """
    if not safe_check_index('provdata'):
       print("Index not found...")
    load_data_in_es()

###########
### APP ###
###########
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/debug')
def test_es():
    resp = {}
    try:
        msg = es.cat.indices()
        resp["msg"] = msg
        resp["status"] = "success"
    except:
        resp["status"] = "failure"
        resp["msg"] = "Unable to reach ES"
    return jsonify(resp)

@app.route('/load')
def load_es():
    resp = {}
    try:
        if es.indices.exists('provdata'):
            es.indices.delete(index='provdata', ignore=[400,404])        
        load_data_in_es()
    except:
        resp["status"] = "failure"
        resp["msg"] = "Unable to reach ES"
    return jsonify(resp)

@app.route('/search')
def search():
    key = request.args.get('q')
    if not key:
        return jsonify({
            "status": "failure",
            "msg": "Please provide a query"
        })
    try:
        res = es.search(
                index="provdata",
                body={
                    "query": {"match": {"spp": key}},
                    "size": 10000 # max document size
              })
    except Exception as e:
        return jsonify({
            "status": "failure",
            "msg": "error in reaching elasticsearch"
        })
    # filtering results

    trees = []

    for r in res["hits"]["hits"]:

        tree = {
            "address"   : r["_source"].get("address", "NA"),
            "onstr" : r["_source"].get("onstr", "NA"), 
            "spp"   : r["_source"].get("spp", "NA"),
            "location"  : 
                {
                    "longitude": r["_source"]["the_geom"]["coordinates"][0],
                    "latitude" : r["_source"]["the_geom"]["coordinates"][1]
                },
            "pittype"   : r["_source"].get("pittype", "NA")
        }

        trees.append(tree)

    hits = len(trees)

    return jsonify({
        "trees": trees,
        "hits": hits,
        "status": "success"
    })

if __name__ == "__main__":
    ENVIRONMENT_DEBUG = os.environ.get("DEBUG", False)
    check_and_load_index()
    app.run(host='0.0.0.0', port=5000, debug=ENVIRONMENT_DEBUG)
