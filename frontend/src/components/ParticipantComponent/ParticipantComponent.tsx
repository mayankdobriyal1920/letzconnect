import React, { useEffect, useMemo, useRef } from "react";
import { IonCol} from "@ionic/react";
import { useDispatch,useSelector,RootStateOrAny } from 'react-redux';

const ParticipantComponent = (props:any) => {
  const audioRef: any | null = useRef()
  const participant = props.user;

  useEffect(() => {
    if (!participant?.audioTrack || !audioRef.current) return;
    // sanity check to make sure this is an audio track
    if (participant?.audioTrack?.track && participant?.audioTrack?.track?.kind != "audio")
      return;
    // don't play the local audio track (echo!)
    if (participant?.local) return;
    // set the audio source for everyone else

    /**
      Note: Safari will block the autoplay of audio by default.

      Improvement: implement a timeout to check if audio stream is playing
      and prompt the user if not, e.g:
      
      let playTimeout;
      const handleCanPlay = () => {
        playTimeout = setTimeout(() => {
          showPlayAudioPrompt(true);
        }, 1500);
      };
      const handlePlay = () => {
        clearTimeout(playTimeout);
      };
      audioEl.current.addEventListener('canplay', handleCanPlay);
      audioEl.current.addEventListener('play', handlePlay);
     */
    audioRef.current.srcObject = new MediaStream([participant?.audioTrack]);
    console.log('participant?.audioTrack',participant?.audioTrack);
  }, [participant?.audioTrack, participant?.local]);

  useEffect(()=>{
    console.log(participant);
    if (!audioRef.current) {
        return;
    }
  
    const startPlayingTrack = () => {
      audioRef.current?.play();
    };
    navigator.mediaDevices.addEventListener("devicechange", startPlayingTrack);

    return () => {
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          startPlayingTrack
        );
      };
  },[audioRef])

  return (
    <IonCol key={props.index}>
        {participant?.local?.name}
        <audio
          autoPlay
          playsInline
          id={`audio-${props.user.id}`}
          ref={audioRef}
        />
    </IonCol>
  )
};

export default ParticipantComponent;