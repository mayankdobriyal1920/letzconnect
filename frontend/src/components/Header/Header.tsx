import './Header.css';
import {IonHeader} from '@ionic/react';
import siteLogo from '../../theme/images/logo.png';
import menuIcon from '../../theme/images/hamburger-icon.svg';
import { useHistory } from "react-router-dom";
import {_getImageUrlByName, _getUserFirstName} from "../../helpers/common";
import {INCALL, useCallState} from "../../CallProvider";

const Header = (props:any) => {
    let history = useHistory();
    const goToThisPage = (page:any) =>{
        history.push(`/app/${page}`);
    }
    const { view }:any = useCallState();

    return (
        <IonHeader>
            <div className="header">
                <div className="top-profile">
                    <div className="profile-img" style={{textAlign:'center'}}>
                        <a className="avatar">
                            {(props.avatar) ?
                                <img alt={""} src={_getImageUrlByName(props.avatar)}/>
                                :
                                <>
                                    {_getUserFirstName(props.title)}
                                </>
                            }
                        </a>
                        <div className='profile_title' style={{color: '#fff',fontSize: '11px',fontWeight: 600}}>{props.title}</div>
                    </div>
                    <img src={siteLogo} width="70px"/>
                    <div className="search">
                        {(view != INCALL) ?
                            <a onClick={()=>goToThisPage('menu')}>
                                <img src={menuIcon} alt=""/>
                            </a>
                            :''}
                    </div>
                </div>
            </div>
        </IonHeader>
    );
};

export default Header;
      
      
      