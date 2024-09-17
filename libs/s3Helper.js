import AWS from 'aws-sdk';

export default function getS3() {
  const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACE_ENDPOINT);
  
  return new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY,
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY,
 
  });
}
