import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import {
  activeSpeakingUserDataReducer,
  allCallLogDataReducer,
  allRoomMeetingParticipantArrayReducer,
  allUsersDataArrayReducer,
  allUsersInCallReducer, callSocketMessageBroadcastReducer, currentCallSpeechToTextReducer,
  currentRoomDataReducer, myCurrentAudioChangeReducer, newAddedUserInCurrentCallReducer,
  newJoinRoomDataReducer, newLeaveUserInCallDataReducer,
  newMeetingCallFrameReducer,
  roomMeetingViewNameReducer,
  userSigninReducer
} from './reducers/UserReducers';

const initialState = {
  userSignin: {
    userInfo: localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo') || `{}`)
      : null,
  },
  newJoinRoomData:null,
  allUsersDataArray:[],
  newMeetingCallFrame:'',  
  roomMeetingViewName:'PREJOIN',   
  allRoomMeetingParticipantArray:[],
  allUsersInCall:[],
  allCallLogData:[],
  currentCallSpeechToText:[],
  activeSpeakingUserData:{},

  //// temp
  currentRoomData:{roomId:null,members:[]},
  callSocketMessageBroadcast:'',
  myCurrentAudioChange:'MUTE',
  newAddedUserInCurrentCall:null,
  newLeaveUserInCallData:null
  //// temp
};
export const rootReducer = combineReducers({
  //// temp
  newLeaveUserInCallData:newLeaveUserInCallDataReducer,
  myCurrentAudioChange:myCurrentAudioChangeReducer,
  callSocketMessageBroadcast: callSocketMessageBroadcastReducer,
  currentRoomData: currentRoomDataReducer,
  newAddedUserInCurrentCall:newAddedUserInCurrentCallReducer,
  //// temp

  currentCallSpeechToText: currentCallSpeechToTextReducer,
  allCallLogData: allCallLogDataReducer,
  allUsersInCall: allUsersInCallReducer,
  userSignin: userSigninReducer,
  allUsersDataArray: allUsersDataArrayReducer,
  newJoinRoomData:newJoinRoomDataReducer,
  newMeetingCallFrame:newMeetingCallFrameReducer,
  roomMeetingViewName:roomMeetingViewNameReducer,
  allRoomMeetingParticipantArray:allRoomMeetingParticipantArrayReducer,
  activeSpeakingUserData:activeSpeakingUserDataReducer,
});

declare global {
    interface Window {
      __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}
const composeEnhancer =  window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose || compose;
const store = createStore(
  rootReducer,
  initialState,
  composeEnhancer(applyMiddleware(thunk))
);
export type RootState = ReturnType<typeof rootReducer>
export default store;
