import getS3 from '../../libs/s3Helper';

export default async function handler(req, res) {
  const bucket = process.env.DO_SPACE_BUCKET;
  const key = process.env.DO_SPACE_ACCESS_KEY;
  const secret = process.env.DO_SPACE_SECRET_KEY; // Ensure this is set
  const endpoint = process.env.DO_SPACE_ENDPOINT; // Ensure this is set
  const s3 = getS3({ 
    accessKeyId: key, 
    secretAccessKey: secret, 
    endpoint, // Use the DigitalOcean endpoint
    region: 'sgp1' // Specify the region if necessary
  });

  try {
    const getResult = await s3.getObject({
      Bucket: bucket,
      Key: 'db.json', 
    }).promise();
    const dbContent = JSON.parse(getResult.Body.toString('utf-8'));

    res.status(200).json(dbContent);

  } catch (e) {
    console.log("save db error", e);
    res.status(200).json({videos: []});
  }
}
