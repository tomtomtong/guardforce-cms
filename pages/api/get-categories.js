import getS3 from '../../libs/s3Helper';

export default async function handler(req, res) {
  const bucket = process.env.DO_SPACE_BUCKET;
  const key = "db-categories.json";
  const s3 = getS3();

  try {
    const getResult = await s3.getObject({
      Bucket: bucket,
      Key: key,
    }).promise();
    const dbContent = JSON.parse(getResult.Body.toString('utf-8'));

    res.status(200).json(dbContent);

  } catch (e) {
    console.log("save db error", e);
    res.status(200).json({categories: []});
  }
}
