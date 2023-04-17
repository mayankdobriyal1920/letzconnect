import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useCallState } from "../CallProvider";
import { LISTENER, MOD, SPEAKER } from "../App";
import useClickAway from "../useClickAway";
import MicIcon from "./MicIcon";
import MutedIcon from "./MutedIcon";
import MoreIcon from "./MoreIcon";
import theme from "../theme";
import {useDispatch, useSelector} from 'react-redux';
import {_getImageUrlByName, _getUserFirstName} from "../helpers/common";
import {
  actionToAddActiveSpeakingUser,
  actionToKickOutUserFromCall,
  actionToMuteUnmuteUserCall
} from "../actions/UserAction";
import Menu from "./Menu";

const AVATAR_DIMENSION = 80;


const Participant = ({ participant }) => {

  const { ref, isVisible, setIsVisible } = useClickAway(false);
  const dispatch = useDispatch();
  const {userInfo} = useSelector((state) => state.userSignin);

  const callFunctionToKickOutMemberFromCall =(member)=>{
      dispatch(actionToKickOutUserFromCall(member.id,userInfo.id));
  }

  const handleMuteParticipant =(member)=>{
    dispatch(actionToMuteUnmuteUserCall([member?.id],'MUTE',userInfo.id));
  }

  const menuOptions = useMemo(() => {
    let options = [];

    if( participant?.audio) {
      options.push({
        text: 'Mute',
        action: () => handleMuteParticipant(participant),
      })
    }

    options.push({
      text: "Remove",
      action: () => callFunctionToKickOutMemberFromCall(participant),
      warning: true,
    });

    return options;
  }, [participant]);


  // useEffect(()=>{
  //   if(participant?.user_id == activeSpeakerId){
  //     dispatch(actionToAddActiveSpeakingUser(participant));
  //   }
  // },[activeSpeakerId])
  //
  // useEffect(()=>{
  //   return ()=>{
  //      if(participant?.user_id == activeSpeakerId || activeSpeakerId == null || !activeSpeakerId){
  //        dispatch(actionToAddActiveSpeakingUser({}));
  //      }
  //   }
  // },[]);
  //
  // useEffect(()=>{
  //   if(!participant?.audio) {
  //     if (participant?.user_id == activeSpeakerId || activeSpeakerId == null || !activeSpeakerId) {
  //       dispatch(actionToAddActiveSpeakingUser({}));
  //     }
  //   }
  // },[participant?.audio]);
  //
  // useEffect(()=>{
  //   if(!participant?.audio) {
  //     if (participant?.user_id == activeSpeakerId || activeSpeakerId == null || !activeSpeakerId) {
  //       dispatch(actionToAddActiveSpeakingUser({}));
  //     }
  //   }
  // },[participant]);


  return (
    <>
      {(participant != null) ?
        <Container>
            <Avatar
              muted={!participant?.audio}
              // isActive={activeSpeakerId === participant?.user_id}
            >
              {(participant?.avatar != null && participant?.avatar) ?
                  <img alt={_getUserFirstName(participant?.name)} className="img-fluid" src={_getImageUrlByName(participant?.avatar)}/>
                  :
                  <div className={"member_name_initial"}>
                    {_getUserFirstName(participant?.name)}
                  </div>
              }
            </Avatar>
            <Name>{participant.name}</Name>
            <AudioIcon>
              {participant?.audio ? <MicIcon /> : <MutedIcon />}
            </AudioIcon>


            <MenuButton onClick={() => setIsVisible(!isVisible)}>
              <MoreIcon />
            </MenuButton>

            {isVisible ? (
              <MenuContainer ref={ref}>
                <Menu options={menuOptions} setIsVisible={setIsVisible} />
              </MenuContainer>
            ):''}
          </Container>
      :''}
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 8px;
  align-items: flex-start;
  position: relative;
  max-width: 104px;
`;
const Avatar = styled.div`
  width: ${AVATAR_DIMENSION}px;
  height: ${AVATAR_DIMENSION}px;
  background-color: ${(props) => props.muted ? 'red' : theme.colors.turquoise};
  display: flex;
  border-radius:50%;
  align-items: center;
  justify-content: center;
  border: 8px solid ${(props) => (props.isActive ? '#3854bf' : "transparent")};
`;
const Name = styled.p`
  color: ${theme.colors.blueDark};
  margin: 8px 0;
  font-weight: 400;
  font-size: ${theme.fontSize.base};
  padding-left: 4px;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 20px;
`;
const AudioIcon = styled.div`
  position: absolute;
  top: ${AVATAR_DIMENSION - 28}px;
  left: -4px;
`;
const MenuButton = styled.button`
  border: none;
  background-color: transparent;
  position: absolute;
  top: ${AVATAR_DIMENSION - 28}px;
  right: -4px;
  padding: 0;
  cursor: pointer;
`;
const MenuContainer = styled.div`
position: absolute;
right: 0;
z-index: 10;
width: 78px;
`;

export default Participant; // React.memo(Participant, (p, n) => p.participant?.id === n.participant?.id);
