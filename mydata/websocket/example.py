#!/usr/bin/env python
# -*- coding:utf-8 -*-
from threading import Lock
import threading 
from flask import Flask, render_template, session, request, \
    copy_current_request_context
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect
 
# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
#设置该变量为"threading"， "eventlet"或"gevent"来测试
#不同的异步模式，或者将其设置为None，供应用程序选择
#基于安装包的最佳选择。
async_mode = None
 
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)
thread = None
thread_lock = Lock()
 
 
def background_thread():
    """Example of how to send server generated events to clients."""
    """ 如何将服务器生成的事件发送到客户机的示例。 """
    count = 0
    while True:
        socketio.sleep(100)
        count += 1
        socketio.emit('my_response',
                      {'data': 'Server generated event', 'count': count},
                      namespace='/test')
 
 
@app.route('/')
def index():
    return  app.send_static_file('index.html')

""" @app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode) """
 
'''
1.后端如何得到前端数据
1）如果前端提交的方法为POST：
    后端接收时要写methods=[‘GET’,‘POST’]
    xx=request.form.get(xx);
    xx=request.form[’‘xx’]
2）如果是GET
    xx=request.args.get(xx)

2.后端向前端传数据
1) 传单个数据`
    return render_template(‘需要传参网址’,xx=u’ xx’)；
    前端接收：
    {{xx}}
2) 传多个数据
    先把数据写进字典，字典整体传
    return render_template(‘需要传参网址’,**字典名’)；
    前端接收：
    {{字典名.变量名}}
'''
 
 
@socketio.on('my_event', namespace='/test')
def mtest_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    # print(message)
    # print(message['data'])
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']})
 
 
@socketio.on('my_broadcast_event', namespace='/test')
def mtest_broadcast_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']},
         broadcast=True)
 
 
@socketio.on('join', namespace='/test')
def join(message):
    join_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'In rooms: ' + ', '.join(rooms()),
          'count': session['receive_count']})
 
 
@socketio.on('leave', namespace='/test')
def leave(message):
    leave_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': 'In rooms: ' + ', '.join(rooms()),
          'count': session['receive_count']})
 
 
@socketio.on('close_room', namespace='/test')
def close(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response', {'data': 'Room ' + message['room'] + ' is closing.',
                         'count': session['receive_count']},
         room=message['room'])
    close_room(message['room'])
 
 
@socketio.on('my_room_event', namespace='/test')
def send_room_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']},
         room=message['room'])
 
 
@socketio.on('disconnect_request', namespace='/test')
def disconnect_request():
    @copy_current_request_context
    def can_disconnect():
        disconnect()
 
    session['receive_count'] = session.get('receive_count', 0) + 1
    # for this emit we use a callback function
    # when the callback function is invoked we know that the message has been
    # received and it is safe to disconnect
    emit('my_response',
         {'data': 'Disconnected!', 'count': session['receive_count']},
         callback=can_disconnect)
 
 
@socketio.on('my_ping', namespace='/test')
def ping_pong():
    emit('my_pong')
 
 
@socketio.on('connect', namespace='/test')
def mtest_connect():
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)
    emit('my_response', {'data': 'Connected', 'count': 0})
 
 
@socketio.on('disconnect', namespace='/test')
def mtest_disconnect():
    print('Client disconnected', request.sid)
 
 
if __name__ == '__main__':
    socketio.run(app,debug=True)
    # socketio.run(app, debug=True, host='0.0.0.0', port=5000)
        
