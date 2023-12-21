import fetch from 'node-fetch';
import fs from 'fs';

const videoUrl = 'https://v16-webapp-prime.tiktok.com/video/tos/alisg/tos-alisg-pve-0037c001/owiKEqGvhyvIZpCIqPty6Qie8bUBKVwAAxxNsA/?a=1988&ch=0&cr=3&dr=0&lr=unwatermarked&cd=0%7C0%7C0%7C&cv=1&br=2070&bt=1035&bti=ODszNWYuMDE6&cs=0&ds=6&ft=_RwJrB4vq8ZmobQ~ZQ_vjchv8AhLrus&mime_type=video_mp4&qs=0&rc=ZDdkO2g1OTc0ZzVlOWY1ZEBpM2k6NWs5cmQ2bzMzODczNEBjLzU1L19iXi8xMF8tNS9eYSNyMGdxMmRrcWpgLS1kMTFzcw%3D%3D&btag=e00090000&expire=1702772488&l=202312161820049A64D00CF45AD68ABF63&ply_type=2&policy=2&signature=08445c7db8bcec2f913797b628041c6e&tk=tt_chain_token';

const headers = {
  'accept': '*/*',
  'accept-language': 'en,de;q=0.9',
  'range': 'bytes=0-',
  'sec-ch-ua': '"Avast Secure Browser";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'video',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'cookie': 'perf_feed_cache=%7B%2522expireTimestamp%2522%3A1702922400000%252C%2522itemIds%2522%3A%5B%25227290248428024532230%2522%252C%25227299379266800700677%2522%252C%25227294643197542714629%2522%5D%7D; msToken=8XJdwmDjUsZUAYeCkX6x-ZrnV8uQ09go3VbwCBZrY2IhMWhF7EmvQu96uQBG2mkySgbaIMPga8KFdSGiWRPrpO5Tp6Ie5v-hAtJ2c77ceqqVwA5nvFLfVjybry07; s_v_web_id=verify_lq8dvche_4Wj0jENs_fp4F_48el_BQDR_AXCVVSBms4kv; passport_csrf_token_default=e8bd731309b8f10d3f46758155ad72cf; tt_csrf_token=0DXMez3M-8hKRO-rXn76H5nVRDw_NFGwJ5LI; tiktok_webapp_theme=light; passport_csrf_token=e8bd731309b8f10d3f46758155ad72cf; ttwid=1%257CpCjdLP544J6i71s9ngQf41qpJLhuFCXOi9ENzFnk9qc%257C1702750812%257C1872094d6d23b75718cbf6ec175681767b9c20c67dc2ff35d987fb91f8d1e0c4; msToken=vFNW2neiW5FGDlfbm9Ad4WK14ipXknvhwfWyE_uB_STXrL8K6ruGpGNdsYdBGYHf8cm4tISSWszVurXU4AtC-DE9MKehd3BbEVeb7szllQBtZXgUnc_5dRdIseaA; __tea_cache_tokens_1988=%7B%2522_type_%2522%3A%2522default%2522%252C%2522user_unique_id%2522%3A%25227313258971799651845%2522%252C%2522timestamp%2522%3A1702783182598%7D; tt_chain_token=Q1uHRHplCvnMnzsfEBw0VQ%3D%3D; odin_tt=cf092e13bbcb487e8c942bca3e3649a14b07e5129c5ec1877a3413c7fadbe4796b0dfb82f1a56b34d744952f8f96e7d4f766e376839d2ff741e29d30da11ed9f9a1cde2d72277db419c62e10a64eba51',  
  'Referer': 'https://www.tiktok.com/',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Use the fetch function to download the video
fetch(videoUrl, {
  method: 'GET',
  headers: headers,
})
  .then(response => {
    // Check if the response status is OK (200)
    if (response.ok) {
      // Create a write stream to save the video
      const writeStream = fs.createWriteStream('downloaded_video.mp4');

      // Pipe the response body (video stream) to the write stream
      response.body.pipe(writeStream);

      // Close the write stream when the download is complete
      writeStream.on('finish', () => {
        console.log('Video downloaded successfully.');
      });

      // Handle errors during the download
      writeStream.on('error', err => {
        console.error('Error downloading video:', err);
      });
    } else {
      console.error('Failed to fetch video. Status:', response.status);
    }
  })
  .catch(error => {
    console.error('Error during fetch:', error);
  });
