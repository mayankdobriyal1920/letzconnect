import {useState,useEffect,useCallback,useRef} from 'react';
import {IonCol, IonContent, IonItem, IonLabel, IonPage, IonRow, IonSelect, IonSelectOption} from '@ionic/react';
import Header from '../../components/Header/Header';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";
import {
  actionToGetAllAdminUsers,
  actionToGetAllCallLogData,
  actionToGetAllUserData,
  actionToGetLoginToken,
  actionToUpdateCallLogData
} from '../../actions/UserAction';
import loader from '../../theme/images/loader.gif';
import { MOD , SPEAKER} from "../../App";
import { CallProvider, INCALL, PREJOIN, useCallState } from "../../CallProvider";
import InCall from '../../components/InCall';
import $ from 'jquery';
import {getWebsocketConnectedMessage, sendWebsocketRequest} from "../../actions/helpers/WebSocketHelper";
import {w3cwebsocket as W3CWebSocket} from "websocket";
const selectedMemberId = [];
window.callOnce = false;
const AdminDashboardPage = () => {
  let history = useHistory();
  const dispatch = useDispatch();
  const {userInfo} = useSelector((state) => state.userSignin);
  const allUsersDataArray = useSelector((state) => state.allUsersDataArray);
  const [requestToStartConCall,setRequestToStartConCall] = useState(false);
  const [callLoading,setCallLoading] = useState(false);
  const { joinRoom } = useCallState();
  const { view,endCall } = useCallState();


  const submitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (callLoading) return;
      if(selectedMemberId?.length){
        setCallLoading(true);
        const members = selectedMemberId;
        const userId = userInfo.id;
        let userName = `${userId}_${MOD}`;
        let name = '';
        joinRoom({ userName, name , members,setCallLoading,setRequestToStartConCall});
      }
    },[joinRoom,callLoading]
    );


  const allUserPage = () =>{
    history.push('/app/user-list');
  }
  const allAdminUserPage = () =>{
    history.push('/app/admin-list');
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
      if(user.id != userInfo.id) {
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
        if(!selectedMemberId.includes(user.id)) {
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

  useEffect(()=>{
    if(! window.callOnce) {
      window.callOnce = true;
      dispatch(actionToGetAllUserData(userInfo.id));
      dispatch(actionToGetAllAdminUsers(userInfo.id));
      dispatch(actionToGetAllCallLogData());
      window.addEventListener("popstate", e => {
        endCall();
        dispatch(actionToUpdateCallLogData());
      });
      dispatch(actionToGetLoginToken(userInfo.id, userInfo.token));
    }
  },[]);



  useEffect(() => {
    sendWebsocketRequest(JSON.stringify({
      clientId: localStorage.getItem('clientId'),
      data: userInfo,
      type: "setUserDataCurrentClient"
    }));
  }, [userInfo]);

  useEffect(() => {
    getWebsocketConnectedMessage(W3CWebSocket,dispatch,userInfo);
  }, []);

  useEffect(()=>{
    const callDisconnectAlert = () =>{
      return "Leaving this page will disconnect this call?";
    }
    const callDisconnectFunction = () =>{
      endCall();
      dispatch(actionToUpdateCallLogData());
    }
    if (view == INCALL) {
       $(window).bind("beforeunload",callDisconnectAlert);
       $(window).bind('unload', callDisconnectFunction);
    }else{
       $(window).unbind("beforeunload",callDisconnectAlert);
       $(window).unbind('unload', callDisconnectFunction);
    }
  },[view]);

  useEffect(() => {
    const unblock = history.block(() => {
      if (view == INCALL) {
        if(window.confirm("Are you want to disconnect this call?")){
          endCall();
          dispatch(actionToUpdateCallLogData());
          return true;
        }else{
          return false;
        }
      }
      return true;
    });
    return () => {
      unblock();
    };
  }, [history,view]);


  return (
    <>        
    {requestToStartConCall && (view != INCALL) ?
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
        {(view == INCALL) ?
          <InCall/>
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
      </IonContent>
    </IonPage>
    </>
  );
};

export default AdminDashboardPage;


