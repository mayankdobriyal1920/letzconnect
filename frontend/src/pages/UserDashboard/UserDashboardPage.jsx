import {useEffect, useState} from 'react';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar,IonCard,IonCardContent,IonCardHeader
} from '@ionic/react';
import { useSelector,useDispatch } from 'react-redux';
import { CallProvider, INCALL, PREJOIN, useCallState } from "../../CallProvider";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { SPEAKER} from "../../App";
import Header from '../../components/Header/Header';
import InCall from '../../components/InCall';
import {actionToGetAllUserData, actionToGetCurrentRoomData, actionToUpdateCallLogData} from '../../actions/UserAction';
import {getWebsocketConnectedMessage, sendWebsocketRequest} from "../../actions/helpers/WebSocketHelper";
import {w3cwebsocket as W3CWebSocket} from "websocket";
import $ from "jquery";

const UserDashboardPage = () => {
  let history = useHistory();
  const { joinRoom } = useCallState();
  const { view } = useCallState();
  const { leaveCall } = useCallState();
  const userData = useSelector((state) => state.userSignin.userInfo);
  const newJoinRoomData = useSelector((state) => state.newJoinRoomData);
  const dispatch = useDispatch();
  const [callLoading,setCallLoading] = useState(false);
  const joinThisExsestingMeeting = (roomInfo)=>{
      if(callLoading) return;
      if(roomInfo && roomInfo != undefined){
          const userId = userData.id;
          setCallLoading(true);
          let userName = `${userId}_${SPEAKER}`;
          let name = roomInfo.name;
          joinRoom({ userName, name,setCallLoading });
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

   useEffect(() => {
       sendWebsocketRequest(JSON.stringify({
            clientId: localStorage.getItem('clientId'),
            data: userData,
            type: "setUserDataCurrentClient"
        }));
   }, [userData]);

   useEffect(() => {
       getWebsocketConnectedMessage(W3CWebSocket,dispatch,userData);
   }, []);

    useEffect(()=>{
        dispatch(actionToGetAllUserData(userData.created_by));
        dispatch(actionToGetCurrentRoomData());
        window.addEventListener("popstate", e => {
            leaveCall();
        });
    },[]);

    useEffect(()=>{
        const callDisconnectAlert = () =>{
            return "Leaving this page will disconnect this call?";
        }
        const callDisconnectFunction = () =>{
            leaveCall();
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
                    leaveCall();
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
    <IonPage>
      <Header title={userData.name} avatar={userData.avatar}/>
      <IonContent fullscreen>
          <div className="chat-list-col">
          {(view == INCALL) ?
          <InCall/>
          :
            <div className="container admin_dashboard_container">
                <div className="main-admin-screen">
                    <ul>
                        {(newJoinRoomData != null && Object.keys(newJoinRoomData).length) ?
                        <li className="main-admin-screen-item col-12">
                            <a onClick={()=>joinThisExsestingMeeting(newJoinRoomData)}>
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
      </IonContent>
    </IonPage>
  );
};

const NoMeetingDiv = styled.div`
width: 100%;
text-align: center;
font-size: 23px;
margin: 0px auto;
font-family: inherit;
padding-top: 30%;
`;
const MeetingRoomDiv = styled.div`
width: 100%;
text-align: center;
`;

const MeetingRoomDivSvg= styled.svg`
width: 100px;
`;

const MeetingTitleHeader= styled.div`
width: 100%;
border-bottom:1px solid #ccc;
height:50px;
`;

const MeetingFooterButton = styled.button`
    padding: 15px;
    background: #1e8d1e;
    color: #fff;
    font-size: 17px;
    border-radius: 6px;
    width: 100%;
    text-align: center;
`;
export default UserDashboardPage;


