import React,{useEffect,useState,useRef, useCallback} from 'react';
import { useDispatch } from 'react-redux';
import ReactCrop from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';
import 'react-image-crop/dist/ReactCrop.css';
import Modal from 'react-bootstrap/Modal';

const ProfileImageCrop=(props)=>{
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [crop, setCrop] = useState({"x":0,"y":0,"width":100,"height":100,"unit":"px","aspect":1});
    const [completedCrop, setCompletedCrop] = useState(null);;
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false);
    const onLoad = useCallback((img) => {
        imgRef.current = img;
    }, []);

    useEffect(() => {
        if(props.upImg!='')
            setCrop({"x":0,"y":0,"width":100,"height":100,"unit":"px","aspect":1});
    },[props.upImg]);

    useEffect(() => {
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );
    }, [completedCrop]);


    const generateDownload = (canvas, crop) => {
        if (!crop || !canvas)
            return;
        canvas.toBlob(
            (blob) => {
                props.loadFile(blob, blob.type);
                closePopup();
            },
            'image/png',
            1
        );
    }
    const closePopup = () => {
        props.setUpImg(null);
        setModalOpen(false);
    }
    useEffect(() => {
        setModalOpen(true);
    },[]);
    return(
        <Modal id="profile_image_crop" show={modalOpen} dialogClassName="upload_ui_modal_main modal-custome-ctr-style deletealert_modal_ctrl Addsublabel_popup react-modal-centered">
            <Modal.Header>
                <button type="button" onClick={closePopup} className="close close_bg_on_hover closeModalDismissPopup">×</button>
                <div className="alert_modal_label">
                    <h4 className="modal-title text-center">Set profile picture</h4>
                </div>
            </Modal.Header>
            <Modal.Body className="text-center">
                <ReactCrop
                    src={props.upImg}
                    onImageLoaded={onLoad}
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                />
                <canvas ref={previewCanvasRef} style={{ display:'none',width: Math.round(completedCrop?.width ?? 0), height: Math.round(completedCrop?.height ?? 0)}} />
            </Modal.Body>
            <Modal.Footer>
                {crop.width!=undefined && crop.width==0 ? <div>Select the area.</div> : '' }
                {crop.width!=undefined && crop.width < 50 ? <div>Must be at least 50px by 50px</div> : '' }
                <button type="button" onClick={closePopup} className="btn btn-default dismiss_modal"> Cancel </button>
                <button type="button" disabled={crop.width!=undefined && crop.width < 50 ? "disable" : ""} className="btn btn-success change_password" onClick={() => generateDownload(previewCanvasRef.current, completedCrop)} >Crop & Update</button>
            </Modal.Footer>
        </Modal>
    );
}
export default ProfileImageCrop;