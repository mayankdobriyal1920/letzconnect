
import {IonContent, IonPage, IonToast} from '@ionic/react';
import { useSelector,useDispatch } from 'react-redux';
import SubHeader from '../../components/Header/SubHeader';
import {_getUserFirstName} from "../../helpers/common";
import {useState} from "react";
import {actionToChangeUserPassword, actionToEditNewUserData} from "../../actions/UserAction";

const UserSettingPage = () => {
    const dispatch = useDispatch();
    const [oldPassword,setOldPassword] = useState('');
    const [newPassword,setNewPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [passwordNotMatched, setPasswordNotMatched] = useState(false);
    const [conformPasswordNotMatched, setConformPasswordNotMatched] = useState(false);
    const [addingUserLoading, setAddingUserLoading] = useState(false);

    const submitFormChangePassword = () => {
        if (oldPassword?.trim()?.length && newPassword?.trim()?.length && confirmPassword?.trim()?.length) {
            if (newPassword?.trim()?.length != confirmPassword?.trim()?.length) {
                setConformPasswordNotMatched(true);
                return;
            }
            const payload = {oldPassword, newPassword, confirmPassword};
            dispatch(actionToChangeUserPassword(payload)).then(response => {
                if (response.success == 0) {
                    setPasswordNotMatched(true);
                } else {
                    setShowToast(true);
                    setAddingUserLoading(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }
            })
        }
    }


    return (
        <IonPage>
            <SubHeader title={'Setting'}/>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message="Password Updated successfully!"
                duration={3000}
            />
            <IonToast
                isOpen={passwordNotMatched}
                onDidDismiss={() => setPasswordNotMatched(false)}
                message="Wrong old password!"
                duration={3000}
            />
            <IonToast
                isOpen={conformPasswordNotMatched}
                onDidDismiss={() => setConformPasswordNotMatched(false)}
                message="Confirm password not matching with new password!"
                duration={3000}
            />
            <IonContent fullscreen>
                <div className="account-content account-form usersetting">

                    <form>
                        <div className="input-list">
                            <input type="password" onChange={(e)=>setOldPassword(e.target.value)} placeholder="Old Password" required value={oldPassword}/>
                        </div>
                        <div className="input-list">
                            <input type="password" onChange={(e)=>setNewPassword(e.target.value)} placeholder="New Password" required value={newPassword}/>
                        </div>
                        <div className="input-list">
                            <input type="text" autoFocus={true} placeholder="Confirm New Password" onChange={(e)=>setConfirmPassword(e.target.value)} required value={confirmPassword}/>
                        </div>
                        <div className="input-list">
                            <div className={"row"}>
                                <div className={"col"}>
                                    <button className="button button-big account-btn btn w-100"
                                            onClick={(e)=>submitFormChangePassword(e)}
                                            type={"button"}>
                                        {addingUserLoading ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default UserSettingPage;


