import {IonContent,IonPage} from '@ionic/react';
import { useSelector,RootStateOrAny } from 'react-redux';
import SubHeader from "../../components/Header/SubHeader";
import {_fromNow, _readableTimeFromSeconds} from "../../helpers/common";
import { useHistory } from "react-router-dom";

const CallLogPage = () => {
    const allCallLogData = useSelector((state:RootStateOrAny) => state.allCallLogData);
    const allUsersDataArray = useSelector((state:RootStateOrAny) => state.allUsersDataArray);
    let history = useHistory();

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

    const lastTwoCallLogMembersName = (members:any) =>{
        if(members && members != null && members != ''){
            let jsonMembersId = jsonTestedString(members);
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

    const timeDifference = (d1:any,d2:any) =>{
        let startDate = new Date(d1);
        let endDate = new Date(d2);
        let seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        return _readableTimeFromSeconds(seconds);
    }

    const openCallLogData = (key:any)=>{
        history.push('/app/call-log-details/'+key);
    }

    const renderAllCalLogData = (calLogData:any) =>{
        let callLogData:any = [];
        if(calLogData.length){
            calLogData?.map((callLog:any,key:any)=>{
                if(callLog.members != undefined && callLog.members && callLog.members != '' && jsonTestedString(callLog.members).length) {
                    callLogData.push(
                        <div key={key} onClick={()=>openCallLogData(key)} className="row">
                            <div className={"col-8 text-left"}>
                                <div className={"user_name_section"}>
                                    {lastTwoCallLogMembersName(callLog.members)}
                                </div>
                                Duration - {timeDifference(callLog.created_at, callLog.end_time)}
                            </div>
                            <div className={"col-4 text-right"}>
                                Time - {_fromNow(callLog.created_at)} &nbsp;
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416.979 416.979">
                                    <path d="M356.004 61.156c-81.37-81.47-213.377-81.551-294.848-.182s-81.552 213.379-.181 294.85 213.378 81.551 294.849.181 81.551-213.379.18-294.849zM237.6 340.786c0 3.217-2.607 5.822-5.822 5.822h-46.576c-3.215 0-5.822-2.605-5.822-5.822V167.885c0-3.217 2.607-5.822 5.822-5.822h46.576a5.82 5.82 0 0 1 5.822 5.822v172.901zm-29.11-202.885c-18.618 0-33.766-15.146-33.766-33.765S189.871 70.37 208.49 70.37s33.766 15.148 33.766 33.766-15.149 33.765-33.766 33.765z"/>
                                </svg>
                            </div>
                        </div>
                    )
                }
            })
        }
        return callLogData;
    }

    return (
        <IonPage>
            <SubHeader title={'Call Logs'}/>
            <IonContent fullscreen>
                <div className="chat-list-col">
                    <div className='container call_log_page_container'>
                         {renderAllCalLogData(allCallLogData)}
                    </div>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default CallLogPage;


