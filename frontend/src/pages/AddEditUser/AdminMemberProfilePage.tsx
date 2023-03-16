import {IonContent,IonPage} from '@ionic/react';
import {useSelector,RootStateOrAny} from "react-redux";
import SubHeader from "../../components/Header/SubHeader";
import {_getImageUrlByName, _getUserFirstName} from "../../helpers/common";
import React from "react";
import {RouteComponentProps} from "react-router-dom";

interface AdminMemberProfilePageProps extends RouteComponentProps<{
    key: any;
}> {}
const AdminMemberProfilePage: React.FC<AdminMemberProfilePageProps> = ({match}) => {
    const userInfo = useSelector((state:RootStateOrAny) => state.allAdminUsersDataArray[match.params.key]);
    return (
        <IonPage>
            <SubHeader title={'User Profile'}/>
            {(userInfo != undefined) ?
                <IonContent fullscreen>
                    <div className="chat-list-col">
                        <div className='container user_list_container'>
                            <div className="">
                                <div className="account-content">
                                    <div className="account-form">
                                        <form>
                                            <div className={"user_avatar_edit"}>
                                                {(userInfo.avatar != null && userInfo.avatar) ?
                                                    <div className={"user_avatar_profile_image"}>
                                                        <img alt={userInfo.name} src={_getImageUrlByName(userInfo.avatar)}/>
                                                    </div>
                                                    :
                                                    <div className={"user_avatar_edit_inner"}>
                                                        <span>{_getUserFirstName(userInfo.name)}</span>
                                                    </div>
                                                }
                                            </div>
                                            <div className="input-list">
                                                <input type="text" placeholder="Name" required value={userInfo.name} readOnly={true}/>
                                            </div>
                                            <div className="input-list">
                                                <input type="email" required value={userInfo.email}  readOnly={true}/>
                                            </div>
                                            <div className="input-list">
                                                <textarea className="input2" name="message" placeholder="About" value={userInfo.description} readOnly={true}></textarea>
                                            </div>
                                            {(userInfo?.all_members && userInfo?.all_members?.length) ?
                                                <div className="input-list member_list">
                                                    <h2>All Members</h2>
                                                    {userInfo?.all_members?.map((member:any,key:any)=>(
                                                        <div key={key} className={"all_member_loop_section"}>
                                                            <div className={"all_member_loop_inner"}><strong>{key+1} - </strong> </div>
                                                            <div className={"all_member_loop_inner"}><strong>Name : </strong>{member?.name}</div>
                                                            <div className={"all_member_loop_inner"}><strong>Email : </strong>{member?.email}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                : ''
                                            }
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </IonContent>
                : ''
            }
        </IonPage>
    );
};

export default AdminMemberProfilePage;


