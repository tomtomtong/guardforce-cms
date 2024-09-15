import { v4 as uuidv4 } from 'uuid';
import getS3 from '../../libs/s3Helper';
import auth from '../../libs/auth';

export default function handler(req, res) {
  const {thumbnailName, videoName, token} = req.body;

  if (!auth.verify(token)) {
    res.status(200).json({success: false, invalidToken: true});
    return;
  }

  const thumbnailExt = thumbnailName.split(".").pop();
  const videoExt = videoName.split(".").pop();

  const s3 = getS3();

  const assetId = uuidv4();
  const thumbnailKey = assetId + "_thumbnail." + thumbnailExt;
  const videoKey = assetId + "_video." + videoExt;

  const thumbnailPresignedUrl = s3.getSignedUrl('putObject', {
    Bucket: process.env.DO_SPACE_BUCKET,
    Key: thumbnailKey,
    ACL: 'public-read',
    Expires: 300 //time to expire in seconds
  });

  const videoPresignedUrl = s3.getSignedUrl('putObject', {
    Bucket: process.env.DO_SPACE_BUCKET,
    Key: videoKey,
    ACL: 'public-read',
    Expires: 300 //time to expire in seconds
  });

  res.status(200).json({
    assetId,
    thumbnailURL: thumbnailPresignedUrl,
    videoURL: videoPresignedUrl
  });
}
