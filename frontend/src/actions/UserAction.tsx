import Axios from 'axios';
import { cloneDeep } from 'lodash';
import {
  ALL_ROOM_MEETING_PARTICIPANT_DATA,
  NEW_JOIN_ROOM_DATA,
  USER_SIGNIN_FAIL,
  USER_SIGNIN_REQUEST,
  USER_SIGNIN_SUCCESS,
  USER_SIGNOUT,
  ALL_USER_DATA_SUCCESS,
  ALL_USERS_IN_CALL,
  ALL_CALL_LOG_DATA,
  CURRENT_CALL_SPEECH_TO_TEXT,
  ACTIVE_SPEAKING_USER_DATA,
  CURRENT_ROOM_DETAILS,
  CALL_SOCKET_MESSAGE_BROADCAST, MY_CURRENT_AUDIO_CHANGE, NEW_ADDED_USER_IN_CALL_DATA, NEW_LEAVE_USER_IN_CALL_DATA
} from '../constants/UserConstants';
import { handleWebSocketEvent, sendWebsocketRequest } from './helpers/WebSocketHelper';
import {handleCallSocketEvent, sendCallSocketRequest} from "./helpers/CallSocketHelper";


const api = Axios.create({
  baseURL: `https://letscall.co.in/api/`
})
const callApi = Axios.create({
  baseURL: `https://letscall.co.in/api-call/`
})

export const actionToGetLoginToken = (id:any,token:any) => async (dispatch:any) => {
  try {
    return api.get(`skype/loggedInTokenById/${id}`).then(response=>{
      if(response.data && response.data.token){
        if(response.data.token != token){
          dispatch(signout());
        }
      }
    })
  } catch (error:any) {
  }
}
export const actionToSendOtpFoResetPassword = (email:any) => async () => {
  let responseData = {success:0,otp:0};
  try {
    return api.post(`skype/sendOtpToEmailAddress`,{email}).then(response=>{
      if(response.data){
        if(response.data.success){
          responseData.success = 1;
          responseData.otp = response.data.otp;
        } else {
          responseData.success = 0;
        }
        return responseData;
      }else{
        return responseData;
      }
    })
  } catch (error:any) {
    return responseData;
  }
}
export const actionToSaveNewPassword = (payload:any) => (dispatch:any) => {
  const setData = `password=?`;
  const whereCondition = `email = '${payload.email}'`;
  const value = [payload.password];
  const dataToSend = {column: setData, value, whereCondition, tableName: 'app_user'};
  dispatch(commonUpdateFunction(dataToSend));
}
export const signin = (loginData:any) => async (dispatch:any) => {
  dispatch({ type: USER_SIGNIN_REQUEST });
  try {
    api.post(`skype/login`,loginData).then(response=>{
      let userData = response.data;
      if(response.data){
        if(response.data.success != 1){
          dispatch({
            type: USER_SIGNIN_FAIL,
            payload:'Wrong Password!',
          });
        } else {
          sendWebsocketRequest(JSON.stringify({
            clientId:localStorage.getItem('clientId'),
            data:userData.userData,
            type: "logOutUserFromOtherDevices"
          }));
          dispatch({ type: USER_SIGNIN_SUCCESS, payload: userData.userData});
          localStorage.setItem('userInfo',JSON.stringify(userData.userData));
          document.location.href = '/app';
        }
      }else{
        dispatch({type: USER_SIGNIN_FAIL,
          payload:'Invalid Login!',
        });
      }
    })
  } catch (error:any) {
    dispatch({
      type: USER_SIGNIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
export const actionToGetAllUserData = (id:any) => async (dispatch:any) => {
  try {
    api.get(`skype/users/${id}`).then(response=>{

      dispatch({
        type: ALL_USER_DATA_SUCCESS,
        payload:response.data.userData,
      });
    })
  } catch (error:any) {
    console.log(error);
  }
}
export const actionToStoreCurrentCallSpeechToTextDataAddLocally = (payload:any) => async (dispatch:any,getState:any) => {
  const currentCallSpeechToText = getState().currentCallSpeechToText;

  if(currentCallSpeechToText.length){
    let lastData = currentCallSpeechToText[currentCallSpeechToText.length-1];
    if(lastData.userInfo.id == payload.userInfo.id){
      currentCallSpeechToText[currentCallSpeechToText.length-1].text = payload.text;
    }else{
      currentCallSpeechToText.push({userInfo:payload.userInfo,text:payload.text});
    }
  }else{
    currentCallSpeechToText.push({userInfo:payload.userInfo,text:payload.text});
  }
  dispatch({
    type: CURRENT_CALL_SPEECH_TO_TEXT,
    payload:[...currentCallSpeechToText],
  });
}
export const actionToStoreCurrentCallSpeechToTextData = (text:any) => async (dispatch:any,getState:any) => {
  console.log('actionToStoreCurrentCallSpeechToTextData ---------------------- ',text);
  const userInfo = getState().userSignin.userInfo;
  let payload = {userInfo:userInfo,text:text};
  sendWebsocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    data:payload,
    type: "addSpeechToTextNewData"
  }));
  dispatch(actionToStoreCurrentCallSpeechToTextDataAddLocally(payload));
}
export const actionToGetAllCallLogData = (id:any) => async (dispatch:any) => {
  try {
    api.get(`skype/calllog/${id}`).then(response=>{
    
      dispatch({
        type: ALL_CALL_LOG_DATA,
        payload:response.data.callLogData,
      });
    })
  } catch (error:any) {
    console.log(error);
  }
}
export const actionToGetCurrentRoomData = (id:any) => async (dispatch:any,getState:any) => {
  const {userInfo} = getState().userSignin;
  try {
    callApi.get(`call/room/${id}`).then(response=>{
      let roomData = response?.data?.roomData;
      let allowedMembers = response?.data?.allowedMembers;
      if(roomData && roomData != undefined && Object?.keys(roomData)?.length){
        if(allowedMembers?.includes(userInfo.id)){
          dispatch(actionToChangeRoomDataLocally(response.data.roomData));
        }
      }
    })
  } catch (error:any) {
    console.log(error);
  }
}


export const signout = () => (dispatch:any) => {
  document.location.href = '/app';
  localStorage.removeItem('userInfo');
  setTimeout(function(){
    dispatch({ type: USER_SIGNOUT });
  },1000)
};

export const callInsertDataFunction = (payload:any) => async () => {
  try {
    const { data } = await api.post('skype/insertCommonApiCall',payload);
    return data;
  } catch (error) {
    console.log(error,'error');
  }
}

export const commonUpdateFunction = (payload:any) => async () => {
  try {
    const { data } = await api.post('skype/updateCommonApiCall',payload);
    return data;
  } catch (error) {
    console.log(error,'error');
  }
}

export const callDeleteDataFunction = (payload:any) => async () => {
  try {
    const { data } = await api.post('skype/deleteCommonApiCall',payload);
    return data;
  } catch (error) {
    console.log(error,'error');
  }
}

export const handleWebSocketEventCall = (data:any) => async (dispatch:any,getState:any) => {
  handleWebSocketEvent(dispatch,getState(),data);
}
export const actionToHandleCallSocketEventCall = (data:any) => async (dispatch:any,getState:any) => {
  handleCallSocketEvent(dispatch,getState(),data);
}

export const actionToAddNewUserDataLocally = (payload:any) => async (dispatch:any,getState:any) => {
  let allUsersDataArray = getState().allUsersDataArray;
  let userInfo = getState().userSignin.userInfo;
  let foundIndex = null;
  allUsersDataArray?.map((user:any,key:any)=>{
    if(user.id == payload.id){
      foundIndex = key;
    }
  })
  if(foundIndex != null){
    allUsersDataArray[foundIndex] = payload;
  }else{
    allUsersDataArray.push(payload);
  }
  dispatch({type: ALL_USER_DATA_SUCCESS, payload:[...allUsersDataArray]});
  if(userInfo?.id == payload?.id){
    dispatch({ type: USER_SIGNIN_SUCCESS, payload: cloneDeep(payload)});
    localStorage.setItem('userInfo',JSON.stringify(payload));
  }
}

export const actionToAddNewUserData = (payload:any) => async (dispatch:any) => {
  if(!payload?.isAdmin) {
  dispatch(actionToAddNewUserDataLocally(payload));
    sendWebsocketRequest(JSON.stringify({
      clientId:localStorage.getItem('clientId'),
      data:payload,
      type: "addNewMemberInApp"
    }));
  }
  let aliasArray = ['?','?','?','?','?','?','?'];
  let columnArray = ['id','name','email','password','description','created_by','isAdmin'];
  let valuesArray = [payload.id,payload.name,payload.email,payload.password,payload.description,payload.created_by,payload.isAdmin];
  let insertData = {alias:aliasArray,column:columnArray,values:valuesArray,tableName:'app_user'};
  dispatch(callInsertDataFunction(insertData));
}

export const actionToUploadImageProfileData = (formData:any,payload:any) => async (dispatch:any) => {
  try {
    const res = await api.post(`upload`,
        formData
    );
    if(res?.data?.name) {
      let fileName = res?.data?.name;
      payload.avatar = fileName;
      dispatch(actionToAddNewUserDataLocally(payload));
      sendWebsocketRequest(JSON.stringify({
        clientId: localStorage.getItem('clientId'),
        data: payload,
        type: "addNewMemberInApp"
      }));
      const setData = `avatar=?`;
      const whereCondition = `id = '${payload.id}'`;
      const value = [fileName];
      const dataToSend = {column: setData, value, whereCondition, tableName: 'app_user'};
      dispatch(commonUpdateFunction(dataToSend));
    }
  } catch (ex) {
    console.log(ex);
  }
}
export const actionToEditNewUserData = (payload:any) => async (dispatch:any) => {
  dispatch(actionToAddNewUserDataLocally(payload));
  sendWebsocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    data:payload,
    type: "addNewMemberInApp"
  }));
  const setData = `name=?,email=?,description=?`;
  const whereCondition = `id = '${payload.id}'`;
  const value = [payload.name,payload.email,payload.description];
  const dataToSend = {column: setData, value, whereCondition, tableName: 'app_user'};
  dispatch(commonUpdateFunction(dataToSend));
}

export const actionToChangeUserPassword = (payload:any) => (dispatch:any,getState:any) => {
  let {oldPassword,newPassword} = payload;
  let userInfo = getState().userSignin.userInfo;

  let passwordData = {
    password:oldPassword,
    id:userInfo.id
  }

  return api.post(`skype/checkPassword`,passwordData).then(response=>{
    let userData = response.data;
    if(userData.success == 1){
      console.log('userData',userData);
      const setData = `password=?`;
      const whereCondition = `id = '${userInfo.id}'`;
      const value = [newPassword];
      const dataToSend = {column: setData, value, whereCondition, tableName: 'app_user'};
      dispatch(commonUpdateFunction(dataToSend));
      return {success:1};
    }else{
      console.log('userData',userData);
      return {success:0};
    }
  })
}

export const actionToDeleteUserDataLocally = (id:any) => async (dispatch:any,getState:any) => {
  let allUsersDataArray = getState().allUsersDataArray;
  let userInfo = getState().userSignin.userInfo;
  allUsersDataArray?.map((user:any,key:any)=>{
    if(user.id == id){
      allUsersDataArray.splice(key,1);
    }
  })
  if(userInfo.id == id){
    dispatch({ type: USER_SIGNIN_SUCCESS, payload: {}});
    localStorage.removeItem('userInfo');
    document.location.href = '/';
  }
}
export const actionToDeleteUserData = (id:any) => async (dispatch:any) => {
  dispatch(actionToDeleteUserDataLocally(id));
  sendWebsocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    data:id,
    type: "deleteMemberInApp"
  }));
  dispatch(callDeleteDataFunction({ condition: `id = '${id}' `, tableName: 'app_user' }));
}

export const actionToKickOutUserFromCall = (userId:any,adminId:any) => async (dispatch:any,getState:any) => {
  let currentRoomData = getState().currentRoomData;
  let allUsersInCall = getState().allUsersInCall;

  currentRoomData?.members?.map((member:any,key:any)=>{
    if(userId === member.id){
      currentRoomData?.members?.splice(key,1);
    }
  })
  dispatch(actionToChangeRoomDataLocally(currentRoomData));
  dispatch(actionToSetNewLeaveUserInCallData(userId));

  allUsersInCall.splice(allUsersInCall.indexOf(userId),1);

  dispatch({type: ALL_USERS_IN_CALL, payload:[...allUsersInCall]});

  sendCallSocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    adminId:adminId,
    userId:userId,
    type: "kickOutFromCurrentRunningCall"
  }));
}
export const actionToLeaveCallAndExitFromRoom = (userId:any,adminId:any) => async (dispatch:any,getState:any) => {

  let currentRoomData = getState().currentRoomData;
  currentRoomData?.members?.map((member:any,key:any)=>{
    if(userId === member.id){
      currentRoomData?.members?.splice(key,1);
    }
  })
  dispatch(actionToChangeRoomDataLocally(currentRoomData));

  sendCallSocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    adminId:adminId,
    userId:userId,
    type: "leaveCurrentRunningCall"
  }));
}
export const actionToEndCallAndRemoveRoom = (adminId:any) => async (dispatch:any) => {
  dispatch(actionToUpdateCallLogData());
  sendCallSocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    adminId:adminId,
    members:[],
    type: "removeCurrentRoomAndEndCall"
  }));
}
export const actionToSetNewJoinRoomData = (room:any) => async (dispatch:any) => {
  dispatch({type: NEW_JOIN_ROOM_DATA, payload:room});
}

export const actionToSetRoomParticipantArray = (payload:any) => async (dispatch:any) => {
  dispatch({type: ALL_ROOM_MEETING_PARTICIPANT_DATA, payload:cloneDeep(payload)});
}

export const actionToChangeMyCurrentAudio = (audio:any,userId:any) => async (dispatch:any) => {
  dispatch({type: MY_CURRENT_AUDIO_CHANGE, payload:audio});
  dispatch(actionToMuteUnmuteUserCall([userId],audio,userId));
}

export const actionToMuteUnmuteUserCall = (users:any,audio:any,adminId:any) => async (dispatch:any) => {
  dispatch(actionToMuteUnmuteUserCallLocally({users,audio}));
  sendCallSocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    users:users,
    audio:audio,
    adminId:adminId,
    type: "handleMuteUnmuteInCall"
  }));
}
export const actionToMuteUnmuteUserCallLocally = (payload:any) => async (dispatch:any) => {
  payload?.users?.map((id:any)=>{
     let audio:any = document.getElementById(`AUDIO-${id}`);
     if(audio != null && audio) {
       audio.muted = payload?.audio === 'MUTE';
     }
  })
}
export const actionToSetNewLeaveUserInCallData = (id:any) => async (dispatch:any) => {
  dispatch({type: NEW_LEAVE_USER_IN_CALL_DATA, payload:id});
}
export const actionToJoinNewUserInCurrentCall = (payload:any) => async (dispatch:any) => {
  dispatch({type: NEW_ADDED_USER_IN_CALL_DATA, payload:cloneDeep(payload)});
}

export const actionToSetCallBroadcastMessage = (message:any) => async (dispatch:any) => {
  dispatch({type: CALL_SOCKET_MESSAGE_BROADCAST, payload:''});
  dispatch({type: CALL_SOCKET_MESSAGE_BROADCAST, payload:message});
}

export const actionToAddInRoom = (roomId:any,member:any) => async (dispatch:any,getState:any) => {
  let currentRoomData = getState().currentRoomData;
  let userInfo = getState().userSignin.userInfo;
  let adminId = null;
  if(userInfo?.isAdmin){
    adminId = userInfo.id;
  }else{
    adminId = userInfo.created_by;
  }

  if(currentRoomData?.members != undefined){
    currentRoomData?.members.push(member);
  }else{
    currentRoomData.members = [member];
  }
  currentRoomData.created_at = new Date().toISOString();
  dispatch({type: CURRENT_ROOM_DETAILS, payload:cloneDeep(currentRoomData)});

  sendCallSocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    roomId:roomId,
    adminId:adminId,
    member:member,
    type: "newMemberAddedToCurrentRoom"
  }));
}
export const actionToChangeRoomDataLocally = (payload:any) => async (dispatch:any,getState:any) => {
  dispatch({type: CURRENT_ROOM_DETAILS, payload:cloneDeep(payload)});
}

export const actionToCreateRoom = (members:any,roomId:any,adminId:any) => async (dispatch:any,getState:any) => {
  dispatch(actionToChangeRoomDataLocally({roomId,members:[]}));
  dispatch({type: ALL_USERS_IN_CALL, payload:cloneDeep(members)});

  sendCallSocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    roomId:roomId,
    adminId:adminId,
    members:members,
    type: "addedNewRoomToJoinSocketCallCustomApiCall"
  }));

  let createdAt = new Date().toISOString();
  let aliasArray = ['?', '?','?'];
  let columnArray = ['id', 'created_at','created_by'];
  let valuesArray = [roomId,createdAt ,adminId];
  let insertData = {alias: aliasArray, column: columnArray, values: valuesArray, tableName: 'call_log'};
  dispatch(callInsertDataFunction(insertData));
  let allCallLogData = getState().allCallLogData;
  allCallLogData.push({id:roomId,created_at:createdAt});
  dispatch({type: ALL_CALL_LOG_DATA,payload:allCallLogData});
}
export const actionToUpdateCallLogData = () => async (dispatch:any,getState:any) => {
  const currentRoomData = getState().currentRoomData;
  const allUsersInCall = currentRoomData.members;

  if(currentRoomData?.roomId){
    const currentCallSpeechToText  = getState().currentCallSpeechToText;
    allUsersInCall.unshift(getState()?.userSignin?.userInfo?.id);

    const setData = `members=?,end_time=?,call_text=?`;
    const whereCondition = `id = '${currentRoomData?.roomId}'`;
    const endTime = new Date().toISOString();
    const value = [JSON.stringify(allUsersInCall),endTime,JSON.stringify(currentCallSpeechToText)];
    const dataToSend = {column: setData, value, whereCondition, tableName: 'call_log'};
    //// Checking room id
    let allCallLogData = getState().allCallLogData;
    let foundIndex = null;
    allCallLogData.map((callLog:any,key:any)=>{
      if(callLog.id == currentRoomData?.roomId){
        foundIndex = key;
      }
    })
    if(foundIndex != null){
      allCallLogData[foundIndex].members = JSON.stringify(allUsersInCall);
      allCallLogData[foundIndex].end_time = endTime;
      allCallLogData[foundIndex].call_text = JSON.stringify(currentCallSpeechToText);
    }
    dispatch({type: ALL_CALL_LOG_DATA,payload:[...allCallLogData]});
    dispatch(commonUpdateFunction(dataToSend));
  }
}
export const actionToAddActiveSpeakingUser = (member:any) => async (dispatch:any) => {
  dispatch({type: ACTIVE_SPEAKING_USER_DATA, payload:cloneDeep(member)});
}
export const addedNewUserInRoomByUser = (members:any,adminId:any) => async (dispatch:any,getState:any) => {
  let allUsersInCall = getState().allUsersInCall;
  let allNewUsers = [...allUsersInCall,...members]
  dispatch({type: ALL_USERS_IN_CALL, payload:cloneDeep(allNewUsers)});

  sendCallSocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    members:allNewUsers,
    adminId:adminId,
    type: "addedNewUserInCurrentMeeting"
  }));
}
export const actionToRemoveUserFromRoom = (id:any) => async (dispatch:any,getState:any) => {
  let allUsersInCall = getState().allUsersInCall;
  let foundIndex = null;
  allUsersInCall?.map((userInCall:any,key:any)=>{
     if(userInCall.id == id){
       foundIndex = key;
     }
  })
  if(foundIndex != null){
    allUsersInCall.splice(foundIndex,1);
  }
  let allNewUsers = [...allUsersInCall]
  dispatch({type: ALL_USERS_IN_CALL, payload:cloneDeep(allNewUsers)});

  sendWebsocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    id:id,
    adminId:getState().userSignin.userInfo.id,
    type: "actionToRemoveUserFromRoom"
  }));
}

