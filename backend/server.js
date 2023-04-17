import express from 'express';
import WebSocket from 'ws';
import http from 'http';
import cors from 'cors';
import multer from 'multer';
import skypeCloneRouter from './routers/skypeCloneRouter.js';
import path from 'path';
import speech  from '@google-cloud/speech';
import dotenv  from 'dotenv';

const speechClient = new speech.SpeechClient(); // Creates a client
dotenv.config();
const app = express();
const host = 'localhost'
const port = 4000;
const server = http.createServer(app);
export let newMeetingData = {};
export let loggedInUserDetails = {};

////// TEMP SERVER NEW ROOM ///////////

export let newRoomCreatedCustomApi = {};
export let newRoomCreatedCustomApiMembers = {};

export let _getUniqueId = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 9);
};

////// TEMP SERVER NEW ROOM ///////////

const clients = {};
const userData = {};
let storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, '/var/www/html/conference/upload/')
    },
    filename: (req, file, callBack) => {
        const fileFinalName = file.fieldname + '-' + Date.now() + '.png';
        callBack(null, fileFinalName)
    }
})
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(express.urlencoded({ extended: true,limit: '250mb' }));

app.use(express.json({limit: '250mb'}));

///////// USER API GET ////////////////
app.use('/api/skype', skypeCloneRouter);
///////// USER API GET ////////////////


app.get('/api', (req, res) => {
    res.status(200).send({message:'Node Server is ready'});
});
let upload = multer({
    storage: storage
});
app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
        console.log("No file upload");
    } else {
        console.log(req.file.filename)
    }
    res.status(200).send({name:req.file.filename});
});
app.get('/api/image/:name', function (req, res) {
    res.sendFile('/var/www/html/conference/upload/'+req.params.name);
})

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

app.use((err, req, res,next) => {
    res.status(500).send({ message: err.message });
});

let recognizeStream = null;
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US'; //en-US


const request = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        profanityFilter: false,
        enableWordTimeOffsets: true,
        // speechContexts: [{
        //     phrases: ["hoful","shwazil"]
        //    }] // add your own speech context for better recognition
    },
    interimResults: true, // If you want interim results, set this to true
};

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};
setupWebSocket();
function setupWebSocket(){
    const wsServer = new WebSocket.Server({ server });

    const sendMessage = (jsonData,connection) => {
        // We are sending the current data to all connected clients
        Object.keys(clients).map((client) => {
           if (clients[client] !== connection && clients[client].readyState === WebSocket.OPEN) {
                clients[client].send(JSON.stringify(jsonData));
            }
        });
    }

    const sendAudioToTextMessage = (jsonData) => {
        // We are sending the current data to all connected clients
        Object.keys(clients).map((client) => {
            if(clients[client].readyState === WebSocket.OPEN){
                clients[client].send(JSON.stringify(jsonData));
            }
        });
    }

    wsServer.on('connection', function(connection,re) {
        const userID = getUniqueID();
        clients[userID] = connection;



        //////////////////  SPEECH ////////////////
        const startRecognitionStream = (client)=> {
            recognizeStream = speechClient
                .streamingRecognize(request)
                .on('error', console.error)
                .on('data', (data) => {
                    if(data.results[0] && data.results[0].alternatives[0]) {
                        let textData = data.results[0].alternatives[0].transcript;
                        if(textData?.trim().length) {
                            let newDataPayload = {
                                type: 'streamMicrophoneAudioByGoogleCloud',
                                data: {
                                    userInfo: userData[userID],
                                    text: data.results[0].alternatives[0].transcript
                                }
                            }
                            sendAudioToTextMessage(newDataPayload);
                        }
                    }
                    // if end of utterance, let's restart stream
                    // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
                    if (data.results[0] && data.results[0].isFinal) {
                        stopRecognitionStream();
                        startRecognitionStream(client);
                    }
                });
        }
        //startRecognitionStream('');

        function stopRecognitionStream(client) {
            if (recognizeStream != null) {
                recognizeStream.end();
            }
            recognizeStream = null;
        }
        //////////////////  SPEECH ////////////////



        connection.on('message', function(message) {
            let dataToSend;
            try {
                dataToSend = JSON.parse(message);
            }  catch (e) {
                if (recognizeStream != null) {
                    recognizeStream.write(message);
                }
                return;
            }


            if (typeof(dataToSend) !== 'undefined' && typeof(dataToSend) == undefined && typeof(dataToSend.error) !== 'undefined' && typeof(dataToSend) !== 'object') {
                console.log('- websocket message error -------',message);
            } else {
                switch (dataToSend?.type){
                    case 'addedNewRoomToJoinSocketCall':
                        newMeetingData[dataToSend.adminId] = dataToSend;
                        break;
                    case 'addNewSoundStreamToSocket':
                        userData[userID] = dataToSend?.data?.userData;
                        const bufferArray = new Int16Array(JSON.parse(dataToSend?.data?.dataString));
                        if (recognizeStream != null) {
                            recognizeStream.write(Buffer.from(bufferArray?.buffer));
                        }
                        break;
                    case 'setUserDataCurrentClient':
                        userData[userID] = dataToSend.data;
                        break;
                    case 'removeRoomToJoinSocketCall':
                        if(dataToSend?.adminId != undefined && newMeetingData != null && newMeetingData[dataToSend.adminId] != undefined && newMeetingData[dataToSend.adminId] != null) {
                            delete newMeetingData[dataToSend.adminId];
                            stopRecognitionStream();
                        }
                        break;
                    case 'addedNewUsrInCurrentMeeting':
                        if(newMeetingData[dataToSend.adminId]?.members != undefined) {
                            let a = newMeetingData[dataToSend.adminId]?.members;
                            let b = dataToSend?.members;
                            let usersArray = [...a, ...b];
                            newMeetingData[dataToSend.adminId].members = usersArray;
                            dataToSend = newMeetingData[dataToSend.adminId];
                        }
                        break;
                    case 'actionToRemoveUserFromRoom':
                        if(newMeetingData[dataToSend.adminId]?.members != undefined) {
                            let foundIndex = null;
                            let usersArray = newMeetingData[dataToSend.adminId]?.members;
                            usersArray?.map((userInCall,key)=>{
                                if(userInCall == dataToSend.id){
                                    foundIndex = key;
                                }
                            })
                            if(foundIndex != null){
                                usersArray.splice(foundIndex,1);
                            }
                            newMeetingData[dataToSend.adminId].members = usersArray;
                            dataToSend = newMeetingData[dataToSend.adminId];
                        }
                        break;
                    ////// new socket call /////////////
                    case 'addedNewRoomToJoinSocketCallCustomApiCall':
                        newRoomCreatedCustomApi[dataToSend.adminId] = {};
                        newRoomCreatedCustomApi[dataToSend.adminId].roomId = dataToSend.roomId;
                        newRoomCreatedCustomApi[dataToSend.adminId].members = [];
                        newRoomCreatedCustomApiMembers[dataToSend.roomId] = dataToSend.members;
                        dataToSend = {
                            roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                            members: dataToSend.members,
                            type: 'addedNewRoomToJoinSocketCallCustomApiCall'
                        }
                        break;
                    case 'newMemberAddedToCurrentRoom':
                        if(newRoomCreatedCustomApi[dataToSend.adminId] != undefined){
                            newRoomCreatedCustomApi[dataToSend.adminId]?.members.push(dataToSend.member);
                            dataToSend = {
                                roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                                members: newRoomCreatedCustomApi[dataToSend.adminId].members,
                                userData: dataToSend.member,
                                type: 'newMemberAddedToCurrentRoom'
                            }
                        }
                        break;
                    ////// new socket call ////////////
                }
                if(dataToSend?.type != 'setUsrDataCurrentClient' && dataToSend?.type != 'addNewSoundStreamToSocket');
                   sendMessage(dataToSend,connection);
            }
        });
        connection.on('close', function() {
           console.log('closed');
        });
    });
}

server.listen(port,host, function() {
    console.log('[SOCKET SERVER CONNECTED TO PORT ]',port);
})

