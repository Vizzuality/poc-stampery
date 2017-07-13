const crypto = require('crypto');
const fs = require('fs');
const request = require('request-promise');
const Stampery = require('stampery');
const algorithm = 'sha256';


async function generateSHA256(fileName) {
  console.time('GenerateSHA256');
  return new Promise((resolve, reject) => {
    console.log('Generating sha256 of ', fileName);
    const shasum = crypto.createHash(algorithm);

    const path = `${__dirname}/${fileName}`;
    const stream = fs.createReadStream(path);

    stream.on('data', (data) => shasum.update(data));

    stream.on('end', () => {
      resolve(shasum.digest('hex'));
      console.timeEnd('GenerateSHA256');
    });
  });
}

async function stamp(sha) {
  const stampery = new Stampery(process.env.STAMPERY_TOKEN);

  return new Promise((resolve, reject) => {
    stampery.stamp(sha, (err, stamp) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stamp);
    })
  });
}

async function doProcess(file) {

  const sha = await generateSHA256(file);
  const res = await stamp(sha);
  return res;

}


if (process.argv.length === 3) {
  doProcess(process.argv[2]).then(sha256 => console.log('result: ', sha256), err => console.error(err));


} else{
  console.log('USAGE: node main.js <file>');
}
