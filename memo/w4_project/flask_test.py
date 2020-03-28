from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

from pymongo import MongoClient  # pymongo를 임포트 하기(패키지 인스톨 먼저 해야겠죠?)

client = MongoClient('localhost', 27017)  # mongoDB는 27017 포트로 돌아갑니다.
db = client.dbsparta  # 'dbsparta'라는 이름의 db를 만듭니다.


## HTML을 주는 부분
@app.route('/')
def home():
    return render_template('hw.html')


## API 역할을 하는 부분
@app.route('/order', methods=['POST'])
def write_review():
    rq_name = request.form['name_give']
    rq_phone = request.form['phone_give']
    rq_address = request.form['address_give']
    rq_payment = request.form['payment_give']

    receipt = {
        'name' : rq_name,
        'phone' : rq_phone ,
        'address' : rq_address,
        'payment' : rq_payment
    }

    db.receipts.insert_one(receipt)

    return jsonify({'result': 'success', 'msg': '성공적으로 주문되었습니다!'})


@app.route('/order', methods=['GET'])
def read_reviews():
    receipts = list(db.receipts.find({},{'_id':0}))

    return jsonify({'result': 'success', 'receipts': receipts})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)