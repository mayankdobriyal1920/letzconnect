import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback
} from "react";
import { useSelector } from 'react-redux';
import { useWakeLock } from 'react-screen-wake-lock';

export const CallContext = createContext(null);
export const PREJOIN = "pre-join";
export const INCALL = "in-call";

export const CallProvider = ({ children }) => {

  const callSocketMessageBroadcast = useSelector((state) => state.callSocketMessageBroadcast);
  const currentRoomData = useSelector((state) => state.currentRoomData);

  const [participants, setParticipants] = useState([]);
  const [view, setView] = useState(PREJOIN); // pre-join | in-call

  const { isSupported, request, release } = useWakeLock({
      onRequest: () => console.log('Screen Wake Lock: requested!'),
      onError: () => console.log('An error happened!'),
      onRelease: () => console.log('Screen Wake Lock: released!'),
  });

    const handleToSetViewInCall = useCallback(
        () => {
            setView(INCALL);
        },
        [setView,INCALL]
    );

    const handleToSetViewNotInCall = useCallback(
        () => {
            setView(PREJOIN);
        },
        [setView,PREJOIN]
    );

    const handleParticipantArrayUpdated = (members) => {
        setParticipants(members);
        console.log("[PARTICIPANT JOINED/UPDATED]", members);
    }

    const keepAwake =  () => {
        if(isSupported){
            request();
        }
    };

    const allowSleep =  () => {
        if(isSupported){
            release();
        }
    };

    useEffect(() => {

      const handleAppMessage = (message) => {
          if(callSocketMessageBroadcast && currentRoomData?.members != undefined) {
              switch(message) {
                  case 'participant-joined':
                      handleParticipantArrayUpdated(currentRoomData?.members);
                      break;
                  case 'participant-updated':
                      handleParticipantArrayUpdated(currentRoomData?.members);
                      break;
                  case 'participant-left':
                      handleParticipantArrayUpdated(currentRoomData?.members);
                      break;
                  case 'participant-removed':
                      handleParticipantArrayUpdated(currentRoomData?.members);
                      break;
                  case 'end-of-current-call':
                      handleParticipantArrayUpdated([]);
                      handleToSetViewNotInCall();
                      allowSleep();
                      document.getElementById('userAudioSectionId').innerHTML = '';
                      break;
              }
          }
    }

    handleAppMessage(callSocketMessageBroadcast);

  }, [callSocketMessageBroadcast]);

  return (
    <CallContext.Provider 
      value={{
        participants,
        view,
        handleToSetViewInCall,
        handleToSetViewNotInCall, 
        handleParticipantArrayUpdated,
        keepAwake,
        allowSleep
      }}>
      {children}
    </CallContext.Provider>
  );
};
export const useCallState = () => useContext(CallContext);
