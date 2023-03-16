import React from 'react';
import {IonContent,IonPage} from '@ionic/react';
import { useSelector,RootStateOrAny } from 'react-redux';
import SubHeader from "../../components/Header/SubHeader";
import {_formatDateTime, _readableTimeFromSeconds} from "../../helpers/common";
import { useHistory,RouteComponentProps } from "react-router-dom";
interface CallLogDetailsProps extends RouteComponentProps<{
    key: any;
}> {}
const CallLogDetails: React.FC<CallLogDetailsProps> = ({match}) => {
    const allCallLogDetails = useSelector((state:RootStateOrAny) => state.allCallLogData[match.params.key]);
    const allUsersDataArray = useSelector((state:RootStateOrAny) => state.allUsersDataArray);
    const lastTwoCallLogMembersName = (members:any) =>{
        if(members && members != null){
            let jsonMembersId = JSON.parse(members);
            let nameToSend:any = [];
            let idArray :any = [];
            jsonMembersId?.map((userId:any)=>{
                allUsersDataArray.map((users:any)=>{
                    if(users.id == userId && !idArray.includes(userId)){
                        nameToSend.push(users.name);
                        idArray.push(userId);
                    }
                })
            })
            return nameToSend.toString();
        }
    }
    function jsonTestedString(text:any) {
        if (typeof text !== "string") {
            return [];
        }
        try {
            return JSON.parse(text);
        } catch (error) {
            return [];
        }
    }
    const timeDifference = (d1:any,d2:any) =>{
        let startDate = new Date(d1);
        let endDate = new Date(d2);
        let seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        return _readableTimeFromSeconds(seconds);
    }
    return (
        <IonPage>
            <IonContent fullscreen>
                <SubHeader title={'Call Log Details'}/>
                <div className="chat-list-col">
                    {(allCallLogDetails?.members != undefined) ?
                        <div className='container call_log_page_container'>
                            <div className={"row"}>
                                <div className={"col col-4 headings"}>All Users</div>
                                <div className={"col col-8 text"}>{lastTwoCallLogMembersName(allCallLogDetails.members)}</div>
                            </div>
                            <div className={"row"}>
                                <div className={"col col-4 headings"}>Start At</div>
                                <div className={"col col-8 text"}>{_formatDateTime(allCallLogDetails.created_at)}</div>
                            </div>
                            <div className={"row"}>
                                <div className={"col col-4 headings"}>End At</div>
                                <div className={"col col-8 text"}>{_formatDateTime(allCallLogDetails.end_time)}</div>
                            </div>
                            <div className={"row"}>
                                <div className={"col col-4 headings"}>Total Time</div>
                                <div className={"col col-8 text"}>{timeDifference(allCallLogDetails.created_at,allCallLogDetails.end_time)}</div>
                            </div>
                            {(allCallLogDetails?.call_text != null && allCallLogDetails?.call_text && jsonTestedString(allCallLogDetails?.call_text).length) ?
                            <>
                            <div className={"text_to_speech_section_heading"}>Call Transcript</div>
                            <div className={"text_to_speech_section"}>
                                {JSON.parse(allCallLogDetails.call_text)?.map((speechData: any, key: any) => (
                                    <div className={""} key={key}>
                                        <div className={""}>
                                                  <span className={"current_user_name"}>
                                                      {speechData.userInfo.name} :
                                                  </span>
                                            <span className={"current_user_text"}>
                                                      {speechData.text}
                                                  </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                           </>
                         :''}
                        </div>
                        : ''
                    }
                </div>

            </IonContent>
        </IonPage>
    );
};

export default CallLogDetails;


