import getS3 from '../../libs/s3Helper';
import auth from '../../libs/auth';

export default async function handler(req, res) {
  const {videoId, token} = req.body;

  if (!auth.verify(token)) {
    res.status(200).json({success: false, invalidToken: true});
    return;
  }

  const bucket = process.env.DO_SPACE_BUCKET;
  const key = "db.json";
  const s3 = getS3();

  let dbContent = null;
  try {
    const getResult = await s3.getObject({
      Bucket: bucket,
      Key: key,
    }).promise();
    dbContent = JSON.parse(getResult.Body.toString('utf-8'));
  } catch (e) {
    res.status(200).json({success: false});
  }

  const toDeleteVideo = dbContent.videos.find((video) => {
    return video.id === videoId;
  });

  if (!toDeleteVideo) {
    res.status(200).json({success: false});
    return;
  }

  dbContent.videos = dbContent.videos.filter((video) => {
    return video.id !== videoId;
  });

  try {
    const thumbnailExt = toDeleteVideo.thumbnailURL.split(".").pop();
    const videoExt = toDeleteVideo.videoURL.split(".").pop();
    const thumbnailKey = toDeleteVideo.id + "_thumbnail." + thumbnailExt;
    const videoKey = toDeleteVideo.id + "_video." + videoExt;
    await s3.deleteObject({Bucket: bucket, Key: thumbnailKey}).promise();
    await s3.deleteObject({Bucket: bucket, Key: videoKey}).promise();

    const putResult = await s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(dbContent),
      ACL: 'public-read',
      ContentType: 'application/json'
    }).promise();
    res.status(200).json({success: true});
  } catch (e) {
    console.log("save db error", e);
    res.status(200).json({success: false});
    return;
  }
}
