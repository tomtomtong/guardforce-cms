import getS3 from '../../libs/s3Helper';
import auth from '../../libs/auth';

export default async function handler(req, res) {
  const {token, assetId, thumbnailURL, category, name, thumbnailSize} = req.body;

  if (!auth.verify(token)) {
    res.status(200).json({success: false, invalidToken: true});
    return;
  }

  const bucket = process.env.DO_SPACE_BUCKET;
  const key = "db-categories.json";
  const s3 = getS3();

  const newCategory = {
    id: assetId,
    name,
    thumbnailURL: thumbnailURL.split("?")[0],
    thumbnailSize,
    createdAt: new Date()
  };

  let dbContent = null;
  try {
    const getResult = await s3.getObject({
      Bucket: bucket,
      Key: key,
    }).promise();
    dbContent = JSON.parse(getResult.Body.toString('utf-8'));
  } catch (e) {
    console.log("db not found", e);

    if (e.name === 'NoSuchKey') { // initialize db
      dbContent = {categories: []}
    } else {
      res.status(200).json({success: false});
      return;
    }
  }

  if (!dbContent.categories) {
    dbContent.categories = [];
  }
  dbContent.categories.push(newCategory);

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
    console.log("save db error", e);
    res.status(200).json({success: false});
    return;
  }
}

