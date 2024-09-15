import getS3 from '../../libs/s3Helper';
import auth from '../../libs/auth';

export default async function handler(req, res) {
  const {categoryId, token} = req.body;

  if (!auth.verify(token)) {
    res.status(200).json({success: false, invalidToken: true});
    return;
  }

  const bucket = process.env.DO_SPACE_BUCKET;
  const key = "db-categories.json";
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

  const toDeleteCategory = dbContent.categories.find((category) => {
    return category.id === categoryId;
  });

  if (!toDeleteCategory) {
    res.status(200).json({success: false});
    return;
  }

  dbContent.categories = dbContent.categories.filter((category) => {
    return category.id !== categoryId;
  });

  try {
    const thumbnailExt = toDeleteCategory.thumbnailURL.split(".").pop();
    const thumbnailKey = toDeleteCategory.id + "_thumbnail." + thumbnailExt;
    await s3.deleteObject({Bucket: bucket, Key: thumbnailKey}).promise();

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
