const os = require('os')

module.exports = {
    listenIp: '0.0.0.0',
    listenPort: 3000,
    sslCrt: '/etc/letsencrypt/live/talktocounsel.com/fullchain.pem',
  sslKey: '/etc/letsencrypt/live/talktocounsel.com/privkey.pem',
    
    mediasoup: {
      // Worker settings
      numWorkers : Object.keys(os.cpus()).length,
      worker: {
        rtcMinPort: 40000,
        rtcMaxPort: 49999,
        logLevel: 'warn',
        logTags: [
          'info',
          'ice',
          'dtls',
          'rtp',
          'srtp',
          'rtcp',
          // 'rtx',
          // 'bwe',
          // 'score',
          // 'simulcast',
          // 'svc'
        ],
      },
      // Router settings
      router: {
        mediaCodecs :
			[
				{
					kind      : 'audio',
					mimeType  : 'audio/opus',
					clockRate : 48000,
					channels  : 2
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP8',
					clockRate  : 90000,
					parameters :
					{
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP9',
					clockRate  : 90000,
					parameters :
					{
						'profile-id'             : 2,
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '4d0032',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '42e01f',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				}
			]
      },
    // WebRtcTransport settings
    webRtcTransport: {
      listenIps: [
        {
          ip: '172.31.1.72',
          announcedIp: '18.237.213.178',
        }
      ],
      maxIncomingBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000,
    },
    }
  };
  
