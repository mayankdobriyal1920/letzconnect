import {
    actionToAddNewAdminUserDataLocally,
    actionToAddNewUserDataLocally,
    actionToDeleteUserDataLocally,
    actionToSetNewJoinRoomData,
    actionToSetRoomParticipantArray, actionToStoreCurrentCallSpeechToTextDataAddLocally,
    handleWebSocketEventCall, signout
} from "../UserAction";

let timeInterval:any = null;
let webSocketClient:any;
const setUserUniqueClientId = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    let uniqueId = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    localStorage.setItem('clientId',uniqueId);
}

export function getWebsocketConnectedMessage(W3CWebSocket:any,dispatch:any,userData:any) {
    setUserUniqueClientId();
    if (webSocketClient) {
        webSocketClient.onerror = webSocketClient.onopen = webSocketClient.onclose = null;
        webSocketClient.close();
    }
    let wsUrl = `wss://letzconnects.com/api`;
    //const wsUrl = `wss://rcr23.osolutions.com.au/api`;
    webSocketClient = new W3CWebSocket(wsUrl, null, {
        headers: {
            'Accept-Language': 'en,en-US;q=0.9,ru;q=0.8,de;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
        }
    })
    webSocketClient.onopen = () => {
      console.log('-------------- Websocket connection opened ------------',webSocketClient);
        sendWebsocketRequest(JSON.stringify({
            clientId: localStorage.getItem('clientId'),
            data: userData,
            type: "setUserDataCurrentClient"
        }));
    }
    webSocketClient.onerror = () => {
        console.log('-------------- Reconnect websocket ------------',webSocketClient);
        getWebsocketConnectedMessage(W3CWebSocket,dispatch,userData);
    }
    webSocketClient.onmessage = (message:any) => {
        let result;
        try {
            result = JSON.parse(message.data);
        }  catch (e) {
            console.log('- websocket message error -------');
        }

        if (typeof(result) !== 'undefined' && typeof(result.error) !== 'undefined') {
            console.log('- websocket message error -------');
        } else {
            const dataFromServer = JSON.parse(message.data);
            dispatch(handleWebSocketEventCall(dataFromServer))
        }
    };
    webSocketClient.onclose = function () {
        console.log('-------------- Closed Reconnect websocket ------------',webSocketClient);
        setTimeout(function(){
            getWebsocketConnectedMessage(W3CWebSocket,dispatch,userData);
        },1000)
    }

    if(timeInterval != null)
        clearInterval(timeInterval);

    timeInterval = setInterval(function(){
        let data = {type:'wakeupMessage',message:'wakeup'};
        sendWebsocketRequest(JSON.stringify(data));
    },10000)
}

export function sendWebsocketRequestMedia(data:any){
    if(webSocketClient != null) {
        const ws = webSocketClient;
        const waitForConnection = function (callback:any, interval:any) {
            if (ws.readyState === 1) {
                callback();
            } else {
                //optional: implement backoff for interval here
                setTimeout(function () {
                    waitForConnection(callback, interval);
                }, interval);
            }
        };
        waitForConnection(function () {
            ws.send(data);
        }, 1000);
    }
}
export function sendWebsocketRequest(data:any){
    if(webSocketClient != null) {
        const ws = webSocketClient;
        const waitForConnection = function (callback:any, interval:any) {
            if (ws.readyState === 1) {
                callback();
            } else {
                //optional: implement backoff for interval here
                setTimeout(function () {
                    waitForConnection(callback, interval);
                }, interval);
            }
        };
        waitForConnection(function () {
            ws.send(data);
        }, 1000);
    }
}
export function handleWebSocketEvent(dispatch:any,state:any,data:any){
    const {userInfo} = state.userSignin;
    switch(data.type){
        case 'logOutUserFromOtherDevices': {
            if(data?.data?.id == userInfo?.id){
               dispatch(signout());
            }
            break;
        }
        case 'addedNewRoomToJoinSocketCall': {
            if(data?.members?.length && data?.members?.includes(userInfo?.id) && userInfo?.created_by == data?.adminId){
                dispatch(actionToSetNewJoinRoomData(data.data));
            }else{
                dispatch(actionToSetNewJoinRoomData({}));
            }
            break;
        }
        case 'removeRoomToJoinSocketCall': {
            if(userInfo?.created_by == data?.adminId) {
                dispatch(actionToSetNewJoinRoomData(null));
            }
            break;
        }
        case 'deleteMemberInApp': {
            dispatch(actionToDeleteUserDataLocally(data?.data));
            break;
        }
        case 'addNewAdminMemberInApp': {
            dispatch(actionToAddNewAdminUserDataLocally(data?.data));
            break;
        }
        case 'newParticipantJoinedToMeetingRoom': {
            dispatch(actionToSetRoomParticipantArray(data?.meetingRoomParticipants));
            break;
        }
        case 'addNewMemberInApp': {
            dispatch(actionToAddNewUserDataLocally(data?.data));
            break;
        }
        case 'streamMicrophoneAudioByGoogleCloud': {
            dispatch(actionToStoreCurrentCallSpeechToTextDataAddLocally(data?.data));
            break;
        }
    }
}