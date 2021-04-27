import eventlet
eventlet.monkey_patch()
import json
from flask_socketio import emit, SocketIO
from flask import Flask,request
import time
from threading import RLock

app = Flask(__name__)
socketio = SocketIO(app,cors_allowed_origins="*")

thread_lock = RLock()
with open("log.txt", "r+") as f:
    f.truncate()

@socketio.on('connect', namespace='/test')
def test_connect():
    print('cesium连接flask成功！请求ID：{}'.format(request.sid))

@socketio.on('disconnect', namespace='/test')
def on_disconnect():
    print('cesium断开连接！')

@socketio.on("Initialize_event",namespace="/test")
def Initialize_event(data):
    print ("cesium初始化成功，设定其暂停时间为{}".format(data)) 

@app.route('/getsometing', methods=['GET'])
def gettest():
    get_data=request.args.to_dict()
    print (get_data)
    type = get_data['type']
    cur_time=time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) 

    if type == 'Exata_Start' : 
        with open("initialize.json","r") as initialize:
            Initialize=json.load(initialize)
        print ("Exata启动仿真，卫星初始化值为：{}".format(Initialize))
        emit('Satellite_Initialize',json.dumps(Initialize), \
            broadcast=True, namespace='/test')

    elif type == 'Exata_Accomplish' :
        emit('Satellite_Accomplish', json.dumps(get_data), \
            broadcast=True, namespace='/test') 
        print ("Exata仿真结束")
        
    elif type == 'change_5gc' :
        with open("message.json","r") as message:
            Message=json.load(message)
        for content in Message["content"]:
            mess = json.dumps(content)
            print (mess)
            emit('server_response', mess, broadcast=True, namespace="/test")
            with open("log.txt", "a+") as f:
                f.write('\n# ' + cur_time + ' ---------- 收到信令：\n' +json.dumps(mess))
            eventlet.sleep(1) 

    # elif type == 'again':
    #     emit('agin', data, broadcast=True, namespace='/test')
    #     return "<html><body> agin access </body></html>"
    else :
        print ("接收到无效信令，将其丢弃")
        with open("log.txt", "a+") as f:
            f.write('\n# ' + cur_time + ' ---------- get error：\n' + json.dumps(get_data))
        return "<html><body> Flask access invalid data </body></html>"

    return "<html><body> data access </body></html>"


@app.route('/postsometing', methods=['POST'])
def posttest():
    post_data = request.form.to_dict()
    print (post_data)
    type = post_data['type']
    cur_time=time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) 

    if type == "change_cn":
        with open("log.txt", "a+") as f:
            f.write('\n# ' + cur_time + ' ---------- 5gc:' + post_data['cn_list'] + \
                '\n5gc_dist：' + post_data['cn_dist'])

    else :
        print ("接收到无效数据，将其丢弃")
        with open("log.txt", "a+") as f:
            f.write('\n# ' + cur_time + ' ---------- post error：\n' + json.dumps(post_data))
        return "<html><body> Flask access invalid data </body></html>"

    return "<html><body> data access </body></html>"

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port='5000')