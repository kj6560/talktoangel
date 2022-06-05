<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <div class="container">
            <div id="login">
                <br />
                <i class="fas fa-server"> Room: </i><input id="roomidInput" value="123" type="text" />
                <!--<button id="createRoom" onclick="createRoom(roomid.value)" label="createRoom">Create Room</button>-->
                <i class="fas fa-user"> User: </i><input id="nameInput" value="user" type="text" />
                <button id="joinButton" onclick="joinRoom(nameInput.value, roomidInput.value)">
                    <i class="fas fa-sign-in-alt"></i> Join
                </button>
            </div>
        </div>

        <div class="container">
            <div id="control" class="hidden">
                <br />
                <button id="exitButton" class="hidden" onclick="rc.exit()">
                    <i class="fas fa-arrow-left"></i> Exit
                </button>
                <button id="copyButton" class="hidden" onclick="rc.copyURL()">
                    <i class="far fa-copy"></i> copy URL
                </button>
                <button id="devicesButton" class="hidden" onclick="rc.showDevices()">
                    <i class="fas fa-cogs"></i> Devices
                </button>
                <button
                    id="startAudioButton"
                    class="hidden"
                    onclick="rc.produce(RoomClient.mediaType.audio, audioSelect.value)"
                >
                    <i class="fas fa-volume-up"></i> Open audio
                </button>
                <button id="stopAudioButton" class="hidden" onclick="rc.closeProducer(RoomClient.mediaType.audio)">
                    <i class="fas fa-volume-up"></i> Close audio
                </button>
                <button
                    id="startVideoButton"
                    class="hidden"
                    onclick="rc.produce(RoomClient.mediaType.video, videoSelect.value)"
                >
                    <i class="fas fa-camera"></i> Open video
                </button>
                <button id="stopVideoButton" class="hidden" onclick="rc.closeProducer(RoomClient.mediaType.video)">
                    <i class="fas fa-camera"></i> Close video
                </button>
                <button id="startScreenButton" class="hidden" onclick="rc.produce(RoomClient.mediaType.screen)">
                    <i class="fas fa-desktop"></i> Open screen
                </button>
                <button id="stopScreenButton" class="hidden" onclick="rc.closeProducer(RoomClient.mediaType.screen)">
                    <i class="fas fa-desktop"></i> Close screen
                </button>
                <br /><br />
                <div id="devicesList" class="hidden">
                    <i class="fas fa-microphone"></i> Audio:
                    <select id="audioSelect" class="form-select" style="width: auto"></select>
                    <br />
                    <i class="fas fa-video"></i> Video:
                    <select id="videoSelect" class="form-select" style="width: auto"></select>
                </div>
                <br />
            </div>
        </div>

        <div class="container">
            <div id="videoMedia" class="hidden">
                <h4><i class="fab fa-youtube"></i> Local media</h4>
                <div id="localMedia" class="containers">
                    <!--<video id="localVideo" autoplay inline class="vid"></video>-->
                    <!--<video id="localScreen" autoplay inline class="vid"></video>-->
                </div>
                <br />
                <h4><i class="fab fa-youtube"></i> Remote media</h4>
                <div id="remoteVideos" class="containers"></div>
                <div id="remoteAudios"></div>
            </div>
        </div>
            </div>
        </div>
    </div>
</x-app-layout>
