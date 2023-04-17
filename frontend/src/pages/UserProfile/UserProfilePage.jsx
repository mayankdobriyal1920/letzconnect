
import {IonContent, IonPage, IonToast} from '@ionic/react';
import { useSelector,useDispatch } from 'react-redux';
import SubHeader from '../../components/Header/SubHeader';
import {useState} from "react";
import {actionToEditNewUserData, actionToUploadImageProfileData} from "../../actions/UserAction";
import {_getImageUrlByName, _getUniqueId, _getUserFirstName} from "../../helpers/common";
import $ from 'jquery';
import ProfileImageCrop from "../../components/ProfileImageCrop";

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const {userInfo} = useSelector((state) => state.userSignin);
  const [name,setName] = useState(userInfo.name);
  const [email,setEmail] = useState(userInfo.email);
  const [about,setAbout] = useState(userInfo.about);
  const [editUserMode,setEditUserMode] = useState(false);
  const [addingUserLoading, setAddingUserLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [emailAlreadyExistToast, setEmailAlreadyExistToast] = useState(false);
  const [upImg, setUpImg] = useState(null);
  const allUsersDataArray = useSelector((state) => state.allUsersDataArray);

    const submitFormEditUser = (e) =>{
        e.preventDefault();
        if(addingUserLoading) return;
        if(name?.trim()?.length && email?.trim()?.length){
            if(allUsersDataArray.length){
                allUsersDataArray.map((user)=>{
                    if(user.email.toLowerCase() == email.toLowerCase() && user.id != userInfo.id){
                        setEmailAlreadyExistToast(true);
                        return false;
                    }
                })
            }
            let payload = {
                id:userInfo.id,
                name:name,
                email:email,
                description:about,
                avatar:userInfo.avatar,
                isAdmin:userInfo.isAdmin,
            }
            setAddingUserLoading(true);
            dispatch(actionToEditNewUserData(payload));
            setTimeout(function (){
                setEditUserMode(false);
                setAddingUserLoading(false);
            },500);
        }
        return false;
    }

    const chooseImagePopup = ()=>{
        $("#choose-user-profile-image-input").click();
    }

    const chooseImagePopupOnChange = (target)=>{
        const files = target.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.addEventListener('load', () => setUpImg(reader.result));
            target.value = '';
        }
    }
    const loadFile = (imgBlob) => {
        if(imgBlob!=''){
            const reader = new FileReader();
            reader.readAsDataURL(imgBlob);
            reader.addEventListener('load', () => compressSaveProfileImage(reader.result));
            setUpImg(null);
        }
    };

    const compressSaveProfileImage = (userProfileImage) => {
        let payload = {
            id:userInfo.id,
            name:userInfo.name,
            email:userInfo.email,
            description:userInfo.about,
            avatar:userInfo.avatar,
            isAdmin:userInfo.isAdmin,
        }
        setAddingUserLoading(true);
        let finalFile = dataURLtoFile(userProfileImage,userInfo.name, 'png');
        let fileName = _getUniqueId()+'-'+_getUniqueId()+'.png';
        const formData = new FormData();
        formData.append("image", finalFile);
        formData.append("fileName", fileName);
        dispatch(actionToUploadImageProfileData(formData,payload));
    }

    function dataURLtoFile(dataurl, filename, blobType) {
        var arr = dataurl.split(','),
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {lastModified: new Date().getTime(), type: blobType});
    }


  return (
    <IonPage>
      <SubHeader title={'Profile'}/>
        <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message="User Updated successfully!"
            duration={3000}
        />
        <IonToast
            isOpen={emailAlreadyExistToast}
            onDidDismiss={() => setShowToast(false)}
            message="This email already exist!"
            duration={3000}
        />
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
                                  <div className={"user_avatar_edit_inner_input_section"}>
                                      <input style={{display:'none'}} accept="image/png, image/jpeg" onChange={(e)=>chooseImagePopupOnChange(e.target)} type="file" id="choose-user-profile-image-input" name="choose-user-profile-image-input" />
                                      <button type="button" onClick={chooseImagePopup}>Change Profile</button>
                                  </div>
                                  <div className="input-list">
                                      {!editUserMode ?
                                        <input type="text" placeholder="Name" onChange={(e)=>setName(e.target.value)} required value={name} readOnly={true}/>
                                        :
                                        <input type="text" autoFocus={true} placeholder="Name" onChange={(e)=>setName(e.target.value)} required value={name}/>
                                      }
                                      </div>
                                  <div className="input-list">
                                      {!editUserMode ?
                                          <input type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required value={email}  readOnly={true}/>
                                         :
                                          <input type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required value={email}/>
                                      }
                                      </div>
                                  <div className="input-list">
                                      {!editUserMode ?
                                        <textarea className="input2" onChange={(e)=>setAbout(e.target.value)} name="message" placeholder="About" value={about}  readOnly={true}></textarea>
                                        :
                                        <textarea className="input2" onChange={(e)=>setAbout(e.target.value)} name="message" placeholder="About" value={about}></textarea>

                                      }
                                  </div>
                                  <div className="input-list">
                                      <div className={"row"}>
                                          <div className={"col"}>
                                              {(!editUserMode) ?
                                                 <button className="button button-big account-btn btn w-100" onClick={()=>setEditUserMode(true)} type={"button"}>
                                                     Edit
                                                 </button>
                                                  :
                                                 <button className="button button-big account-btn btn w-100"
                                                         onClick={(e)=>submitFormEditUser(e)}
                                                         type={"button"}>
                                                    {addingUserLoading ? 'Updating...' : 'Update'}
                                                 </button>
                                              }
                                          </div>
                                      </div>
                                  </div>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
              {(upImg != null) ?
                  <ProfileImageCrop upImg={upImg} setUpImg={setUpImg} loadFile={loadFile}/>
                  : ''
              }
          </div>
      </IonContent>
    </IonPage>
  );
};

export default UserProfilePage;


