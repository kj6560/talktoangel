if (location.href.substr(0, 5) !== 'https')
  location.href = 'https' + location.href.substr(4, location.href.length - 4)
console.log(location.href)
const socket = io()


let producer = null;

// nameInput.value = 'virsa' + Math.round(Math.random() * 1000)

socket.request = function request(type, data = {}) {
  return new Promise((resolve, reject) => {
    socket.emit(type, data, (data) => {
      if (data.error) {
        reject(data.error)
      } else {
        resolve(data)
      }
    })
  })
}






let rc = null
var na = null
var rm= null
function joinRoom(name, room_id) {
  if (rc && rc.isOpen()) {
    console.log('already connected to a room')
  } else {
    rc = new RoomClient(localMedia, remoteVideos, remoteAudios, window.mediasoupClient, socket, room_id, name, roomOpen)
    na = name
    rm = room_id


    
    addListeners()
  }

}
// 
const urlParams = new URLSearchParams(location.search)
const room = urlParams.get('room')
const user_name = urlParams.get('user')
joinRoom(user_name, room);

window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = '';
  if(rc != null){
  socket.request('browser_closed',{rm,na});
  }
});
function roomOpen() {
  // login.className = 'hidden'
  
  reveal(startAudioButton)
  hide(stopAudioButton)
  reveal(startVideoButton)
  hide(stopVideoButton)
  reveal(startScreenButton)
  hide(stopScreenButton)
  reveal(exitButton)
 //s control.className = ''
  reveal(videoMedia)
}

function hide(elem) {
  elem.classList.add('d-none')
}

function reveal(elem) {
  elem.classList.remove('d-none')
}


function addListeners() {
  rc.on(RoomClient.EVENTS.startScreen, () => {
    hide(startScreenButton)
    reveal(stopScreenButton)
    hide(control);
  })

  rc.on(RoomClient.EVENTS.stopScreen, () => {
    hide(stopScreenButton)
    reveal(startScreenButton)

  })

  rc.on(RoomClient.EVENTS.stopAudio, () => {
    hide(stopAudioButton)
    reveal(startAudioButton)

  })
  rc.on(RoomClient.EVENTS.startAudio, () => {
    hide(startAudioButton)
    reveal(stopAudioButton)
  })

  rc.on(RoomClient.EVENTS.startVideo, () => {
    hide(startVideoButton)
    reveal(stopVideoButton)
  })
  rc.on(RoomClient.EVENTS.stopVideo, () => {
    hide(stopVideoButton)
    reveal(startVideoButton)
  })
  rc.on(RoomClient.EVENTS.exitRoom, () => {
    //hide(control)
    reveal(login)
    hide(videoMedia)
  })
}
socket.on('mute_video',function(so_id){
  
  if(so_id==socket.id){
    rc.closeProducer(RoomClient.mediaType.video)
  }
});
socket.on('unmute_video',function(so_id){
  
  if(so_id==socket.id){
    rc.produce(RoomClient.mediaType.video, videoSelect.value)
  }
});

socket.on('mute',function(soa_id){
  console.log('mute audio of: '+soa_id);
  if(soa_id==socket.id){
    rc.closeProducer(RoomClient.mediaType.audio)
  }
});
socket.on('unmute',function(soa_id){
  console.log('unmute audio of: '+soa_id);
  if(soa_id==socket.id){
    rc.produce(RoomClient.mediaType.audio, audioSelect.value)
  }
});
socket.on('enable_screen',function(soa_id){
  console.log('enable screen share of: '+soa_id);
  if(soa_id==socket.id){
    rc.produce(RoomClient.mediaType.screen)
  }
});
socket.on('disable_screen',function(soa_id){
  console.log('disable screen share of: '+soa_id);
  if(soa_id==socket.id){
    rc.closeProducer(RoomClient.mediaType.screen)
  }
});
socket.on('pop_user',function(soa_id){
  console.log('poping user: '+soa_id);
  if(soa_id==socket.id){
    rc.exit();
  }
});
// Load mediaDevice options
navigator.mediaDevices.enumerateDevices().then(devices =>
  devices.forEach(device => {
    let el = null
    if ('audioinput' === device.kind) {
      el = audioSelect
    } else if ('videoinput' === device.kind) {
      el = videoSelect
    }
    if(!el) return

    let option = document.createElement('option')
    option.value = device.deviceId
    option.innerText = device.label
    el.appendChild(option)
  })
)