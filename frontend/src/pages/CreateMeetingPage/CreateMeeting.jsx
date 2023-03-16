import React,{useState,useEffect,useCallback} from 'react';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar,IonCard,IonCardContent,IonCardHeader
} from '@ionic/react';

import styled from "styled-components";
import { useDispatch,useSelector,RootStateOrAny } from 'react-redux';
import { v1 as uuid } from "uuid";
import './CreateMeeting.css';
import { actionToJoinRoom, actionToSetNewJoinRoomData, signout } from '../../actions/UserAction';
import { CallProvider, INCALL, PREJOIN, useCallState } from "../../CallProvider";
import { MOD , SPEAKER} from "../../App";
import InCall from '../../components/InCall.jsx';

const CreateMeeting = () => {
  const [submitting, setSubmitting] = useState(false);

  const { joinRoom, error } = useCallState();
  const { view } = useCallState();
  const userData = useSelector((state) => state.userSignin.userInfo);
  const roomMeetingViewName = useSelector((state) => state.roomMeetingViewName);
  const newJoinRoomData = useSelector((state) => state.newJoinRoomData);
  const newMeetingCallFrame = useSelector((state) => state.newMeetingCallFrame);

  const dispatch = useDispatch();
  const [meetingTitle,setMeetingTitle] = useState('');
  const [meetingSubject,setMeetingSubject] = useState('');


  const submitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (submitting) return;
      if (meetingTitle.trim().length && meetingSubject.trim().length){
        setSubmitting(true);
        let userName = `${userData.name?.trim()}_${MOD}`;
        let name = '';
        joinRoom({ userName, name });
        //dispatch(actionToJoinRoom({ meetingTitle,meetingSubject,userName, roomInfo }));
      }
      return false;
    },[meetingTitle, meetingSubject, joinRoom, submitting]
    );

    const joinThisExsestingMeeting = (roomInfo)=>{
      let userName = `${userData.name?.trim()}_${SPEAKER}`;
      let name = roomInfo.name;
     // dispatch(actionToJoinRoom({ userName, roomInfo }));
      joinRoom({ userName, name });
    }

    const signoutSession = ()=>{
      dispatch(signout());
    }

  //    /**
  //  * Update participants for any event that happens
  //  * to keep the local participants list up to date.
  //  * We grab the whole participant list to make sure everyone's
  //  * status is the most up-to-date.
  //  */
  // useEffect(() => {
  //   if (updateParticipants) {
  //     console.log("[UPDATING PARTICIPANT LIST]");
  //     const list = Object.values(callFrame?.participants() || {});
  //     setParticipants(list);
  //   }
  // }, [updateParticipants, callFrame]);

  useEffect(() => {
    if (!newMeetingCallFrame) return;
    console.log('newMeetingCallFrame');
    async function getRoom() {
      console.log("[GETTING ROOM DETAILS]");
      const room = await newMeetingCallFrame?.room();
      // const exp = room?.config?.exp;
      dispatch(actionToSetNewJoinRoomData(room));
      // if (exp) {
      //   setRoomExp(exp * 1000 || Date.now() + 1 * 60 * 1000);
      // }
    }
    getRoom();
  }, [newMeetingCallFrame]);
   
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {userData.isAdmin ? 
            'Create Meeting' : 
            'Join Meeting'
            } </IonTitle>
            <LogoutButton onClick={signoutSession}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384.971 384.971"><path d="M180.455 360.91H24.061V24.061h156.394c6.641 0 12.03-5.39 12.03-12.03a12.04 12.04 0 0 0-12.03-12.03H12.03C5.39.001 0 5.39 0 12.031V372.94c0 6.641 5.39 12.03 12.03 12.03h168.424c6.641 0 12.03-5.39 12.03-12.03s-5.389-12.03-12.029-12.03zm201.026-176.822l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011 0-4.704 4.74-4.704 12.439 0 17.179l62.558 63.46H96.279c-6.641 0-12.03 5.438-12.03 12.151s5.39 12.151 12.03 12.151h247.74l-62.558 63.46c-4.704 4.752-4.704 12.439 0 17.179 4.704 4.752 12.319 4.752 17.011 0l82.997-84.2c4.644-4.68 4.692-12.512.012-17.18z"/></svg>
            </LogoutButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {(view == INCALL) ?
          <InCall/>
        : (userData.isAdmin) ?
          <form className="ion-padding" onSubmit={(e)=>submitForm(e)}>
            <IonItem>
              <IonLabel position="floating">Meeting Title</IonLabel>
              <IonInput onIonChange={(e)=>setMeetingTitle(e.detail.value || '')} type="text"/>
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Meeting Subject</IonLabel>
              <IonInput onIonChange={(e)=>setMeetingSubject(e.detail.value || '')} type="text"/>
            </IonItem>
            {/* <IonItem>
              <IonLabel position="floating">Choose members</IonLabel>
              <IonInput type="text"/>
            </IonItem> */}
            <IonButton className="ion-margin-top" type="submit" expand="block">
              {submitting ? 'Creating Meeting...' : 'Create Meeting'}
              
            </IonButton>
          </form>
        :
          <>
          {newJoinRoomData ?
              <>
                <IonCard>
                  <IonCardHeader>
                    <MeetingTitleHeader>
                      <IonTitle>
                        New Meeting
                      </IonTitle>
                    </MeetingTitleHeader>
                  </IonCardHeader>
                  <IonCardContent>
                    <MeetingRoomDiv>
                      <MeetingRoomDivSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 297 297"><path d="M148.5 116.187c32.029 0 58.086-26.057 58.086-58.086S180.529.014 148.5.014 90.414 26.072 90.414 58.101s26.057 58.086 58.086 58.086zm-28.098-64.293a8.78 8.78 0 0 1 12.414 0l8.387 8.388L164.184 37.3a8.78 8.78 0 0 1 12.414 12.414L147.41 78.902c-1.714 1.713-3.96 2.571-6.207 2.571a8.75 8.75 0 0 1-6.207-2.571l-14.594-14.594a8.78 8.78 0 0 1 0-12.414zM34.165 84.869c18.839 0 34.166-15.327 34.166-34.166S53.004 16.537 34.165 16.537 0 31.864 0 50.703s15.326 34.166 34.165 34.166zM3.367 133.777v70.955c0 16.297 13.211 29.508 29.508 29.508h38.457v52.407a7.23 7.23 0 0 0 7.229 7.229h34.077a7.23 7.23 0 0 0 7.229-7.229v-75.595c0-13.757-11.152-24.908-24.908-24.908H64.964v-52.367c0-17.009-13.789-30.798-30.798-30.798S3.367 116.767 3.367 133.777zm259.468-48.908c18.839 0 34.165-15.327 34.165-34.166s-15.326-34.166-34.165-34.166-34.166 15.327-34.166 34.166 15.327 34.166 34.166 34.166zm-30.799 48.908v52.367h-29.994c-13.757 0-24.909 11.152-24.909 24.908v75.595a7.23 7.23 0 0 0 7.229 7.229h34.077a7.23 7.23 0 0 0 7.229-7.229V234.24h38.457c16.297 0 29.508-13.211 29.508-29.508v-70.955c0-17.009-13.789-30.798-30.798-30.798s-30.799 13.788-30.799 30.798zm-32.42 18.036a8.78 8.78 0 0 0 8.777-8.777 8.78 8.78 0 0 0-8.777-8.777H97.384a8.78 8.78 0 0 0-8.777 8.777 8.78 8.78 0 0 0 8.777 8.777h42.338v136.395a8.78 8.78 0 0 0 8.777 8.777 8.78 8.78 0 0 0 8.777-8.777V151.813h42.34z"/></MeetingRoomDivSvg>
                    </MeetingRoomDiv>
                    <MeetingFooterButton onClick={()=>joinThisExsestingMeeting(newJoinRoomData)}>Click To Join Meeting</MeetingFooterButton>
                  </IonCardContent>
                </IonCard>

              </>
            :
            <NoMeetingDiv>
              Meeting Room Is Empty
            </NoMeetingDiv>
          }
          </>
      }
      </IonContent>
    </IonPage>
  );
};


const LogoutButton = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  top: 13px;
  right: 18px;
`;
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








export default CreateMeeting;


