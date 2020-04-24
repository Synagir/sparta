from pymongo import MongoClient

from flask import Flask, render_template, jsonify, request

app: Flask = Flask(__name__)

client = MongoClient('mongodb://Synagir:dlfhslzk1@15.164.214.77', 27017)
db = client.dbimedit


# HTML을 주는 부분
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/rank', methods=['GET'])
def loadRankedKeyword():
    result = list(db.keywords.find({},{'_id':False}).sort('count', -1))
    return jsonify({'result':'success', 'keywords':result})

@app.route('/rank', methods=['POST'])
def saveRankedKeyword():
    rKeyword = request.form['gKeyword']
    
    if db.keywords.count_documents({'keyword':rKeyword}) > 0:
        keyword = db.keywords.find_one({'keyword':rKeyword})
        count = keyword['count'] + 1
        db.keywords.update_one({'keyword':rKeyword}, {'$set':{'count':count}})
    else:
        db.keywords.insert_one({'keyword':rKeyword, 'count':1})

    return jsonify({'result':'success'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
