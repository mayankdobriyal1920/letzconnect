import React from 'react';
import styled from "styled-components";
import { IonCol, IonContent, IonGrid, IonPage, IonRow } from "@ionic/react";
import { useDispatch,useSelector,RootStateOrAny } from 'react-redux';
import ParticipantComponent from '../ParticipantComponent/ParticipantComponent';

const ChatRoom = (props:any) => {
  const allRoomMeetingParticipantArray = useSelector((state:RootStateOrAny) => state.allRoomMeetingParticipantArray);

  return (
  <IonContent className="ion-padding">
    <h1>Room Meeting</h1>
    <IonGrid>
      <IonRow>
        {allRoomMeetingParticipantArray.map((user:any,key:any)=>(
           <ParticipantComponent
             key={key}
             index={key}
             user={user}
           />
        ))}
      </IonRow>
    </IonGrid>
  </IonContent>
  )
};

const CanSpeakContainer = styled.div`
  border-bottom: #ccc 1px solid;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
`;

export default ChatRoom;