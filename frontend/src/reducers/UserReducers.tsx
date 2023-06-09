import {
    ACTIVE_SPEAKING_USER_DATA,
    ALL_CALL_LOG_DATA,
    ALL_ROOM_MEETING_PARTICIPANT_DATA,
    ALL_USER_DATA_SUCCESS, ALL_USERS_IN_CALL, CURRENT_CALL_SPEECH_TO_TEXT,
    NEW_JOIN_ROOM_DATA,
    NEW_MEETING_CALL_FRAME,
    ROOM_MEETING_VIEW_NAME,
    USER_SIGNIN_FAIL,
    USER_SIGNIN_REQUEST,
    USER_SIGNIN_SUCCESS,
    USER_SIGNOUT,
    CURRENT_ROOM_DETAILS,
    CALL_SOCKET_MESSAGE_BROADCAST, MY_CURRENT_AUDIO_CHANGE, NEW_ADDED_USER_IN_CALL_DATA, NEW_LEAVE_USER_IN_CALL_DATA,
} from '../constants/UserConstants';
    
    export const userSigninReducer = (state = {}, action:any) => {
      switch (action.type) {
        case USER_SIGNIN_REQUEST:
          return { loading: true };
        case USER_SIGNIN_SUCCESS:
          return { loading: false, userInfo: action.payload };
        case USER_SIGNIN_FAIL:
          return { loading: false, error: action.payload };
        case USER_SIGNOUT:
          return { loading: false, userInfo: {}};
        default:
          return state;
      }
    };

    export const newJoinRoomDataReducer = (state = {}, action:any) => {
      switch (action.type) {
        case NEW_JOIN_ROOM_DATA:
          return action.payload;        
        default:
          return state;
      }
    };
    export const activeSpeakingUserDataReducer = (state = {}, action:any) => {
      switch (action.type) {
        case ACTIVE_SPEAKING_USER_DATA:
          return action.payload;
        default:
          return state;
      }
    };
    export const currentCallSpeechToTextReducer = (state = [], action:any) => {
      switch (action.type) {
        case CURRENT_CALL_SPEECH_TO_TEXT:
          return action.payload;
        default:
          return state;
      }
    };
    export const allUsersInCallReducer = (state = [], action:any) => {
      switch (action.type) {
        case ALL_USERS_IN_CALL:
          return action.payload;
        default:
          return state;
      }
    };
    export const allCallLogDataReducer = (state = [], action:any) => {
      switch (action.type) {
        case ALL_CALL_LOG_DATA:
          return action.payload;
        default:
          return state;
      }
    };
    export const newMeetingCallFrameReducer = (state = {}, action:any) => {
      switch (action.type) {
        case NEW_MEETING_CALL_FRAME:
          return action.payload;        
        default:
          return state;
      }
    };
    export const roomMeetingViewNameReducer = (state = {}, action:any) => {
      switch (action.type) {
        case ROOM_MEETING_VIEW_NAME:
          return action.payload;        
        default:
          return state;
      }
    };
    export const allRoomMeetingParticipantArrayReducer = (state = {}, action:any) => {
      switch (action.type) {
        case ALL_ROOM_MEETING_PARTICIPANT_DATA:
          return action.payload;        
        default:
          return state;
      }
    };

    export const allUsersDataArrayReducer = (state = {}, action:any) => {
      switch (action.type) {
        case ALL_USER_DATA_SUCCESS:
          return action.payload;        
        default:
          return state;
      }
    };




    ////  temp //////
    export const currentRoomDataReducer = (state = {}, action:any) => {
      switch (action.type) {
        case CURRENT_ROOM_DETAILS:
          return action.payload;        
        default:
          return state;
      }
    };

    export const callSocketMessageBroadcastReducer = (state = {}, action:any) => {
      switch (action.type) {
        case CALL_SOCKET_MESSAGE_BROADCAST:
          return action.payload;
        default:
          return state;
      }
    };
    export const myCurrentAudioChangeReducer = (state = {}, action:any) => {
        switch (action.type) {
            case MY_CURRENT_AUDIO_CHANGE:
                return action.payload;
            default:
                return state;
        }
    };
    export const newAddedUserInCurrentCallReducer = (state = {}, action:any) => {
        switch (action.type) {
            case NEW_ADDED_USER_IN_CALL_DATA:
                return action.payload;
            default:
                return state;
        }
    };
    export const newLeaveUserInCallDataReducer = (state = {}, action:any) => {
        switch (action.type) {
            case NEW_LEAVE_USER_IN_CALL_DATA:
                return action.payload;
            default:
                return state;
        }
    };
   ////  temp //////

    


    
    

   
    
    