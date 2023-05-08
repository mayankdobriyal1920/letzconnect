import {IonContent,IonPage,IonToast} from '@ionic/react';
import SubHeader from '../../components/Header/SubHeader';
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector,RootStateOrAny} from 'react-redux';
import {actionToAddNewUserData} from "../../actions/UserAction";
import {_getUniqueId} from "../../helpers/common";
const AddUserPage = () => {
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [userName,setUserName] = useState('');
    const [password,setPassword] = useState('');
    const [about,setAbout] = useState('');
    const [isAdmin,setIsAdmin]:any = useState(0);
    const [isSuperAdmin,setIsSuperAdmin]:any = useState(0);
    const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(false);
    const [emailAlreadyExistToast, setEmailAlreadyExistToast] = useState(false);
    const [addingUserLoading, setAddingUserLoading] = useState(false);
    const allUsersDataArray = useSelector((state:RootStateOrAny) => state.allUsersDataArray);
    const userInfo = useSelector((state:RootStateOrAny) => state.userSignin.userInfo);

    const validateUpdateForm = ()=>{
        if(!name?.trim()?.length || !userName?.trim()?.length || !password?.trim()?.length){
            return false;
        }
        return true;
    }

    const submitFormAddUser = (e:any)=>{
        e.preventDefault();
        if(addingUserLoading) return;
        if(name?.trim()?.length && userName?.trim()?.length && password?.trim()?.length){
            if(allUsersDataArray.length){
                allUsersDataArray.map((user:any)=>{
                    if(user.email.toLowerCase() == userName.toLowerCase()){
                        setEmailAlreadyExistToast(true);
                        return false;
                    }
                })
            }

            let createdBy = isAdmin ? 0 : userInfo.id;

            let payload = {
                id:_getUniqueId()+'-'+_getUniqueId()+'-'+_getUniqueId()+'-'+_getUniqueId(),
                name:name,
                email:userName.toLowerCase(),
                password:password,
                description:about,
                created_by:createdBy,
                isAdmin:isAdmin,
                isSuperAdmin:isSuperAdmin,
                member_count:0,
            }
            setAddingUserLoading(true);
            dispatch(actionToAddNewUserData(payload));
            setTimeout(function (){
                setShowToast(true);
                setEmail('');
                setName('');
                setPassword('');
                setAbout('');
                setUserName('');
                setIsAdmin(0);
                setIsSuperAdmin(0);
                setAddingUserLoading(false);
            },500);
        }
        return false;
    }


    const callFunctionToSetIsAdmin=(value:any)=>{
        setIsAdmin(value);
        if(Number(value) !== 1){
            setIsSuperAdmin(value);
        }
    }
    const callFunctionToSetIsSuperAdmin=(value:any)=>{
        setIsSuperAdmin(value);

        if(Number(value) === 1){
            setIsAdmin(value);
        }
    }

    return (
        <IonPage>
            <SubHeader title={'Add User'}/>
            <IonContent fullscreen>
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="New Member added successfully!"
                    duration={3000}
                />
                <IonToast
                    isOpen={emailAlreadyExistToast}
                    onDidDismiss={() => setEmailAlreadyExistToast(false)}
                    message="This User Name already exist!"
                    duration={3000}
                />
                <div className="chat-list-col">
                    <div className="container">
                        <div className="account-content">
                            <div className="add_user_inner">
                                <form onSubmit={submitFormAddUser}>
                                    <div className="input-list">
                                        <input type="text" placeholder="Name" onChange={(e)=>setName(e.target.value)} required value={name}/>
                                    </div>
                                    <div className="input-list">
                                        <input type="text" onChange={(e)=>setUserName(e.target.value)} placeholder="User Name" required value={userName}/>
                                    </div>
                                    <div className="input-list">
                                        <input type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required value={email}/>
                                    </div>
                                    <div className="input-list">
                                        <input type="text" onChange={(e)=>setPassword(e.target.value)} placeholder="Password" required value={password}/>
                                    </div>
                                    <div className="input-list">
                                        <textarea className="input2" onChange={(e)=>setAbout(e.target.value)} name="message" placeholder="About" value={about}></textarea>
                                    </div>
                                    {(userInfo?.isSuperAdmin) ?
                                        <>
                                            <div className="input-list is_admin_select_option">
                                                <label>Is Admin :</label>
                                                <select value={isAdmin} onChange={(e) => callFunctionToSetIsAdmin(e.target.value)}>
                                                    <option value={0}>No</option>
                                                    <option value={1}>Yes</option>
                                                </select>
                                            </div>
                                            <div className="input-list is_admin_select_option">
                                                <label>Is Super Admin :</label>
                                                <select value={isSuperAdmin} onChange={(e) => callFunctionToSetIsSuperAdmin(e.target.value)}>
                                                    <option value={0}>No</option>
                                                    <option value={1}>Yes</option>
                                                </select>
                                            </div>
                                        </>
                                        : ''
                                    }
                                    <div className="input-list">
                                        <button className="button button-big account-btn btn w-100" type={"submit"}
                                                disabled={!validateUpdateForm()}
                                        >
                                            {addingUserLoading ? 'Adding...' : 'Add'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AddUserPage;


