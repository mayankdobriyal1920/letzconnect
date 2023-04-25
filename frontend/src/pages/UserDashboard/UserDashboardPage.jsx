import {useEffect, useState} from 'react';
import { IonContent, IonPage} from '@ionic/react';
import { useSelector,useDispatch } from 'react-redux';
import {INCALL, useCallState} from "../../CallProvider";
import Peer from 'peerjs';
import { useHistory } from "react-router-dom";
import Header from '../../components/Header/Header';
import InCall from '../../components/InCall';
import {
  actionToAddInRoom,
  actionToGetAllUserData,
  actionToGetCurrentRoomData, actionToLeaveCallAndExitFromRoom
} from '../../actions/UserAction';
import {addAudioStream, removeClosePeerConnection} from "../../helpers/common";
import {currentRoomDataReducer} from "../../reducers/UserReducers";

let myPeer = null;
let myStream = null;
// const iceServers= [
//   {
//     urls: "stun:openrelay.metered.ca:80",
//   },
//   {
//     urls: "turn:openrelay.metered.ca:80",
//     username: "openrelayproject",
//     credential: "openrelayproject",
//   },
//   {
//     urls: "turn:openrelay.metered.ca:443",
//     username: "openrelayproject",
//     credential: "openrelayproject",
//   },
//   {
//     urls: "turn:openrelay.metered.ca:443?transport=tcp",
//     username: "openrelayproject",
//     credential: "openrelayproject",
//   },
// ];
const iceServers= [
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];
const UserDashboardPage = () => {
  let history = useHistory();
  const userData = useSelector((state) => state.userSignin.userInfo);
  const {roomId,members} = useSelector((state) => state.currentRoomData);
  const callSocketMessageBroadcast = useSelector((state) => state.callSocketMessageBroadcast);
  const {view,handleToSetViewInCall,handleParticipantArrayUpdated} = useCallState();
  const newLeaveUserInCallData = useSelector((state) => state.newLeaveUserInCallData);

  const dispatch = useDispatch();
  const [callLoading,setCallLoading] = useState(false);

  const joinThisExsestingMeeting = (roomId)=>{
      if(callLoading) return;
      if(roomId){
        setCallLoading(true);
          const userId = userData.id;
          const peerConnectionId = userId+'~peer'+(Math.random() + 1).toString(36).substring(7);
          myPeer = new Peer(peerConnectionId, {
            host: 'letscall.co.in',
            secure:true,
            config: {'iceServers': iceServers},
            path:'/peerApp',
          });

          myPeer?.on('open', id => {
            console.log('[PEER CONNECTION OPEN IN ID]',id);
            var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
            getUserMedia({video: false, audio: true}, function(stream) {
              myStream = stream;

              myPeer.on('call', call => {
                console.log('[PEER JS INCOMMING CALL]',call);
                call.answer(stream);
                const audio = document.createElement('audio');
                call.on('stream', userAudio => {
                  console.log('[PEER JS INCOMMING CALL STREM]',call);
                  members?.map((user)=>{
                    if(user?.id == call?.peer && !user.audio){
                      audio.muted = true;
                    }
                  })
                  audio.id = `AUDIO-${call.peer}`;
                  addAudioStream(audio, userAudio)
                })
                call.on('close', () => {
                  audio.remove()
                })
              })


              let memberData = userData;
              memberData.audio = false;
              dispatch(actionToAddInRoom(roomId,memberData));
              handleParticipantArrayUpdated(members);
              handleToSetViewInCall();
              setCallLoading(false);
            })
          })

      }else{
        alert('Meeting not found please ask your host to start a meeting');
      }
  }

  const userProfilePage = () =>{
    history.push('/app/user-profile');
  }
  const userSettingPage = () =>{
    history.push('/app/user-setting');
  }

  const endMyStreamTrackOnEndCall = ()=>{
    if(myStream != null) {
      myStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    if(myPeer != null){
      myPeer.disconnect();
    }
    document.getElementById('userAudioSectionId').innerHTML = '';
  }


  const callFunctionToleaveCall = () =>{
    dispatch(actionToLeaveCallAndExitFromRoom(userData.id,userData.created_by));
    endMyStreamTrackOnEndCall();
  }


  useEffect(()=>{
    dispatch(actionToGetAllUserData(userData.created_by));
    dispatch(actionToGetCurrentRoomData(userData.created_by));
    window.addEventListener('beforeunload', () => {
      callFunctionToleaveCall();
    });
  },[]);

  useEffect(()=>{
    if(callSocketMessageBroadcast === 'end-of-current-call'){
      endMyStreamTrackOnEndCall();
    }
  },[callSocketMessageBroadcast]);

  useEffect(()=>{
    if(newLeaveUserInCallData){
      removeClosePeerConnection(newLeaveUserInCallData);
    }
  },[newLeaveUserInCallData]);

  return (
    <IonPage>
        <Header title={userData.name} avatar={userData.avatar}/>
        <IonContent fullscreen>
          <div className="chat-list-col">
            {(view === INCALL) ?
                <InCall myPeer={myPeer} myStream={myStream}/>
                :
                <div className="container admin_dashboard_container">
                  <div className="main-admin-screen">
                    <ul>
                      {(roomId != null) ?
                          <li className="main-admin-screen-item col-12">
                            <a onClick={()=>joinThisExsestingMeeting(roomId)}>
                              <i className="fas fa-users"></i>
                              {callLoading ? ' Joining Conference...' : ' Join Conference'}

                            </a>
                          </li>
                          :''}
                      <li onClick={userProfilePage} className="main-admin-screen-item col-12">
                        <a>
                          <i className="fas fa-user"></i> Profile
                        </a>
                      </li>
                      <li onClick={userSettingPage} className="main-admin-screen-item col-12">
                        <a>
                          <i className="fas fa-cogs"></i> Change Password
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
            }
          </div>
          <div id={"userAudioSectionId"}/>
        </IonContent>
      </IonPage>
  );
};
export default UserDashboardPage;


