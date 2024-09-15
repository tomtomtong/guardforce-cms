import AWS from 'aws-sdk';

export default function getS3() {
  const spaceEndpoint = new AWS.Endpoint(process.env.DO_SPACE_ENDPONIT);
  const s3 = new AWS.S3({
    endpoint: spaceEndpoint,
    accessKeyId: process.env.DO_SPACE_ACCESS,
    secretAccessKey: process.env.DO_SPACE_SECRET,
    signatureVersion: 'v4' // if not set, presignedUrl upload has cros error.... weird
  });

  return s3;
}
