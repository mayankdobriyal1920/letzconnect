
import moment from 'moment'
import $ from 'jquery';

export const _getUniqueId = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 9);
};
export const _getUserFirstName = (name) => {
    return name.substring(0,1).toUpperCase();
}

export const _readableTimeFromSeconds = (sec) => {
    /**
     * Conditionally pads a number with "0"
     */
    const _padNumber = number =>  (number > 9) ? number : "" + number;
    let timer = '';
    let seconds = parseInt(sec);
    if(seconds && seconds >= 0) {
        seconds = Number(seconds);
        const hours = 3600 > seconds ? 0 : parseInt(seconds / 3600, 10);
        let h = _padNumber(hours);
        if (h > 0)
            timer += h+'h ';
        let m = _padNumber(parseInt(seconds / 60, 10) % 60);
        if(m > 0)
            timer += m+'m ';
        let s = _padNumber(seconds % 60);
        if(s > 0)
            timer += s+'s ';
    }else{
        timer = 0+'s ';
    }
    return timer;
}
export const _formatDateTime = (date)=> {
    return moment(new Date(date)).format('D, MMMM YYYY hh:mmA');
}
export const _fromNow = (date,currentDateTime = null)=> {
    if (typeof date !== 'object') {
        date = new Date(date);
    }
    if(currentDateTime == null){
        currentDateTime = new Date();
    }
    let seconds = Math.floor((currentDateTime - date) / 1000);
    let intervalType;

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'Y';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'M';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'D';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "H";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "M";
                    } else {
                        interval = '';
                        intervalType = "Now";
                    }
                }
            }
        }
    }
    return interval+intervalType;
}
export const _getImageUrlByName = (name)=> {
 return `//letzconnects.com/api/image/`+name;
}

let peers = {};
export const removeClosePeerConnection=(id)=> {
    if(peers[id])
        peers[id].close();
    if($(`#AUDIO-${id}`).length){
        $(`#AUDIO-${id}`).remove();
    }
}

export const addAudioStream=(audio, stream)=> {
    console.log('[ USER STREAM ]',audio);
    audio.srcObject = stream;
    audio.setAttribute('autoPlay',true);
    audio.setAttribute('playsInline',true);
    audio.setAttribute('controls',true);
    if($(`#${audio.id}`).length){
        $(`#${audio.id}`).remove();
    }
    document.getElementById('userAudioSectionId').appendChild(audio)
}
export const connectToNewUser=(user,stream,myPeer,members)=> {
    console.log('[ NEW USER CONNECTED TO CALL]',user);
    const call = myPeer.call(user.peer_id,stream);
    const audio = document.createElement('audio');
    call.on('stream', userStream => {
        console.log('call.peer',call.peer);
        audio.id = `AUDIO-${getUserIdFromPeerConnection(call.peer)}`;
        members?.map((user)=>{
            if(user?.id == getUserIdFromPeerConnection(call.peer) && !user.audio){
                audio.muted = true;
            }
        })
        addAudioStream(audio, userStream)
    })
    call.on('close', () => {
        audio.remove()
    })
    peers[user.id] = call;
}
export const getUserIdFromPeerConnection = (peerId) =>{
    console.log('peerId',peerId);
    if(peerId?.indexOf('PEERjs') >= 0){
        return peerId?.split('PEERjs')[0];
    }
}