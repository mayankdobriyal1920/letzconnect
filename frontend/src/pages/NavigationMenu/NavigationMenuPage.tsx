import {IonAlert, IonContent, IonPage} from '@ionic/react';
import logo from '../../theme/images/logo.png';
import { useHistory } from "react-router-dom";
import {signout} from "../../actions/UserAction";
import {useDispatch, useSelector,RootStateOrAny} from 'react-redux';
import {useState} from "react";

const NavigationMenuPage = () => {
    let history = useHistory();
    const dispatch = useDispatch();
    const {userInfo} = useSelector((state:RootStateOrAny) => state.userSignin);
    const [showLogoutAlert,setShowLogoutAlert] = useState(false);

    const goToThisPage = (page:any) =>{
        history.push(`/app/${page}`);
    }
    const logoutFunctionCall = () =>{
        dispatch(signout());
    }
    return (
        <IonPage>
            <IonContent fullscreen>
                <IonAlert
                    isOpen={showLogoutAlert}
                    onDidDismiss={()=>setShowLogoutAlert(false)}
                    header={'Confirm!'}
                    message="Are You sure to logout from app?"
                    buttons={[
                        {
                            text: 'No',
                            role: 'cancel',
                            cssClass: 'secondary',
                            handler: () => setShowLogoutAlert(false)
                        }, {
                            text: 'Yes',
                            handler: () => logoutFunctionCall()
                        }
                    ]}
                />
                <div className="menu-container-nav">
                    <div className="container">
                        <div onClick={()=>history.goBack()} className="vmenu-close-bt">
                            <i className="fas fa-times"></i>
                        </div>
                        <div className="account-content">
                            <div onClick={()=>document.location = '/'} className="login-icon">
                                <div className="vmenu-top-icon">
                                    <div className="vinner-top-icon">
                                        <img src={logo} alt=""/>
                                    </div>
                                </div>
                            </div>
                            <div className="app-vertically-menu">
                                <ul className="form">
                                    {(userInfo.isAdmin) ?
                                        <>
                                            <li>
                                                <a onClick={() => goToThisPage('call-log')} className="profile">
                                                    <i className="fas fa-phone-square-alt"></i>
                                                    Call Logs
                                                </a>
                                            </li>
                                            <li>
                                                <a onClick={() => goToThisPage('add-user')} className="profile">
                                                    <i className="fas fa-user-plus"></i>
                                                    Add User
                                                </a>
                                            </li>
                                            <li>
                                                <a className="profile" onClick={() => goToThisPage('user-list')}>
                                                    <i className="fas fa-users"></i>
                                                    All Users
                                                </a>
                                            </li>
                                        </> : ''
                                    }
                                    <li>
                                        <a onClick={() => goToThisPage('user-profile')} className="profile">
                                            <i className="fa fa-user-circle"></i>
                                            Profile
                                        </a>
                                    </li>
                                    <li>
                                        <a onClick={() => goToThisPage('user-setting')} className="profile">
                                            <i className="fa fa-key"></i>
                                            Change Password
                                        </a>
                                    </li>
                                    <li>
                                        <a className="settings" onClick={() => goToThisPage('help-support')}>
                                            <i className="fa fa-question-circle"></i>
                                            Help / Support
                                        </a>
                                    </li>
                                    <li>
                                        <a className="logout" onClick={()=>setShowLogoutAlert(true)}>
                                            <i className="fas fa-sign-out-alt"></i>
                                            Logout
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default NavigationMenuPage;


