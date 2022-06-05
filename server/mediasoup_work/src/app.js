const express = require('express');
var exphbs = require('express-handlebars');
const session = require('express-session')({
    secret: 'virsalink',
    saveUninitialized: false,
    resave: false
});
// jibreel -> session for socket io
var sharedsession = require("express-socket.io-session");
var bodyParser = require('body-parser');
const app = express();
const https = require('httpolyglot');
const fs = require('fs');
const mediasoup = require('mediasoup');
const config = require('./config');
const path = require('path');
const Room = require('./Room');
const Peer = require('./Peer');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 50000,
    host: '18.237.213.178',
    user: 'keshav',
    password: 'webrtc1@',
    database: 'angeltalk'
});

var bodyParser = require('body-parser');
var all_sockets = [];
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/talktocounsel.com/privkey.pem', 'utf-8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/talktocounsel.com/fullchain.pem', 'utf-8')
}

const httpsServer = https.createServer(options, app)
const io = require('socket.io')(httpsServer)
io.use(sharedsession(session, { autoSave: true }))
/* 
 * JIBREEL
 * use session always with "req.session"
 * in other word do not store session in global variable
 * it is main issue of getting "adminstrator"
 */
var sessions;
app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(session);
app.engine('handlebars', exphbs({
    helpers: {
        block: function (name) {
            var blocks = this._blocks,
                content = blocks && blocks[name];

            return content ? content.join('\n') : null;
        },

        contentFor: function (name, options) {
            var blocks = this._blocks || (this._blocks = {}),
                block = blocks[name] || (blocks[name] = []);

            block.push(options.fn(this));
        }
    }
}));
app.set('view engine', 'handlebars');
app.all('/create_room', function (req, res) {
    var room_name = req.body.room_name;
    var room_owner = req.body.owner_email;
    var max_participants = 150;
    var current_participants = 0;
    pool.getConnection(function (err, con) {
        if (err) console.log(err);
        var sql = "INSERT INTO conference_rooms (room_name, room_owner,room_max_participants,room_total_participants) VALUES ?";
        var values = [
            [room_name, room_owner, max_participants, current_participants]
        ];
        con.query(sql, [values], function (err, result) {
            if (err) {

            } else {
                con.release();
                console.log("Number of records inserted: " + result.affectedRows);
                res.redirect('/dashboard');
            }
        });
    });
});
// /:roomid?/:user_id?/:user_name?
app.get('/conference', function (req, res) {
    if (!req.query.room) {
        res.redirect(`/index`);
    } else if (!req.query.user) {
        res.redirect(`/join_room/${req.query.room}`);
    } else {
        res.sendFile('conference.html', { root: path.join(__dirname, '..', 'public') });
    }
});
app.get('/roomclient', function (req, res) {
    res.sendFile('RoomClient.js', { root: path.join(__dirname, '..', 'public') });
});
app.get('/login', function (req, res) {
    res.sendFile('login.html', { root: path.join(__dirname, '..', 'public') });
});
app.get('/logout', function (req, res) {
    req.session.destroy();

    res.redirect('/');
});
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: path.join(__dirname, '..', 'public') });
});
app.get('/dashboard', function (req, res) {

    pool.getConnection(function (err, connection) {
        if (err) console.log(err);
        var sql = "select * from conference_rooms where room_owner='" + req.session.user_email + "'";
        connection.query(sql, function (er, result) {
            if (er) console.log(er);


            if (result.length > 0) {
                var context = {
                    data: {
                        "user_name": req.session.user_name,
                        "user_email": req.session.user_email,
                        "user_type": req.session.user_type
                    },
                    "all_rooms": result
                };

            } else {
                var context = {
                    data: {
                        "user_name": req.session.user_name,
                        "user_email": req.session.user_email,
                        "user_type": req.session.user_type
                    }
                };
            }
            res.render('dashboard', context);

        });
    });
    // res.send("user_name: "+sessions.user_name+"<br>"+"user_email: "+sessions.user_email+"<br>"+"user_type: "+sessions.user_type);
});
app.get('/delete_room/:roomid', function (req, res) {
    var room_id = req.params.roomid;
    pool.getConnection(function (err, con) {
        if (err) console.log(err);
        var sql = "DELETE FROM conference_rooms where roomid=?";
        var values = [
            [room_id]
        ];
        con.query(sql, [values], function (err, result) {
            if (err) {

            } else {
                con.release();
                console.log("Number of records deleted: " + result.affectedRows);
                res.redirect('/dashboard');
            }
        });
    });
});
app.get('/edit_room/:roomid', function (req, res) {
    res.render('edit_room');
});
app.get('/join_room/:roomid', function (req, res) {
    if (req.session && req.session.user_name) {
        console.log("A")
        res.redirect(`/conference?room=${req.params.roomid}&user=${req.session.user_name}`);
    } else if (req.query.name) {
        console.log("B")
        res.redirect(`/conference?room=${req.params.roomid}&user=${req.query.name}`);
    } else {
        console.log("C")
        res.sendFile('join_room.html', { root: path.join(__dirname, '..', 'public') });
    }
});
app.get('/export_participants/:roomid', function (req, res) {
    res.render('export_participants');
});
app.all('/do_login', function (req, res) {
    //res.sendFile('login.html', { root: path.join(__dirname, '..', 'public')});
    var user_email = req.body.user_email;
    var user_password = req.body.user_password;
    pool.getConnection(function (err, connection) {
        if (err) console.log(err);
        var sql = "select * from users_virsalink where user_email='" + user_email + "'";
        connection.query(sql, function (er, result) {
            if (er) console.log(er);
            if (user_password == result[0].password) {
                // sessions = req.session;
                /**
                 * do not use global "sessions" variable
                 * it was the main cause getting "administrator" every time
                 */
                req.session.userid = result[0].id;
                req.session.user_name = result[0].user_name;
                req.session.user_email = result[0].user_email;
                req.session.user_type = result[0].user_type;
                connection.release();
                res.redirect("/dashboard");
            } else {
                console.log(result[0].password);
            }
        });
    });

});
app.get('/roomclient', function (req, res) {
    res.sendFile('index.html', { root: path.join(__dirname, '..', 'public') });
});
app.get('/mediasoupclient', function (req, res) {
    res.sendFile('mediasoupclient.min.js', { root: path.join(__dirname, '..', 'public/modules') });
});
app.get('/index', function (req, res) {
    res.sendFile('index.js', { root: path.join(__dirname, '..', 'public') });
});
app.get('getHost', function (req, res) {
    var producer_id = req.params.prod_id;
    pool.getConnection(function (err, con) {
        if (err) console.log(err);
        var sql = "select * from conference_attendance where user_type='" + producer_id + "'";

        con.query(sql, [values], function (err, result) {
            if (err) {

            } else {
                con.release();
                console.log(JSON.stringify(result));
                res.send(JSON.stringify(result));
            }
        });
    });
});
httpsServer.listen(config.listenPort, () => {
    console.log('listening https ' + config.listenPort)
})



// all mediasoup workers
let workers = []
let nextMediasoupWorkerIdx = 0

let roomList = new Map()

    ;
(async () => {
    await createWorkers()
})()



async function createWorkers() {
    let {
        numWorkers
    } = config.mediasoup

    for (let i = 0; i < numWorkers; i++) {
        let worker = await mediasoup.createWorker({
            logLevel: config.mediasoup.worker.logLevel,
            logTags: config.mediasoup.worker.logTags,
            rtcMinPort: config.mediasoup.worker.rtcMinPort,
            rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
        })

        worker.on('died', () => {
            console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
            setTimeout(() => process.exit(1), 2000);
        })
        workers.push(worker)

        // log worker resource usage
        /*setInterval(async () => {
            const usage = await worker.getResourceUsage();

            console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
        }, 120000);*/
    }
}
var s_id;

io.on('connect', socket => {


    socket.on('createRoom', async ({
        room_id
    }, callback) => {
        if (roomList.has(room_id)) {
            callback('already exists')
        } else {
            console.log('---created room--- ', room_id)
            let worker = await getMediasoupWorker()
            roomList.set(room_id, new Room(room_id, worker, io))
            callback(room_id)
        }
    })

    socket.on('join', ({
        room_id,
        name,
        socket_id
    }, cb) => {
        /* 
         * JIBREEL
         * same express session
         * socket.handshake.session
        */
        // console.log(socket.handshake.session.user_type);
        const user_type = socket.handshake.session.user_type || 'guest'
        // JIBREEL -> only emit for admin
        if (user_type == 'Admin') socket.emit('i_am_admin')
        
        s_id = socket_id;
        all_sockets.push({ room_id, name, socket_id: socket.id, user_type });
        socket.join(room_id)
        io.sockets.in(room_id).emit('new_user', all_sockets.filter(i => i.room_id == room_id));
        console.log('---user joined--- \"' + room_id + '\": ' + name)
        if (!roomList.has(room_id)) {
            return cb({
                error: 'room does not exist'
            })
        }
        var p = new Peer(socket.id, name);
        roomList.get(room_id).addPeer(p)
        socket.room_id = room_id

        cb(roomList.get(room_id).toJson())
    })

    socket.on('getProducers', () => {
        console.log(`---get producers--- name:${roomList.get(socket.room_id).getPeers().get(socket.id).name}`)
        // send all the current producer to newly joined member
        if (!roomList.has(socket.room_id)) return
        let producerList = roomList.get(socket.room_id).getProducerListForPeer(socket.id)

        socket.emit('newProducers', producerList)
    })

    socket.on('getRouterRtpCapabilities', (_, callback) => {
        console.log(`---get RouterRtpCapabilities--- name: ${roomList.get(socket.room_id).getPeers().get(socket.id).name}`)
        try {
            callback(roomList.get(socket.room_id).getRtpCapabilities());
        } catch (e) {
            callback({
                error: e.message
            })
        }

    });

    socket.on('createWebRtcTransport', async (_, callback) => {
        console.log(`---create webrtc transport--- name: ${roomList.get(socket.room_id).getPeers().get(socket.id).name}`)
        try {
            const {
                params
            } = await roomList.get(socket.room_id).createWebRtcTransport(socket.id);

            callback(params);
        } catch (err) {
            console.error(err);
            callback({
                error: err.message
            });
        }
    });

    socket.on('connectTransport', async ({
        transport_id,
        dtlsParameters
    }, callback) => {
        console.log(`---connect transport--- name: ${roomList.get(socket.room_id).getPeers().get(socket.id).name}`)
        if (!roomList.has(socket.room_id)) return
        await roomList.get(socket.room_id).connectPeerTransport(socket.id, transport_id, dtlsParameters)

        callback('success')
    })

    socket.on('produce', async ({
        kind,
        rtpParameters,
        producerTransportId
    }, callback) => {

        if (!roomList.has(socket.room_id)) {
            return callback({ error: 'not is a room' })
        }

        let producer_id = await roomList.get(socket.room_id).produce(socket.id, producerTransportId, rtpParameters, kind)
        console.log(`---produce--- type: ${kind} name: ${roomList.get(socket.room_id).getPeers().get(socket.id).name} id: ${producer_id}`)
        callback({
            producer_id
        })
    })

    socket.on('consume', async ({
        consumerTransportId,
        producerId,
        rtpCapabilities
    }, callback) => {
        //TODO null handling
        let params = await roomList.get(socket.room_id).consume(socket.id, consumerTransportId, producerId, rtpCapabilities)

        console.log(`---consuming--- name: ${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name} prod_id:${producerId} consumer_id:${params.id}`)
        callback(params)
    })

    socket.on('resume', async (data, callback) => {

        await consumer.resume();
        callback();
    });

    socket.on('getMyRoomInfo', (_, cb) => {
        cb(roomList.get(socket.room_id).toJson())
    })

    socket.on('disconnect', () => {
        console.log(`---disconnect--- name: ${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name}`)
        if (!socket.room_id) return
        roomList.get(socket.room_id).removePeer(socket.id)
        var oid;
        // for(var i=0;i<all_sockets.length;i++){
        //     if(all_sockets[i].room_id == socket.room_id)
        //         oid= i;
        // }
        // if(oid != undefined && oid > -1){
        //     all_sockets.splice(oid,1);
        console.log(socket.id)
        all_sockets = all_sockets.filter(i => {
            console.log(i, socket.id);
            return i.socket_id != socket.id
        })
        io.sockets.in(socket.room_id).emit('new_user', all_sockets.filter(i => i.room_id == socket.room_id));
        // }
    })

    socket.on('disable_video', function (so_id) {
        console.log('request to disable video for: ' + so_id);
        io.sockets.emit('mute_video', so_id);
    })

    socket.on('enable_video', function (so_id) {
        console.log('request to enable video for: ' + so_id);
        io.sockets.emit('unmute_video', so_id);
    })

    socket.on('disable_audio', function (so_id) {
        console.log('request to disable audio for: ' + so_id);
        io.sockets.emit('mute', so_id);
    })

    socket.on('enable_auido', function (so_id) {
        console.log('request to enable audio for: ' + so_id);
        io.sockets.emit('unmute', so_id);
    })

    socket.on('enable_screen_share', function (so_id) {
        console.log('request to enable screen share for: ' + so_id);
        io.sockets.emit('enable_screen', so_id);
    })

    socket.on('disable_screen_share', function (so_id) {
        console.log('request to disable screen share for: ' + so_id);
        io.sockets.emit('disable_screen', so_id);
    })

    socket.on('pop', function (so_id) {
        console.log('request to pop user: ' + so_id);
        io.sockets.emit('pop_user', so_id);
    })

    socket.on('update_attendance', function (udata) {

        console.log(udata.today);
        console.log("add attendance for " + udata.nmm);
        pool.getConnection(function (err, con) {
            if (err) console.log(err);
            var sql = "update conference_attendance set roomid=" + udata.rom + ",name='" + udata.nmm + "',date='" + udata.today + "' ,user_type='" + udata.user_type + "' where sno=1";
            var values = [
                [udata.rom, udata.nmm, udata.today, udata.user_type]
            ];
            con.query(sql, [values], function (err, result, fields) {
                if (err) {
                    console.log(err);
                } else {
                    con.release();

                    ins_id = result.insertId;

                }
            });
        });

    });

    socket.on('update_producer_id', function (udata) {


        pool.getConnection(function (err, con) {
            if (err) console.log(err);
            var sql = "UPDATE conference_attendance set producer_id= ? where sno=1";
            var values = [
                [udata.producer_id]
            ];
            con.query(sql, [values], function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    con.release();
                    console.log("producer updated");

                }
            });
        });
    })

    socket.on('producerClosed', ({
        producer_id
    }) => {
        console.log(`---producer close--- name: ${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name}`)
        roomList.get(socket.room_id).closeProducer(socket.id, producer_id)
    })

    socket.on('browser_closed', function (va) {
        // var oid;
        // for (var i = 0; i < all_sockets.length; i++) {
        //     if (all_sockets[i].room_id == socket.room_id)
        //         oid = i;
        // }
        // if (oid != undefined && oid > -1) {
        //     all_sockets.splice(oid, 1);
        //     io.sockets.in(socket.room_id).emit('new_user', all_sockets.filter(i => i.room_id == socket.room_id));
        // }
    })

    socket.on('exitRoom', async (_, callback) => {
        var oid;
        for (var i = 0; i < all_sockets.length; i++) {
            if (all_sockets[i].room_id == socket.room_id)
                oid = i;
        }
        if (oid != undefined && oid > -1) {
            all_sockets.splice(oid, 1);
            io.sockets.in(socket.room_id).emit('new_user', all_sockets.filter(i => i.room_id == socket.room_id));
        }
        console.log(`---exit room--- name: ${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name}`)
        if (!roomList.has(socket.room_id)) {
            callback({
                error: 'not currently in a room'
            })
            return
        }
        // close transports
        await roomList.get(socket.room_id).removePeer(socket.id)
        if (roomList.get(socket.room_id).getPeers().size === 0) {
            roomList.delete(socket.room_id)
        }

        socket.room_id = null


        callback('successfully exited room')
    })
})

function room() {
    return Object.values(roomList).map(r => {
        return {
            router: r.router.id,
            peers: Object.values(r.peers).map(p => {
                return {
                    name: p.name,
                }
            }),
            id: r.id
        }
    })
}

/**
 * Get next mediasoup Worker.
 */
function getMediasoupWorker() {
    const worker = workers[nextMediasoupWorkerIdx];

    if (++nextMediasoupWorkerIdx === workers.length)
        nextMediasoupWorkerIdx = 0;

    return worker;
}
