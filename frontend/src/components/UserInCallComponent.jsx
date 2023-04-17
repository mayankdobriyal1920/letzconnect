import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from "react";

const UserInCallComponent = (props) => {
  const {userInfo} = useSelector((state) => state.userSignin);
  const participant = props.participant;
  const audioRef = useRef(null);
  useEffect(()=>{
    if(audioRef?.current != undefined){
        console.log('[AUDIO TRACK]',participant?.track);
        audioRef.current.srcObject = participant?.track;
    }
  },[audioRef])
  return (
    <div>
         {participant?.name}
    </div>
  );
};

export default UserInCallComponent;


