import {IonAlert, IonContent, IonPage, IonToast} from '@ionic/react';
import {useDispatch, useSelector} from 'react-redux';
import SubHeader from '../../components/Header/SubHeader';
import {useState} from "react";
import {actionToDeleteUserData, actionToEditNewUserData} from "../../actions/UserAction";
import {_getUserFirstName} from "../../helpers/common";
import { useHistory } from "react-router-dom";

const AllUserListPage = () => {
    const allUsersDataArray = useSelector((state) => state.allUsersDataArray);
    const userInfo = useSelector((state) => state.userSignin.userInfo);
    const [editUserData,setEditUserData] = useState({});
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [about,setAbout] = useState('');
    const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(false); 
    const [showDeleteToast, setShowDeleteToast] = useState(false); 
    const [addingUserLoading, setAddingUserLoading] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState('');

    const [emailAlreadyExistToast, setEmailAlreadyExistToast] = useState(false);
    let history = useHistory();

  const submitFormEditUser = (e) =>{ 
      e.preventDefault();
      if(addingUserLoading) return;
      if(name?.trim()?.length && email?.trim()?.length){


          if(allUsersDataArray.length){
              allUsersDataArray.map((user)=>{
                  if(user.email.toLowerCase() == email.toLowerCase() && user.id != editUserData.id){
                      setEmailAlreadyExistToast(true);
                      return false;
                  }
              })
          }

          let payload = {
              id:editUserData.id,
              name:name,
              email:email,
              description:about,
              created_by: editUserData.created_by,
              avatar:editUserData.avatar,
              isAdmin:editUserData.isAdmin,
          }
          setAddingUserLoading(true);
          dispatch(actionToEditNewUserData(payload));
          setTimeout(function (){
              setShowToast(true);
              setEmail('');
              setName('');
              setAbout('');
              setEditUserData({});
              setAddingUserLoading(false);
          },500);
      }
      return false;
  }

 const deleteUserData = ()=>{
     dispatch(actionToDeleteUserData(deleteUserId));
     setShowDeleteAlert(false);
     setDeleteUserId('');
     setShowDeleteToast(true);
 }

  const callFunctionToOpenDeleteAlert = (id) =>{
      setShowDeleteAlert(true);
      setDeleteUserId(id);
  }
  const setEditUserDataFunction = (user) =>{
      setName(user.name);
      setEmail(user.email);
      setAbout(user.about);
      setEditUserData(user);
  }

  const showUserProfilePage = (key) =>{
      history.push('/app/member-profile/'+key);
  }


  const UserDataComponent = (props) =>{
    let user = props.user;
    let key = props.userKey;
    return(
        <div className="col-6 pr-2">
          <div className="widget-bg">
              <div className="profile-img">
                  <a onClick={()=>showUserProfilePage(key)} className="avatar">
                    {_getUserFirstName(user.name)}
                  </a>
              </div>
              <div className="profile-action">
                  <a href="#" data-toggle="dropdown" aria-expanded="false" className="link dropdown-link"><i className="fas fa-ellipsis-v"></i></a>
                  <div className="dropdown-menu dropdown-menu-right header_drop_icon">
                      <a onClick={()=>setEditUserDataFunction(user)} className="dropdown-item">Edit</a>
                      <a className="dropdown-item" onClick={()=>callFunctionToOpenDeleteAlert(user.id)}>Delete</a>
                  </div>
              </div>
              <h4 onClick={()=>showUserProfilePage(key)} className="user-name text-ellipsis"><a>{user.name}</a></h4>
              <div onClick={()=>showUserProfilePage(key)} className="user-role">{user.description}</div>
          </div>
        </div>
    )
  }

  const renderAllUserHtml = (users) =>{

    let userData = [];
    users.map((user,key)=>{
        if(user.id != userInfo.id) {
            userData.push(<UserDataComponent user={user} userKey={key} key={user.id}/>);
        }
    })

    return userData;
  }

  return (
    <IonPage>
      <SubHeader title={'All Users'}/>
      <IonContent fullscreen>
          <IonToast
              isOpen={emailAlreadyExistToast}
              onDidDismiss={() => setShowToast(false)}
              message="This email already exist!"
              duration={3000}
          />
          <IonAlert
              isOpen={showDeleteAlert}
              onDidDismiss={()=>setShowDeleteAlert(false)}
              header={'Confirm!'}
              message="Are You sure to delete this user?"
              buttons={[
                  {
                      text: 'No',
                      role: 'cancel',
                      cssClass: 'secondary',
                      handler: () => setShowDeleteAlert(false)
                  }, {
                      text: 'Yes',
                      handler: () => deleteUserData()
                  }
              ]}
          />
          <IonToast
              isOpen={showToast}
              onDidDismiss={() => setShowToast(false)}
              message="User Updated successfully!"
              duration={3000}
          />
          <IonToast
              isOpen={showDeleteToast}
              onDidDismiss={() => setShowDeleteToast(false)}
              message="User Deleted successfully!"
              duration={3000}
          />
      <div className="chat-list-col">
        <div className='container user_list_container'>
            <div className="row">
              {(allUsersDataArray?.length) ?
                <>
                  {renderAllUserHtml(allUsersDataArray)}  
                </>:''
              }
           </div>
        </div>
       </div>

          {(Object.keys(editUserData).length) ?
              <div className={"edit_user_col"}>
                  <div className="chat-list-col">
                      <div className="container">
                          <div className="account-content">
                              <div className="account-form">
                                  <form onSubmit={submitFormEditUser}>
                                      <div className="input-list">
                                          <input type="text" placeholder="Name" onChange={(e)=>setName(e.target.value)} required value={name}/>
                                      </div>
                                      <div className="input-list">
                                          <input type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required value={email}/>
                                      </div>
                                      <div className="input-list">
                                          <textarea className="input2" onChange={(e)=>setAbout(e.target.value)} name="message" placeholder="About" value={about}></textarea>
                                      </div>
                                      <div className="input-list">
                                          <div className={"row"}>
                                              <div className={"col"}>
                                                  <button className="button button-big account-btn btn w-100" onClick={()=>setEditUserData({})} type={"button"}>
                                                      Cancel
                                                  </button>
                                              </div>
                                              <div className={"col"}>
                                                  <button className="button button-big account-btn btn w-100" type={"submit"}>
                                                      {addingUserLoading ? 'Updating...' : 'Update'}
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  </form>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              :''
          }

      </IonContent>
    </IonPage>
  );
};

export default AllUserListPage;


