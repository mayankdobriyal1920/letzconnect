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
  ALL_ADMIN_DATA_SUCCESS
} from '../constants/UserConstants';
import {handleWebSocketEvent, sendWebsocketRequest} from './helpers/WebSocketHelper';
const BASE_URL = "https://api.daily.co/v1/";
// const API_AUTH = `7d402e4f56c2bee45e98ca0b5b03a3c9ac6833b1ba2ff01d12239242f04ec95e`;
const API_AUTH = `56d0b880a94b88923bc14e3f49a65bba65b36184e5a31377f7e0f1b4912656ba`;

const api = Axios.create({
 baseURL: `https://letzconnects.com/api/`
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
          document.location.href = '/app/';
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
export const actionToGetAllAdminUsers = (id:any) => async (dispatch:any) => {
  try {
    api.get(`skype/admin-users/${id}`).then(response=>{

      let adminUserData = response.data.userData;
      let allFinalArray:any = [];
      if(adminUserData?.length){
        adminUserData?.map((adminUser:any)=>{
          if(adminUser.all_members !== null){
            adminUser.all_members = JSON.parse(adminUser.all_members);
          }else{
            adminUser.all_members = [];
          }
          allFinalArray?.push(adminUser);
        })
      }
  
      dispatch({
        type: ALL_ADMIN_DATA_SUCCESS,
        payload:allFinalArray,
      });
    })
  } catch (error:any) {
    console.log(error);
  }
}
export const actionToStoreCurrentCallSpeechToTextDataAddLocally = (payload:any) => async (dispatch:any,getState:any) => {
  const currentCallSpeechToText = getState().currentCallSpeechToText;
  const allUsersDataArray = getState().allUsersDataArray;

  let found = false;
  allUsersDataArray.map((user:any)=>{
    if(user?.id == payload?.userInfo?.id){
      found = true;
    }
  })

  if(found) {
    if (currentCallSpeechToText.length) {
      let lastData = currentCallSpeechToText[currentCallSpeechToText.length - 1];
      if (lastData.userInfo.id == payload.userInfo.id) {
        currentCallSpeechToText[currentCallSpeechToText.length - 1].text = payload.text;
      } else {
        currentCallSpeechToText.push({userInfo: payload.userInfo, text: payload.text});
      }
    } else {
      currentCallSpeechToText.push({userInfo: payload.userInfo, text: payload.text});
    }
    dispatch({
      type: CURRENT_CALL_SPEECH_TO_TEXT,
      payload: [...currentCallSpeechToText],
    });
  }
}
// export const actionToStoreCurrentCallSpeechToTextData = (text:any) => async (dispatch:any,getState:any) => {
//   const userInfo = getState().userSignin.userInfo;
//   let payload = {userInfo:userInfo,text:text};
//   sendWebsocketRequest(JSON.stringify({
//     clientId:localStorage.getItem('clientId'),
//     data:payload,
//     type: "addSpeechToTextNewData"
//   }));
//   dispatch(actionToStoreCurrentCallSpeechToTextDataAddLocally(payload));
// }
export const actionToGetAllCallLogData = () => async (dispatch:any,getState:any) => {
  const {userInfo} = getState().userSignin;
  try {
    api.get(`skype/calllog/${userInfo.id}`).then(response=>{

      dispatch({
        type: ALL_CALL_LOG_DATA,
        payload:response.data.callLogData,
      });
    })
  } catch (error:any) {
    console.log(error);
  }
}
export const actionToGetCurrentRoomData = () => async (dispatch:any,getState:any) => {
  const {userInfo} = getState().userSignin;
  try {
    api.get(`skype/room/${userInfo.created_by}`).then(response=>{
      let roomData = response.data.roomData;
      if(roomData && roomData != undefined && Object?.keys(roomData)?.length){
        if(roomData.members.includes(userInfo.id)){
          dispatch(actionToSetNewJoinRoomData(response.data.roomData.data));
        }
      }
    })
  } catch (error:any) {
    console.log(error);
  }
}


export const signout = () => (dispatch:any) => {
  document.location.href = '/app/';
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

export const actionToAddNewAdminUserDataLocally = (payload:any) => async (dispatch:any,getState:any) => {
  let allAdminUsersDataArray = getState().allAdminUsersDataArray;
  if(allAdminUsersDataArray?.length) {
    allAdminUsersDataArray.push(payload);
    dispatch({type: ALL_ADMIN_DATA_SUCCESS, payload:[...allAdminUsersDataArray]});
  }
}
export const actionToAddNewUserDataLocally = (payload:any) => async (dispatch:any,getState:any) => {
  let allUsersDataArray = getState().allUsersDataArray;
  let activeSpeakingUserData = getState().activeSpeakingUserData;
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
  if(userInfo.id == payload.id){
    dispatch({ type: USER_SIGNIN_SUCCESS, payload: cloneDeep(payload)});
    localStorage.setItem('userInfo',JSON.stringify(payload));
  }
  if(activeSpeakingUserData.id == payload.id){
    dispatch(actionToAddActiveSpeakingUser(payload));
  }
}
export const actionToAddNewUserData = (payload:any) => async (dispatch:any) => {
  if(!payload?.isAdmin) {
    dispatch(actionToAddNewUserDataLocally(payload));
    sendWebsocketRequest(JSON.stringify({
      clientId: localStorage.getItem('clientId'),
      data: payload,
      type: "addNewMemberInApp"
    }));
  }else{
    dispatch(actionToAddNewAdminUserDataLocally(payload));
    sendWebsocketRequest(JSON.stringify({
      clientId: localStorage.getItem('clientId'),
      data: payload,
      type: "addNewAdminMemberInApp"
    }));
  }
  let aliasArray = ['?','?','?','?','?','?','?','?'];
  let columnArray = ['id','name','email','password','description','created_by','isAdmin','isSuperAdmin'];
  let valuesArray = [payload.id,payload.name,payload.email,payload.password,payload.description,payload.created_by,payload.isAdmin,payload?.isSuperAdmin];
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
  let setData = `name=?,email=?,description=?,is_active=?`;
  let value = [payload.name,payload.email,payload.description,payload.is_active];
  if(payload?.password?.trim()?.length) {
    setData = `name=?,email=?,description=?,is_active=?,password=?`;
    value = [payload.name, payload.email, payload.description, payload.is_active,payload.password];
  }
  const whereCondition = `id = '${payload.id}'`;
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
    document.location.href = '/app/';
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

export const actionToSetNewJoinRoomData = (room:any) => async (dispatch:any) => {
  dispatch({type: NEW_JOIN_ROOM_DATA, payload:room});
}

export const actionToSetRoomParticipantArray = (payload:any) => async (dispatch:any) => {
  dispatch({type: ALL_ROOM_MEETING_PARTICIPANT_DATA, payload:cloneDeep(payload)});
}
export const actionToCreateRoom = (members:any) => async (dispatch:any,getState:any) => {
  let res:any = {};
  let userInfo = getState().userSignin.userInfo;
  try {
  const api = Axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: { Authorization: `Bearer ${API_AUTH}` },
  });
  const roomBody = JSON.stringify({
    properties: {
      // expire in 10 minutes 
      // exp: Math.round(Date.now() / 1000) + 10 * 60,
      // eject_at_room_exp: true,
      signaling_impl: "ws",
    },
  });
  const room = await api.request({
    url: '/rooms',
    method: 'post',
    data: roomBody,
  });

  res = room.data;
  const tokenBody = JSON.stringify({
    properties: {
      // expire in 10 minutes
      //exp: Math.round(Date.now() / 1000) + 10 * 60,
      room_name: room.data.name,
      is_owner: true,
    },
  });

  const token = await api.request({
    url: '/meeting-tokens',
    method: 'post',
    data: tokenBody,
  });
  res = { token: token.data.token, ...res };

  dispatch({type: ALL_USERS_IN_CALL, payload:cloneDeep(members)});
  dispatch(actionToSetNewJoinRoomData(res))
  sendWebsocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    data:res,
    adminId:userInfo.id,
    members:members,
    type: "addedNewRoomToJoinSocketCall"
  }));

  if(res?.id != undefined && res?.created_at != undefined) {
    let aliasArray = ['?', '?','?'];
    let columnArray = ['id', 'created_at','created_by'];
    let valuesArray = [res.id, res.created_at,userInfo.id];
    let insertData = {alias: aliasArray, column: columnArray, values: valuesArray, tableName: 'call_log'};
    dispatch(callInsertDataFunction(insertData));
    let allCallLogData = getState().allCallLogData;
    allCallLogData.push({id:res.id,created_at:res.created_at});
    dispatch({type: ALL_CALL_LOG_DATA,payload:allCallLogData});
  }
  return res;
  }catch (e) {
      console.log("error: ", e);
      return false;
  }
}
export const actionToUpdateCallLogData = () => async (dispatch:any,getState:any) => {
  const allUsersInCall = getState().allUsersInCall;
  const newJoinRoomData  = getState().newJoinRoomData;
  if(newJoinRoomData != null && newJoinRoomData != undefined){
  const currentCallSpeechToText  = getState().currentCallSpeechToText;
  allUsersInCall.unshift(getState()?.userSignin?.userInfo?.id);
  const setData = `members=?,end_time=?,call_text=?`;
  const whereCondition = `id = '${newJoinRoomData.id}'`;
  const endTime = new Date().toISOString();
  const value = [JSON.stringify(allUsersInCall),endTime,JSON.stringify(currentCallSpeechToText)];
  const dataToSend = {column: setData, value, whereCondition, tableName: 'call_log'};


  //// Checking room id
  let allCallLogData = getState().allCallLogData;
  let foundIndex = null;
  allCallLogData.map((callLog:any,key:any)=>{
    if(callLog.id == newJoinRoomData.id){
      foundIndex = key;
    }
  })
  if(foundIndex != null){
    allCallLogData[foundIndex].members = JSON.stringify(allUsersInCall);
    allCallLogData[foundIndex].end_time = endTime;
    allCallLogData[foundIndex].call_text = JSON.stringify(currentCallSpeechToText);
  }
  dispatch({type: ALL_CALL_LOG_DATA,payload:[...allCallLogData]});


  sendWebsocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    data:null,
    adminId:getState().userSignin.userInfo.id,
    type: "removeRoomToJoinSocketCall"
  }));
  dispatch(commonUpdateFunction(dataToSend));
}
}
export const actionToAddActiveSpeakingUser = (member:any) => async (dispatch:any) => {
  dispatch({type: ACTIVE_SPEAKING_USER_DATA, payload:cloneDeep(member)});
}
export const addedNewUserInRoomByUser = (members:any) => async (dispatch:any,getState:any) => {
  let allUsersInCall = getState().allUsersInCall;
  let allNewUsers = [...allUsersInCall,members]
  dispatch({type: ALL_USERS_IN_CALL, payload:cloneDeep(allNewUsers)});

  sendWebsocketRequest(JSON.stringify({
    clientId:localStorage.getItem('clientId'),
    members:members,
    adminId:getState().userSignin.userInfo.id,
    type: "addedNewUsrInCurrentMeeting"
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

