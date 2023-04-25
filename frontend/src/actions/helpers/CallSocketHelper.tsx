import {
    actionToChangeRoomDataLocally,
    actionToHandleCallSocketEventCall, actionToJoinNewUserInCurrentCall, actionToMuteUnmuteUserCallLocally,
    actionToSetCallBroadcastMessage, actionToSetNewLeaveUserInCallData,
    actionToStoreCurrentCallSpeechToTextDataAddLocally
} from "../UserAction";

let timeInterval:any = null;
let callSocketClient:any;
const setUserUniqueClientId = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    let uniqueId = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    localStorage.setItem('clientId',uniqueId);
}

export function getCallSocketConnectedMessage(W3CCallSocket:any,dispatch:any) {
    setUserUniqueClientId();
    if (callSocketClient) {
        callSocketClient.onerror = callSocketClient.onopen = callSocketClient.onclose = null;
        callSocketClient.close();
    }
    let wsUrl = `wss://letscall.co.in/api-call`;
    callSocketClient = new W3CCallSocket(wsUrl, null, {
        headers: {
            'Accept-Language': 'en,en-US;q=0.9,ru;q=0.8,de;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
        }
    })
    callSocketClient.onopen = () => {
        console.log('[ CALL SOCKET OPEN ]',callSocketClient);
    }
    callSocketClient.onerror = () => {
        console.log('[ RECONNECT CALL SOCKET ]',callSocketClient);
        getCallSocketConnectedMessage(W3CCallSocket,dispatch);
    }
    callSocketClient.onmessage = (message:any) => {
        if(JSON.parse(message.data)) {
            const dataFromServer = JSON.parse(message.data);
            dispatch(actionToHandleCallSocketEventCall(dataFromServer))
        }
    };
    callSocketClient.onclose = function () {
        console.log('[ CALL SOCKET CLOSED ]',callSocketClient);
        setTimeout(function(){
            getCallSocketConnectedMessage(W3CCallSocket,dispatch);
        },1000)
    }

    if(timeInterval != null)
        clearInterval(timeInterval);

    timeInterval = setInterval(function(){
        let data = {type:'wakeupMessage',message:'wakeup'};
        sendCallSocketRequest(JSON.stringify(data));
    },10000)
}

export function sendCallSocketRequest(data:any){
    if(callSocketClient != null) {
        const ws = callSocketClient;
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
export function handleCallSocketEvent(dispatch:any,state:any,data:any){
    const {userInfo} = state.userSignin;
    switch(data.type){
        case 'addedNewRoomToJoinSocketCallCustomApiCall': {
            if(data?.members?.length && data.members.includes(userInfo?.id)){
                dispatch(actionToChangeRoomDataLocally(data?.roomData));
            }else{
                dispatch(actionToChangeRoomDataLocally({roomId:null,members:[]}));
            }
            break;
        }
        case 'newMemberAddedToCurrentRoom': {
           if(data?.roomData?.roomId === state?.currentRoomData?.roomId){
                 console.log('[NEW MEMBER JOINED]',data?.roomData);
               setTimeout(function () {
                   dispatch(actionToChangeRoomDataLocally(data?.roomData));
                   dispatch(actionToJoinNewUserInCurrentCall(data?.userData));
                   dispatch(actionToSetCallBroadcastMessage('participant-joined'));
               });
          }
            break;
        }

        case 'removeCurrentRoomAndEndCall': {
            if(data?.adminId === userInfo?.created_by){
                dispatch(actionToChangeRoomDataLocally({roomId:null,members:[]}));
                dispatch(actionToSetCallBroadcastMessage('end-of-current-call'));
            }
            break;
        }

        case 'handleMuteUnmuteInCall': {
            if(data?.roomData?.roomId === state?.currentRoomData?.roomId){
                console.log('[ HANDLE MUTE ]',data?.roomData);
                dispatch(actionToMuteUnmuteUserCallLocally(data.data));
                dispatch(actionToChangeRoomDataLocally(data?.roomData));
                dispatch(actionToSetCallBroadcastMessage('participant-updated'));
            }
            break;
        }

        case 'leaveCurrentRunningCall': {
            if(data?.roomData?.roomId === state?.currentRoomData?.roomId){
                dispatch(actionToSetNewLeaveUserInCallData(data?.userId));
                dispatch(actionToChangeRoomDataLocally(data?.roomData));
                dispatch(actionToSetCallBroadcastMessage('participant-left'));
            }
            break;
        }

        case 'kickOutFromCurrentRunningCall': {
            if(data?.roomData?.roomId === state?.currentRoomData?.roomId){
                console.log('[ HANDLE KICK OUT ]',data);
                console.log('[ HANDLE KICK OUT data?.userId === userInfo?.id ]',data?.userId,userInfo?.id);
                dispatch(actionToSetNewLeaveUserInCallData(data?.userId));
                if(data?.userId === userInfo?.id) {
                    dispatch(actionToChangeRoomDataLocally({roomId: null, members: []}));
                    dispatch(actionToSetCallBroadcastMessage('end-of-current-call'));
                } else {
                    dispatch(actionToChangeRoomDataLocally(data?.roomData));
                    dispatch(actionToSetCallBroadcastMessage('participant-left'));
                }
            }
            break;
        }
        case 'streamMicrophoneAudioByGoogleCloud': {
            dispatch(actionToStoreCurrentCallSpeechToTextDataAddLocally(data?.data));
            break;
        }
    }
}