import express from 'express';
import  WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv  from 'dotenv';
import { PeerServer }  from 'peer';
import callRouter from "./routers/callRouter.js";
import speech from "@google-cloud/speech";
const speechClient = new speech.SpeechClient(); // Creates a client

dotenv.config();
const app = express();
const host = 'localhost'
const port = 4001;
const peerServerPort = 4002;
const server = http.createServer(app);

export let newRoomCreatedCustomApi = {};
export let newRoomCreatedCustomApiMembers = {};

export let _getUniqueId = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 9);
};

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


const clients = {};

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
app.use('/api-call/call/', callRouter);
///////// USER API GET ////////////////


app.get('/api-call', (req, res) => {
    res.status(200).send({message:`Node Server is ready port ${port}`});
});

app.use((err, req, res,next) => {
    res.status(500).send({ message: err.message });
});

setupWebSocket();
function setupWebSocket(){
    const wsServer = new WebSocketServer({ server });

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
        const userID = _getUniqueId()+'-'+_getUniqueId()+'-'+_getUniqueId();
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
                return;
            }

            if (typeof(dataToSend) !== 'undefined' && typeof(dataToSend) == undefined && typeof(dataToSend.error) !== 'undefined' && typeof(dataToSend) !== 'object') {
                console.log('- websocket message error -------',message);
            } else {
                switch (dataToSend?.type){
                    case 'addedNewRoomToJoinSocketCallCustomApiCall':
                        newRoomCreatedCustomApi[dataToSend.adminId] = {};
                        newRoomCreatedCustomApi[dataToSend.adminId].roomId = dataToSend.roomId;
                        newRoomCreatedCustomApi[dataToSend.adminId].members = [];
                        newRoomCreatedCustomApiMembers[dataToSend.adminId] = dataToSend.members;
                        dataToSend = {
                            roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                            members: dataToSend.members,
                            type: 'addedNewRoomToJoinSocketCallCustomApiCall'
                        }
                        sendMessage(dataToSend,connection);
                        break;
                    case 'newMemberAddedToCurrentRoom':
                        if(newRoomCreatedCustomApi[dataToSend.adminId]){
                            let found = null;
                            newRoomCreatedCustomApi[dataToSend.adminId]?.members?.map((member,index)=>{
                                if(member?.id === dataToSend.member?.id){
                                    found = index;
                                }
                            })

                            if(found === null)
                                newRoomCreatedCustomApi[dataToSend.adminId]?.members.push(dataToSend.member);


                            dataToSend = {
                                roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                                userData: dataToSend.member,
                                type: 'newMemberAddedToCurrentRoom'
                            }
                            sendMessage(dataToSend,connection);
                        }
                        break;
                    case 'removeCurrentRoomAndEndCall':
                        if(newRoomCreatedCustomApi[dataToSend.adminId] != undefined){
                            delete newRoomCreatedCustomApi[dataToSend.adminId];
                            sendMessage(dataToSend,connection);
                        }
                        break;
                    case 'handleMuteUnmuteInCall':
                        if(newRoomCreatedCustomApi[dataToSend.adminId] != undefined){
                            let membersInCall =  newRoomCreatedCustomApi[dataToSend.adminId]?.members;
                            if(dataToSend?.users){
                                dataToSend?.users?.map((id)=>{
                                    membersInCall?.map((user,key)=>{
                                        if(user.id == id){
                                            membersInCall[key].audio = dataToSend?.audio != 'MUTE' ? true : false;
                                        }
                                    })
                                })
                            }
                            newRoomCreatedCustomApi[dataToSend.adminId].members = membersInCall;
                            dataToSend = {
                                roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                                data: {users:dataToSend?.users,audio:dataToSend?.audio},
                                adminId:dataToSend.adminId,
                                type: 'handleMuteUnmuteInCall'
                            }
                            sendMessage(dataToSend,connection);
                        }
                        break;
                    case 'leaveCurrentRunningCall':
                        if(newRoomCreatedCustomApi[dataToSend.adminId] != undefined){
                            let membersInCall =  newRoomCreatedCustomApi[dataToSend.adminId]?.members;
                            if(dataToSend?.userId){
                                membersInCall?.map((user,key)=>{
                                    if(user.id === dataToSend?.userId){
                                        membersInCall.splice(key,1);
                                    }
                                })
                            }
                            newRoomCreatedCustomApi[dataToSend.adminId].members = membersInCall;
                            dataToSend = {
                                roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                                userId: dataToSend?.userId,
                                type: 'leaveCurrentRunningCall'
                            }
                            sendMessage(dataToSend,connection);
                        }
                        break;
                    case 'kickOutFromCurrentRunningCall':
                        if(newRoomCreatedCustomApi[dataToSend.adminId] != undefined){
                            let membersInCall =  newRoomCreatedCustomApi[dataToSend.adminId]?.members;
                            if(dataToSend?.userId){
                                membersInCall?.map((user,key)=>{
                                    if(user.id === dataToSend?.userId){
                                        membersInCall.splice(key,1);
                                    }
                                })
                            }
                            newRoomCreatedCustomApi[dataToSend.adminId].members = membersInCall;
                            if(newRoomCreatedCustomApiMembers[dataToSend.adminId] != undefined) {
                                const indexOfId = newRoomCreatedCustomApiMembers[dataToSend.adminId].indexOf(dataToSend?.userId);
                                if(indexOfId >= 0) {
                                    newRoomCreatedCustomApiMembers[dataToSend.adminId].splice(indexOfId, 1);
                                }
                            }

                            dataToSend = {
                                roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                                userId: dataToSend?.userId,
                                type: 'kickOutFromCurrentRunningCall'
                            }
                            sendMessage(dataToSend,connection);
                        }
                        break;
                    case 'addedNewUserInCurrentMeeting':
                        if(newRoomCreatedCustomApiMembers[dataToSend.adminId] != undefined){
                            if(newRoomCreatedCustomApiMembers[dataToSend.adminId] != undefined) {
                                newRoomCreatedCustomApiMembers[dataToSend.adminId] = dataToSend?.members;
                            }
                            dataToSend = {
                                roomData: newRoomCreatedCustomApi[dataToSend.adminId],
                                members: dataToSend.members,
                                type: 'addedNewRoomToJoinSocketCallCustomApiCall'
                            }
                            sendMessage(dataToSend,connection);
                        }
                        break;

                }
            }
        });
        connection.on('close', function() {
           console.log('closed');
        });
    });
}

server.listen(port,host, function() {
    console.log('[SOCKET SERVER CONNECTED TO PORT ]',port);
    PeerServer({ port: peerServerPort, path: '/peerApp' });
    console.log('[Peer Js server connected on port ]',peerServerPort);
})

