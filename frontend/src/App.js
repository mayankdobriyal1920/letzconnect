import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
    IonApp,
    setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useSelector,useDispatch } from 'react-redux';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

// bootstrap class and js
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/css/main.css';
import './theme/css/style23.css';
import './theme/css/all.min.css';
import './theme/css/fontawesome.css';
import './theme/css/fontawesome.min.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login/Login';
import { isLogin } from './middlewear/auth';
import { CallProvider } from './CallProvider';
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage';
import AllUserListPage from './pages/AllUserList/AllUserListPage';
import UserDashboardPage from './pages/UserDashboard/UserDashboardPage';
import UserProfilePage from './pages/UserProfile/UserProfilePage';
import UserSettingPage from './pages/UserSetting/UserSettingPage';
import AddUserPage from './pages/AddEditUser/AddUserPage';
import CallLogPage from './pages/CallHistory/CallLogPage';
import CallLogDetails from "./pages/CallHistory/CallLogDetails";
import HelpAndSupportPage from "./pages/HelpAndSupport/HelpAndSupportPage";
import EditImagePage from "./pages/AddEditUser/EditImagePage";
import ForgotPasswordPage from "./pages/Login/ForgotPasswordPage";
import NavigationMenuPage from "./pages/NavigationMenu/NavigationMenuPage";
import MemberProfilePage from "./pages/AddEditUser/MemberProfilePage";
import AllAdminListPage from "./pages/AllAdminList/AllAdminListPage";
import AdminMemberProfilePage from "./pages/AddEditUser/AdminMemberProfilePage";
import AppHomePage from "./pages/AppHomePage";
import { Capacitor } from '@capacitor/core';
import {getWebsocketConnectedMessage} from "./actions/helpers/WebSocketHelper";
import {getCallSocketConnectedMessage} from "./actions/helpers/CallSocketHelper";


export const MOD = "MOD";
export const SPEAKER = "SPK";
export const LISTENER = "LST";

setupIonicReact();

const PrivateRoutes = () => {
    return (
        <IonReactRouter>
            <Route path="/app/forgot-password" component={ForgotPasswordPage}/>
            <Route path="/app/login" component={Login}/>
            <Route path="/app/" render={() => <Redirect to="/app/login"/>}/>
            {(Capacitor.isNativePlatform()) ?
                <Route path="/" exact={true} component={Login} />
                :
                <Route path="/" exact={true} component={AppHomePage} />
            }
        </IonReactRouter>
    );
};
const PublicRoutes = () => {
    const {userInfo} = useSelector((state) => state.userSignin);
    return (
        <IonReactRouter>
            {(userInfo.isAdmin) ? (
                    <>
                        <Route path="/app/dashboard" component={AdminDashboardPage} />
                        <Route path="/app/user-list" component={AllUserListPage} />
                        <Route path="/app/admin-list" component={AllAdminListPage} />
                        <Route path="/app/add-user" component={AddUserPage} />
                        <Route path="/app/call-log" component={CallLogPage} />
                        <Route path="/app/help-support" component={HelpAndSupportPage} />
                        <Route path="/app/call-log-details/:key" component={CallLogDetails} />
                        <Route path="/app/user-profile" component={UserProfilePage} />
                        <Route path="/app/user-setting" component={UserSettingPage} />
                        <Route path="/app/image-edit" component={EditImagePage} />
                        <Route path="/app/member-profile/:key" component={MemberProfilePage} />
                        <Route path="/app/admin-member-profile/:key" component={AdminMemberProfilePage} />
                        <Route path="/app/menu" component={NavigationMenuPage} />
                        <Route path="/app/" render={() => <Redirect to="/app/dashboard" />} />
                        {(Capacitor.isNativePlatform()) ?
                            <Route path="/" exact={true} component={AdminDashboardPage} />
                            :
                            <Route path="/" exact={true} component={AppHomePage} />
                        }
                    </>
                ):
                <>
                    <Route path="/app/user-profile" component={UserProfilePage} />
                    <Route path="/app/user-setting" component={UserSettingPage} />
                    <Route path="/app/dashboard" component={UserDashboardPage} />
                    <Route path="/app/help-support" component={HelpAndSupportPage} />
                    <Route path="/app/image-edit" component={EditImagePage} />
                    <Route path="/app/menu" component={NavigationMenuPage} />
                    <Route path="/app/" render={() => <Redirect to="/app/dashboard" />} />
                    {(Capacitor.isNativePlatform()) ?
                        <Route path="/" exact={true} component={UserDashboardPage} />
                        :
                        <Route path="/" exact={true} component={AppHomePage} />
                    }
                </>
            }
        </IonReactRouter>
    );
};


const App = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        getWebsocketConnectedMessage(W3CWebSocket,dispatch);
        getCallSocketConnectedMessage(W3CWebSocket,dispatch);
    }, []);
    return (
        <IonApp>
            <CallProvider>
                <div className="main-wrapper chat-bg">
                    {(isLogin()) ? <PublicRoutes /> : <PrivateRoutes />}
                </div>
            </CallProvider>
        </IonApp>
    )
}

export default App;
