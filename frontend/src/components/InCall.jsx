import React, { useMemo, useCallback, useRef,useState,useEffect } from "react";
import { useCallState } from "../CallProvider.jsx";
import { SPEAKER, MOD } from "../App";
import Participant from "./Participant";
import Audio from "./Audio.jsx";
import Counter from "./Counter.jsx";
import MicIcon from "./MicIcon.jsx";
import userMic from "../icons/mic.svg";
import MutedIcon from "./MutedIcon.jsx";
import { useSelector,useDispatch } from 'react-redux';
import { AudioToggle } from 'capacitor-audio-toggle';
import { Capacitor } from '@capacitor/core';
import {
    actionToUpdateCallLogData,
    addedNewUserInRoomByUser
} from "../actions/UserAction";
import {_getImageUrlByName, _getUserFirstName} from "../helpers/common";
import $ from "jquery";
// import tapStart from '../theme/tone/tapstart.wav';
// import tapEnd from '../theme/tone/tapend.wav';
const selectedMemberId = [];
const InCall = () => {
    const {
        participants,
        room,
        view,
        activeSpeakerId,
        getAccountType,
        leaveCall,
        handleMute,
        handleUnmute,
        raiseHand,
        lowerHand,
        recordCall,
        endCall,
    } = useCallState();
    console.log(participants);

    // const tapStartAudioRef = useRef();
    // const tapEndAudioRef = useRef();

    const {userInfo} = useSelector((state) => state.userSignin);
    const allUsersDataArray = useSelector((state) => state.allUsersDataArray);
    const activeSpeakingUserData = useSelector((state) => state.activeSpeakingUserData);
    // const currentCallSpeechToText = useSelector((state) => state.currentCallSpeechToText);
    const [requestToAddNewMember, setRequestToAddNewMember] = useState(false);
    const [volumeOn, setVolumeOn] = useState('earpiece');


    const dispatch = useDispatch();
    const selectUseref = useRef();

    const endCallFunction = () => {
        endCall();
        dispatch(actionToUpdateCallLogData());
    }

    const local = useMemo(
        (p) => participants?.filter((p) => p?.local)[0],
        [participants]
    );

    const mods = useMemo(
        () =>
            participants?.filter(
                (p) => p?.owner && getAccountType(p?.user_name) === MOD
            ),
        [participants, getAccountType]
    );

    const allUserIdArrayallUserSelectOptions = () => {
        const alreadyAddedUserIdsArray = [];
        const alreadyAddedUser = [...mods, ...speakers];

        alreadyAddedUser?.map((user) => {
            let splitArray = user?.user_name?.split('_');
            if (splitArray?.length) {
                alreadyAddedUserIdsArray.push(splitArray[0]);
            }
        })

        let userDataToSelect = [];
        allUsersDataArray.map((user) => {
            if (!alreadyAddedUserIdsArray.includes(user.id) && !user?.isAdmin) {
                userDataToSelect.push(
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
                );
            }
        })
        return userDataToSelect;
    }

    const speakers = useMemo(
        (p) =>
            participants?.filter((p) => getAccountType(p?.user_name) === SPEAKER),
        [participants, getAccountType]
    );
    const allMembersInCall = useMemo(() => {
        const s = [...mods, ...speakers];
        console.log('canSpeak', s);
        return (
            <div className={"call-users "+(userInfo.isAdmin ? '' : 'not_admin')}>
                {s?.map((p, i) => (
                    <Participant
                        participant={p}
                        key={`speaking-${p.user_id}`}
                        local={local}
                        modCount={mods?.length}
                    />
                ))}
            </div>
        );
    }, [mods, speakers, local]);

    const addNewSelectedUsers = () => {
        if (selectedMemberId?.length) {
            let newUsers = selectedMemberId;
            dispatch(addedNewUserInRoomByUser(newUsers));
            setRequestToAddNewMember(false);
            selectedMemberId.splice(0, selectedMemberId.length);
        }
    }

    const handleAudioChange = useCallback(
        () => (local?.audio ? handleMute(local) : handleUnmute(local)),
        [handleMute, handleUnmute, local]
    );

    const handleAudioChangeParticipantTouchStart = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        handleUnmute(local);
        // setTimeout(function() {
        //     tapEndAudioRef?.current?.pause();
        //     tapEndAudioRef.current.currentTime = 0;
        //     tapStartAudioRef?.current?.play();
        // },1000)
    }

    const handleAudioChangeParticipantTouchEnd = (e)=>{
        e.preventDefault();
        e.stopPropagation()
        handleMute(local);
        // setTimeout(function() {
        //     tapStartAudioRef?.current?.pause();
        //     tapStartAudioRef.current.currentTime = 0;
        //     tapEndAudioRef?.current?.play();
        // },1000)
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

    const  setRequestToAddNewMemberFunction = () =>{
        setRequestToAddNewMember(true);
        selectedMemberId.splice(0,selectedMemberId.length);
    }


    const setAudioToggleAction = (preVolume)=>{
        if(Capacitor.isNativePlatform()) {
            let curVol = '';
            if (preVolume == 'earpiece') {
                curVol = 'speaker';
            } else {
                curVol = 'earpiece';
            }
            setVolumeOn(curVol);
            AudioToggle.setAudioMode({mode: curVol});
        }
    }

    useEffect(()=>{
        if(Capacitor.isNativePlatform()) {
            setVolumeOn('earpiece');
            AudioToggle.setAudioMode({mode: 'earpiece'});
            //window.addFlags(Window.FLAG_KEEP_SCREEN_ON);
        }
    },[])

    const muteAllUser = ()=>{
        participants?.map((p)=>{
            if(!p?.user_name.includes('MOD')) {
                handleMute(p);
            }
        })
    }

    return (
        <>
            {(requestToAddNewMember) &&
            <div className="before_start_user_call_section">
                <div className="before_start_user_call_sectioninner_ctrl">
                    <div className={"select_user_heading"}>
                        Select Member For Call
                    </div>
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
                        {allUserIdArrayallUserSelectOptions()}
                    </div>
                    <div className="before_start_user_button_footer">
                        <button onClick={()=>setRequestToAddNewMember(false)} className="btn cancel_button">Cancel</button>
                        <button onClick={(e)=>addNewSelectedUsers(e)} className="btn start_button">Add</button>
                    </div>
                </div>
            </div>
            }
            {/*<div className="container">*/}
            {/*    <div className="page-content">*/}
            {/*        <div className="call-wrapper margin-top-call">*/}
            {/*            <div className="call-inner">*/}
            {/*                <div className="call-view">*/}
            {/*                    <div className="call-window">*/}
            {/*                        <div className="call-contents">*/}
            {/*                            <div className="call-content-wrap">*/}
            {/*                                    */}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            <div className="account-content account-form use-admin-calling-page-padding">
                <div className="voice-call-avatar">
                    {(activeSpeakingUserData != undefined && activeSpeakingUserData != null && Object.keys(activeSpeakingUserData).length) ?
                        <>
                            {(activeSpeakingUserData?.avatar) ?
                                <img className="call-avatar" alt="" src={_getImageUrlByName(activeSpeakingUserData?.avatar)}/>
                                :
                                <span className="username_initial">{_getUserFirstName(activeSpeakingUserData?.name)}</span>
                            }
                            <span className="username calling-page-avator">{activeSpeakingUserData?.name}</span>
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
                            <span className="username calling-page-avator">{userInfo.name}</span>
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
                        <div className={"call-item " + (local?.audio ? 'process_audio' : 'user_in_call_mic')}>
                            <div className="user_in_call_mic_inner">
                                <div className="user_in_call_mic_inner_inner">
                                    <a className={"tap_to_speak_section_inner_div"}
                                       onTouchStart={handleAudioChangeParticipantTouchStart}
                                       onTouchEnd={handleAudioChangeParticipantTouchEnd}

                                       onMouseDown={handleAudioChangeParticipantTouchStart}
                                       onMouseUp={handleAudioChangeParticipantTouchEnd}
                                    >
                                        {local?.audio ? (
                                            <i className="fa fa-microphone"></i>
                                        ) : (
                                            <i className="fa fa-microphone-slash"></i>
                                        )}
                                    </a>
                                    {/*<div>{local?.audio ? 'Speak' : 'Tap to speak'}</div>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                    : ''
                }
                {(userInfo.isAdmin) ?
                    <>
                        {allMembersInCall}
                    </>
                    : ''
                }
                <div className="admin-calling-screen-bt">
                    <div className="container">
                        <div className="row">
                            {(!userInfo.isAdmin) ?
                                <div className="col-md-6 col-6">
                                    {/*{(Capacitor.isNativePlatform()) ?*/}
                                    <button type={"button"} onClick={() => setAudioToggleAction(volumeOn)}
                                            className={"call-item speaker_button " + (volumeOn == 'speaker' ? 'speaker' : 'earpiece')}>
                                        <i className="fa fa-volume-up"></i>
                                    </button>
                                    {/*    : ''*/}
                                    {/*}*/}
                                </div>
                                :''
                            }
                            {(userInfo.isAdmin) ?
                                <>
                                    <div className="col-md-6 col-6">
                                        <button type={"button"} onClick={()=>{setAudioToggleAction(volumeOn)}} className={"call-item "+(volumeOn == 'speaker' ? 'speaker' : 'earpiece')}>
                                            <i className="fa fa-volume-up"></i>
                                        </button>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <button type={"button"} className="call-item" onClick={handleAudioChange}>
                                            {local?.audio ? (
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
                                    <button type={"button"} onClick={leaveCall} className="call-item end_call">
                                        <i className="fas fa-phone"></i>
                                    </button>
                                </div>
                            }

                        </div>
                    </div>
                </div>
            </div>


            {/*{(!userInfo.isAdmin) ?*/}
            {/*    <>*/}
            {/*        <audio autoPlay={false}*/}
            {/*            playsInline*/}
            {/*            ref={tapStartAudioRef}>*/}
            {/*            <source src={tapStart} type="audio/wav"/>*/}
            {/*        </audio>*/}
            {/*        <audio*/}
            {/*            autoPlay={false}*/}
            {/*            playsInline*/}
            {/*            ref={tapEndAudioRef}*/}
            {/*        >*/}
            {/*            <source src={tapEnd} type="audio/wav"/>*/}
            {/*        </audio>*/}
            {/*    </>*/}
            {/*:''*/}
            {/*}*/}
            <Audio participants={participants}/>
        </>
    );
};


export default InCall;
