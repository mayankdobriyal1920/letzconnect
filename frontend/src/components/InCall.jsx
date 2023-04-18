import React, { useMemo,useState,useEffect,useRef } from "react";
import { useCallState } from "../CallProvider.jsx";
import Participant from "./Participant";
import Counter from "./Counter.jsx";
import MicIcon from "./MicIcon.jsx";
import MutedIcon from "./MutedIcon.jsx";
import { useSelector,useDispatch } from 'react-redux';
import { AudioToggle } from 'capacitor-audio-toggle';
import { Capacitor } from '@capacitor/core';
import {
    actionToChangeMyCurrentAudio,
    actionToEndCallAndRemoveRoom,
    actionToLeaveCallAndExitFromRoom,
    actionToMuteUnmuteUserCall,
    addedNewUserInRoomByUser
} from "../actions/UserAction";
import {_getImageUrlByName, _getUserFirstName, connectToNewUser} from "../helpers/common";
import $ from "jquery";
import {MY_CURRENT_AUDIO_CHANGE} from "../constants/UserConstants";
const selectedMemberId = [];
const InCall = ({myPeer,myStream}) => {

    const {handleToSetViewNotInCall,keepAwake,allowSleep} = useCallState();
    const {userInfo} = useSelector((state) => state.userSignin);
    const allUsersDataArray = useSelector((state) => state.allUsersDataArray);
    const allUsersInCall = useSelector((state) => state.allUsersInCall);
    const {members} = useSelector((state) => state.currentRoomData);
    const myCurrentAudioChange = useSelector((state) => state.myCurrentAudioChange);
    const activeSpeakingUserData = useSelector((state) => state.activeSpeakingUserData);
    const newAddedUserInCurrentCall = useSelector((state) => state.newAddedUserInCurrentCall);
    const [requestToAddNewMember,setRequestToAddNewMember] = useState(false);

    const [volumeOn,setVolumeOn] = useState('speaker');

    const dispatch = useDispatch();

    const endMyStreamTrackOnEndCall = ()=>{
        if(myStream != null) {
            myStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        if(myPeer != null){
            myPeer.disconnect();
        }
        if(document.getElementById('userAudioSectionId'))
           document.getElementById('userAudioSectionId').innerHTML = '';
    }

    const endCallFunction = () =>{
        dispatch(actionToEndCallAndRemoveRoom(userInfo.id));
        endMyStreamTrackOnEndCall();
        handleToSetViewNotInCall();
    }

    const callFunctionToleaveCall = () =>{
        dispatch(actionToLeaveCallAndExitFromRoom(userInfo.id,userInfo.created_by));
        endMyStreamTrackOnEndCall();
        handleToSetViewNotInCall();
    }


    const allUserIdArrayallUserSelectOptions = (allUsers) => {
        let userDataToSelect = [];

        allUsersDataArray.map((user)=>{
            if(user?.id !== userInfo.id) {
                if (!allUsers.includes(user.id)) {
                    userDataToSelect.push(
                        <div key={user.id} className={"row"}>
                            <div className={"col-2"}>
                                <div className={"select_user_input"}>
                                    <input onChange={selectUserInStartCallIndividual}
                                           type={"checkbox"}
                                           value={user.id}/>
                                </div>
                            </div>
                            <div className={"col-10"}>
                                <div className={"user_select_name"}>
                                    {user.name}
                                </div>
                            </div>
                        </div>
                    );
                }
            }
        })

        if(userDataToSelect?.length) {
            userDataToSelect.unshift(<div className={"select_user_input"}>
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
            </div>);
        }else{
            userDataToSelect.unshift(<div className={"select_user_input"}>
                <div className={"row"}>
                    <div className={"col-12"}>
                        All users are added in call
                    </div>
                </div>
            </div>);
        }

        return userDataToSelect;
    }

    const allMembersInCall = useMemo(() => {
        console.log('canSpeak',members);
        const callMembers = [];
        members?.map((p, i) => {
            if(p.id !== userInfo.id) {
                callMembers.push(<Participant
                    participant={p}
                    key={i}
                />)
            }
        })

        return callMembers;
    }, [members]);

    const addNewSelectedUsers = () =>{
        if(selectedMemberId?.length){
            let newUsers = selectedMemberId;
            dispatch(addedNewUserInRoomByUser(newUsers,userInfo.id));
            setRequestToAddNewMember(false);
            selectedMemberId.splice(0,selectedMemberId.length);
        }
    }

    const handleAudioChange = (preAudio)=>{
        let audio = 'MUTE';
        if(preAudio === 'MUTE'){
            audio = 'UNMUTE';
        }
        dispatch(actionToChangeMyCurrentAudio(audio,userInfo.id));
    }

    const selectUserInStartCall = (e)=>{
        if(e.target.checked){
            $('.select_user_input input').prop('checked', true);
            allUsersDataArray?.map((user)=>{
                if(user.id != userInfo.id) {
                    if (!selectedMemberId.includes(user.id)) {
                        selectedMemberId.push(user.id);
                    }
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

    const  setRequestToAddNewMemberFunction = () =>{
        setRequestToAddNewMember(true);
        selectedMemberId.splice(0,selectedMemberId.length);
    }

    const setAudioToggleAction = (preVolume)=>{
        if(Capacitor.isNativePlatform()) {
            let curVol = '';
            if (preVolume === 'earpiece') {
                curVol = 'speaker';
            } else {
                curVol = 'earpiece';
            }
            setVolumeOn(curVol);
            AudioToggle.setAudioMode({mode: curVol});
        }
    }

    const handleAudioChangeParticipantTouchStart = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        dispatch({type: MY_CURRENT_AUDIO_CHANGE, payload:'UNMUTE'});
        dispatch(actionToMuteUnmuteUserCall([userInfo.id],'UNMUTE',userInfo.created_by));
    }

    const handleAudioChangeParticipantTouchEnd = (e)=>{
        e.preventDefault();
        e.stopPropagation()
        dispatch({type: MY_CURRENT_AUDIO_CHANGE, payload:'MUTE'});
        dispatch(actionToMuteUnmuteUserCall([userInfo.id],'MUTE',userInfo.created_by));
    }

    useEffect(()=>{
        if(Capacitor.isNativePlatform()) {
            setVolumeOn('speaker');
            AudioToggle.setAudioMode({mode: 'speaker'});
        }
        if(userInfo.isAdmin){
            dispatch(actionToChangeMyCurrentAudio('UNMUTE'));
        }else{
            dispatch(actionToChangeMyCurrentAudio('MUTE'));
        }
    },[])


    useEffect(()=>{
        if(newAddedUserInCurrentCall?.id != undefined){
            connectToNewUser(newAddedUserInCurrentCall,myStream,myPeer,members);
        }
    },[newAddedUserInCurrentCall]);

    const muteAllUser = ()=>{
        let ids = [];
        members?.map((user)=>{
            if(user.id != userInfo.id)
               ids.push(user.id);
        })
        dispatch(actionToMuteUnmuteUserCall(ids,'MUTE',userInfo.id));
    }
    useEffect(()=>{
        keepAwake();
        return ()=>{
            allowSleep();
            if(userInfo?.isAdmin){
                endCallFunction();
            }else{
                callFunctionToleaveCall();
            }
        }
    },[])
    return (
        <>
            {(requestToAddNewMember) &&
            <div className="before_start_user_call_section">
                <div className="before_start_user_call_sectioninner_ctrl">
                    <div className={"select_user_heading"}>
                        Select Member For Call
                    </div>
                    <div className={"user_select_section"}>
                        {allUserIdArrayallUserSelectOptions(allUsersInCall)}
                    </div>
                    <div className="before_start_user_button_footer">
                        <button onClick={()=>setRequestToAddNewMember(false)} className="btn cancel_button">Cancel</button>
                        <button onClick={(e)=>addNewSelectedUsers(e)} className="btn start_button">Add</button>
                    </div>
                </div>
            </div>
            }
            <div className="container">
                <div className="page-content">
                    <div className="call-wrapper margin-top-call">
                        <div className="call-inner">
                            <div className="call-view">
                                <div className="call-window">
                                    <div className="call-contents">
                                        <div className="call-content-wrap">
                                            <div className="voice-call-avatar">
                                                {(activeSpeakingUserData != undefined && activeSpeakingUserData != null && Object.keys(activeSpeakingUserData).length) ?
                                                    <>
                                                        {(activeSpeakingUserData?.avatar) ?
                                                            <img className="call-avatar" alt="" src={_getImageUrlByName(activeSpeakingUserData?.avatar)}/>
                                                            :
                                                            <span className="username_initial">{_getUserFirstName(activeSpeakingUserData?.name)}</span>
                                                        }
                                                        <span className="username">{activeSpeakingUserData?.name}</span>
                                                    </>
                                                    :
                                                    <>
                                                        {(userInfo.avatar) ?
                                                            <img className="call-avatar" alt=""
                                                                 src={_getImageUrlByName(userInfo.avatar)}/>
                                                            :
                                                            <span
                                                                className="username_initial">{_getUserFirstName(userInfo.name)}</span>
                                                        }
                                                        <span className="username">{userInfo.name}</span>
                                                    </>
                                                }
                                                <span className="call-timing-count"><Counter/></span>
                                                {(userInfo?.isAdmin) ?
                                                    <button onClick={muteAllUser} className={"mute_all_button"}
                                                            type={"button"}>Mute All</button>
                                                    :
                                                    ''
                                                }
                                            </div>
                                            {!userInfo?.isAdmin ?
                                                <div className="tap_to_speak_section">
                                                    <div className={"call-item " + (myCurrentAudioChange != 'MUTE' ? 'process_audio' : 'user_in_call_mic')}>
                                                        {(Capacitor.isNativePlatform()) ?
                                                            <a className={"tap_to_speak_section_inner_div"}
                                                               onTouchStart={handleAudioChangeParticipantTouchStart}
                                                               onTouchEnd={handleAudioChangeParticipantTouchEnd}>
                                                                {myCurrentAudioChange !== 'MUTE' ? (
                                                                    <i className="fa fa-microphone"></i>
                                                                ) : (
                                                                    <i className="fa fa-microphone-slash"></i>
                                                                )}
                                                            </a>
                                                            :
                                                            <a className={"tap_to_speak_section_inner_div"}
                                                               onMouseDown={handleAudioChangeParticipantTouchStart}
                                                               onMouseUp={handleAudioChangeParticipantTouchEnd}>
                                                                {myCurrentAudioChange !== 'MUTE' ? (
                                                                    <i className="fa fa-microphone"></i>
                                                                ) : (
                                                                    <i className="fa fa-microphone-slash"></i>
                                                                )}
                                                            </a>
                                                        }
                                                        <div>{myCurrentAudioChange != 'MUTE' ? 'Speak' : 'Tap to speak'}</div>
                                                    </div>
                                                </div>
                                                : ''
                                            }

                                            {!userInfo?.isAdmin ?
                                                <div className="tap_to_speak_section">
                                                    <div className={"call-item " + (myCurrentAudioChange !== 'MUTE' ? 'process_audio' : 'user_in_call_mic')}>
                                                        <div className="user_in_call_mic_inner">
                                                            <div className="user_in_call_mic_inner_inner">
                                                                {(Capacitor.isNativePlatform()) ?
                                                                    <a className={"tap_to_speak_section_inner_div"}
                                                                       onTouchStart={handleAudioChangeParticipantTouchStart}
                                                                       onTouchEnd={handleAudioChangeParticipantTouchEnd}>
                                                                        {myCurrentAudioChange !== 'MUTE' ? (
                                                                            <i className="fa fa-microphone"></i>
                                                                        ) : (
                                                                            <i className="fa fa-microphone-slash"></i>
                                                                        )}
                                                                    </a>
                                                                    :
                                                                    <a className={"tap_to_speak_section_inner_div"}
                                                                       onMouseDown={handleAudioChangeParticipantTouchStart}
                                                                       onMouseUp={handleAudioChangeParticipantTouchEnd}>
                                                                        {myCurrentAudioChange !== 'MUTE' ? (
                                                                            <i className="fa fa-microphone"></i>
                                                                        ) : (
                                                                            <i className="fa fa-microphone-slash"></i>
                                                                        )}
                                                                    </a>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                : ''
                                            }

                                            {(userInfo.isAdmin) ?
                                                <div className="call-users">
                                                    {allMembersInCall}
                                                </div>
                                                : ''
                                            }

                                            <div className="admin-calling-screen-bt">
                                                <div className="container">
                                                    <div className="row">
                                                        {(!userInfo.isAdmin) ?
                                                            <div className="col-md-6 col-6">
                                                                {(Capacitor.isNativePlatform()) ?
                                                                <button type={"button"} onClick={() => setAudioToggleAction(volumeOn)} className={"call-item speaker_button " + (volumeOn === 'speaker' ? 'speaker' : 'earpiece')}>
                                                                    {volumeOn === 'speaker' ?
                                                                        <i className="fa fa-volume-up"></i>
                                                                        :
                                                                        <i className="fa fa-volume-down"></i>
                                                                    }
                                                                </button>
                                                                    : ''
                                                                }
                                                            </div>
                                                            :''
                                                        }
                                                        {(userInfo.isAdmin) ?
                                                            <>
                                                                <div className="col-md-6 col-6">
                                                                    <button type={"button"} onClick={()=>{setAudioToggleAction(volumeOn)}} className={"call-item "+(volumeOn === 'speaker' ? 'speaker' : 'earpiece')}>
                                                                        {volumeOn === 'speaker' ?
                                                                            <i className="fa fa-volume-up"></i>
                                                                            :
                                                                            <i className="fa fa-volume-down"></i>
                                                                        }
                                                                    </button>
                                                                </div>
                                                                <div className="col-md-6 col-6">
                                                                    <button type={"button"} className="call-item" onClick={handleAudioChange}>
                                                                        {myCurrentAudioChange != 'MUTE' ? (
                                                                            <MicIcon type="simple" />
                                                                        ) : (
                                                                            <i className={"fa fa-microphone-slash"}></i>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </>
                                                            :
                                                            ''
                                                        }
                                                        {(userInfo.isAdmin) ?
                                                            <div className="col-md-6 col-6">
                                                                <button type={"button"} onClick={()=>{setRequestToAddNewMemberFunction()}} className="call-item">
                                                                    <i className="fa fa-user-plus"></i>
                                                                </button>
                                                            </div>
                                                            :''}
                                                        {(userInfo.isAdmin) ?
                                                            <div className="col-md-6 col-6">
                                                                <button type={"button"} onClick={endCallFunction} className="call-item end_call">
                                                                    <i className="fas fa-phone"></i>
                                                                </button>
                                                            </div>
                                                            :
                                                            <div className="col-md-6 col-6">
                                                                <button type={"button"} onClick={callFunctionToleaveCall} className="call-item end_call">
                                                                    <i className="fas fa-phone"></i>
                                                                </button>
                                                            </div>
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export default InCall;
