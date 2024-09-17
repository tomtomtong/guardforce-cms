import getS3 from '../../libs/s3Helper';
import auth from '../../libs/auth';

export default async function handler(req, res) {
  const {token, assetId, videoURL, thumbnailURL, category, name, videoSize, thumbnailSize} = req.body;

  if (!auth.verify(token)) {
    res.status(200).json({success: false, invalidToken: true});
    return;
  }

  const bucket = process.env.DO_SPACE_BUCKET;
  const s3 = getS3();

  const newVideo = {
    id: assetId,
    category,
    name,
    videoURL: videoURL.split("?")[0],
    thumbnailURL: thumbnailURL.split("?")[0],
    thumbnailSize,
    videoSize, 
    createdAt: new Date()
  };

  let dbContent = null;
  try {
    const getResult = await s3.getObject({
      Bucket: bucket,
      Key: 'db.json', // Assuming this is the key for your database file
    }).promise();
    dbContent = JSON.parse(getResult.Body.toString('utf-8'));
  } catch (e) {
    console.log("db not found", e);

    if (e.name === 'NoSuchKey') { // initialize db
      dbContent = {videos: []}
    } else {
      console.error("Error retrieving database:", e); // More detailed logging
      res.status(200).json({success: false});
      return;
    }
  }

  if (!dbContent.videos) {
    dbContent.videos = [];
  }
  dbContent.videos.push(newVideo);

  try {
    const putResult = await s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(dbContent),
      ACL: 'public-read',
      ContentType: 'application/json'
    }).promise();
    res.status(200).json({success: true});
  } catch (e) {
    console.error("Error saving database:", e); // More detailed logging
    res.status(200).json({success: false});
    return;
  }
}
