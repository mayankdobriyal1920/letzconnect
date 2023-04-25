import {useState,useEffect,useCallback,useRef} from 'react';
import {IonCol, IonContent, IonItem, IonLabel, IonPage, IonRow, IonSelect, IonSelectOption} from '@ionic/react';
import Header from '../../components/Header/Header';
import Peer from 'peerjs';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";
import {
  actionToAddInRoom,
  actionToCreateRoom, actionToEndCallAndRemoveRoom,
  actionToGetAllCallLogData,
  actionToGetAllUserData,
  actionToGetLoginToken,
} from '../../actions/UserAction';
import loader from '../../theme/images/loader.gif';
import $ from 'jquery';
import {
  _getUniqueId,
  addAudioStream,
  getUserIdFromPeerConnection,
  removeClosePeerConnection
} from '../../helpers/common';
import InCall from "../../components/InCall";
import {INCALL, useCallState} from "../../CallProvider";

const selectedMemberId = [];
let myPeer = null;
let myStream = null;
const iceServers= [
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];


const AdminDashboardPage = () => {
  let history = useHistory();
  const dispatch = useDispatch();
  const {userInfo} = useSelector((state) => state.userSignin);
  const allUsersDataArray = useSelector((state) => state.allUsersDataArray);
  const newLeaveUserInCallData = useSelector((state) => state.newLeaveUserInCallData);

  const [requestToStartConCall,setRequestToStartConCall] = useState(false);
  const [callLoading,setCallLoading] = useState(false);


  const {handleToSetViewInCall,view} = useCallState();


  const submitForm = async (e) => {
      e.preventDefault();
      if (callLoading) return;
      console.log('[ SELECTED MEMBERS ID ]',selectedMemberId);

      if(selectedMemberId?.length){
        setCallLoading(true);
        const members = selectedMemberId;
        const roomId = _getUniqueId()+'-'+_getUniqueId()+'-'+_getUniqueId()+'-'+_getUniqueId()+'-'+_getUniqueId();
        dispatch(actionToCreateRoom(members,roomId,userInfo.id));
        const peerConnectionId = userInfo.id+'PEERjs'+(Math.random() + 1).toString(36).substring(7);
        myPeer = new Peer(peerConnectionId, {
          host: 'letscall.co.in',
          secure:true,
          config: {'iceServers': iceServers},
          path:'/peerApp',
        });


        myPeer?.on('open', id => {
          console.log('[PEER CONNECTION OPEN IN ID]',id);
          let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
          getUserMedia({video: false, audio: true}, function(stream) {
            myStream = stream;
            let memberData = userInfo;
            memberData.audio = true;
            dispatch(actionToAddInRoom(roomId,memberData));
            setCallLoading(false);
            setRequestToStartConCall(false);

              handleToSetViewInCall();

              myPeer.on('call', call => {
                console.log('[PEER JS INCOMMING CALL]',call);
                call.answer(stream);
                const audio = document.createElement('audio');
                call.on('stream', userAudio => {
                  audio.id = `AUDIO-${getUserIdFromPeerConnection(call.peer)}`;
                  members?.map((user)=>{
                    if(user?.id == getUserIdFromPeerConnection(call?.peer) && !user.audio){
                      audio.muted = true;
                    }
                  })
                  addAudioStream(audio, userAudio)
                })
                call.on('close', () => {
                  audio.remove()
                })
              })
          }, function(err) { 
            console.log('Failed to get local stream' ,err);
          });
        })
      }
    }


  const allUserPage = () =>{
    history.push('/app/user-list');
  }

  const startConfrenceCallPage = () =>{
    setRequestToStartConCall(true);
    selectedMemberId.splice(0,selectedMemberId.length);
  }

  const addUserPage = () =>{
    history.push('/app/add-user');
  }

  const goToThisPage = (page) =>{
    history.push(`/app/${page}`);
  }

  const allUsersSelectOptions = (allUsers) =>{
    let userOptions = [];
    allUsers?.map((user)=>{
      if(user.id !== userInfo.id) {
        userOptions.push(
            <div key={user.id} className={"row"}>
              <div className={"col-2"}>
                <div className={"select_user_input"}>
                  <input onChange={selectUserInStartCallIndividual} type={"checkbox"} value={user.id}/>
                </div>
              </div>
              <div className={"col-10"}>
                <div className={"user_select_name"}>
                  {user.name}
                </div>
              </div>
            </div>
        )
       }
    })
    return userOptions;
  }

  const selectUserInStartCall = (e)=>{
    if(e.target.checked){
      $('.select_user_input input').prop('checked', true);
      allUsersDataArray?.map((user)=>{
        if(!selectedMemberId.includes(user.id) && userInfo.id != user.id) {
          selectedMemberId.push(user.id);
        }
      })
    }else{
      $('.select_user_input input').prop('checked', false);
      selectedMemberId.splice(0,selectedMemberId.length);
    }
  }

  const selectUserInStartCallIndividual = (e)=>{
    if(e.target.checked){
      if(!selectedMemberId.includes(e.target.value)){
        selectedMemberId.push(e.target.value);
      }
    }else{
      if(selectedMemberId.includes(e.target.value)){
        selectedMemberId.splice(selectedMemberId.indexOf(e.target.value),1);
      }
    }
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


  const endCallFunction = () =>{
    //dispatch(actionToUpdateCallLogData());
    dispatch(actionToEndCallAndRemoveRoom(userInfo.id));
    endMyStreamTrackOnEndCall();
  }

  useEffect(()=>{
    dispatch(actionToGetAllUserData(userInfo.id));
    dispatch(actionToGetAllCallLogData(userInfo.id));
    window.addEventListener('beforeunload', () => {
      //dispatch(actionToUpdateCallLogData());
      endCallFunction();
    });
    //dispatch(actionToGetLoginToken(userInfo.id,userInfo.token));
  },[]);

  useEffect(()=>{
     if(newLeaveUserInCallData){
       removeClosePeerConnection(newLeaveUserInCallData);
     }
  },[newLeaveUserInCallData]);


  const allAdminUserPage = () =>{
    history.push('/app/admin-list');
  }

  return (
      <>
        {requestToStartConCall && (view !== INCALL) ?
            <div className="before_start_user_call_section">
              <div className="before_start_user_call_sectioninner_ctrl">
                {callLoading ?
                    <div className="before_start_user_call_sectioninner_ctrl_loader">
                      <img src={loader}/>
                    </div>
                    :
                    <>
                      <div className={"select_user_heading"}>
                        Select Member For Call
                      </div>
                      {(allUsersDataArray.length) ?
                          <div className={"user_select_section"}>
                            <div className={"select_user_input"}>
                              <div className={"row"}>
                                <div className={"col-2"}>
                                  <div className={"select_user_input"}>
                                    <input onChange={selectUserInStartCall} type={"checkbox"}/>
                                  </div>
                                </div>
                                <div className={"col-10"}>
                                  <div className={"user_select_name"}>
                                    Select All
                                  </div>
                                </div>
                              </div>
                            </div>
                            {allUsersSelectOptions(allUsersDataArray)}
                          </div>
                          : <div className={"no_user_found"}>No User Found Please add user to start call.</div>
                      }
                      <div className="before_start_user_button_footer">
                        <button onClick={()=>setRequestToStartConCall(false)} className="btn cancel_button">Cancel</button>
                        <button onClick={(e)=>submitForm(e)} className="btn start_button">Start</button>
                      </div>
                    </>
                }
              </div>
            </div>
            :''
        }
        <IonPage>
          <Header title={userInfo.name} avatar={userInfo.avatar} isAdmin={userInfo.isAdmin}/>
          <IonContent fullscreen>
            <div className="chat-list-col">
              {(view === INCALL) ?
                  <InCall myPeer={myPeer} myStream={myStream}/>
                  :
                  <div className="container admin_dashboard_container">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="main-admin-screen">
                          <ul>
                            <li onClick={startConfrenceCallPage} className="main-admin-screen-item col-12">
                              <a>
                                <i className="fas fa-phone-volume"></i> Start Con Call
                              </a>
                            </li>
                            <li onClick={addUserPage} className="main-admin-screen-item col-12">
                              <a>
                                <i className="fas fa-user"></i> Add User
                              </a>
                            </li>
                            <li onClick={()=>goToThisPage('call-log')} className="main-admin-screen-item col-12">
                              <a>
                                <i className="fas fa-phone-square-alt"></i> Call Log
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-lg-6 d-lg-block">
                        <div className="main-admin-screen">
                          <ul>
                            <li onClick={allUserPage} className="main-admin-screen-item col-12">
                              <a>
                                <i className="fas fa-users"></i> All Users
                              </a>
                            </li>
                            {(userInfo?.isSuperAdmin) ?
                                <li onClick={allAdminUserPage} className="main-admin-screen-item col-12">
                                  <a>
                                    <i className="fas fa-users"></i> All Admin Users
                                  </a>
                                </li>
                                : ''
                            }
                            <li onClick={()=>goToThisPage('user-setting')} className="main-admin-screen-item col-12">
                              <a>
                                <i className="fas fa-cogs"></i> Change Password
                              </a>
                            </li>
                            <li onClick={()=>goToThisPage('help-support')} className="main-admin-screen-item col-12">
                              <a>
                                <i className="fas fa-hands-helping"></i> Help / Support
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
              }
            </div>
            <div id={"userAudioSectionId"}/>
          </IonContent>
        </IonPage>
      </>
  );
};

export default AdminDashboardPage;


