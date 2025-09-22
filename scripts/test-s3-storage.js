require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');

async function testS3Storage() {
  console.log('🔍 Testing S3-compatible Supabase Storage...\n');

  // Configure AWS SDK for Supabase S3-compatible storage
  const s3 = new AWS.S3({
    endpoint: 'https://yyrmyghibkllfzcaztbw.storage.supabase.co',
    region: 'ap-southeast-2',
    accessKeyId: '7a06e45af1f9f9cd60c05892f8e49ec4',
    secretAccessKey: '8eff8b0f00fee0263c7596a89174eee74d47f5f74278b6629bfd633c28c09c87',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
  });

  try {
    // 1. List buckets
    console.log('1. Listing buckets...');
    const { Buckets } = await s3.listBuckets().promise();
    console.log(`Found ${Buckets.length} buckets:`);
    Buckets.forEach(bucket => {
      console.log(`  - ${bucket.Name} (created: ${bucket.CreationDate})`);
    });

    const recipeImagesBucket = Buckets.find(b => b.Name === 'recipe-images');
    if (recipeImagesBucket) {
      console.log('✅ recipe-images bucket found!');
    } else {
      console.log('❌ recipe-images bucket not found');
      return;
    }

    // 2. Test file upload
    console.log('\n2. Testing file upload...');
    const testContent = 'This is a test image file for recipe upload';
    const testKey = 'test/upload-test.txt';
    
    const uploadParams = {
      Bucket: 'recipe-images',
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    console.log('✅ Upload successful!');
    console.log(`   Location: ${uploadResult.Location}`);
    console.log(`   Key: ${uploadResult.Key}`);

    // 3. Test file listing
    console.log('\n3. Testing file listing...');
    const listParams = {
      Bucket: 'recipe-images',
      Prefix: 'test/'
    };

    const listResult = await s3.listObjectsV2(listParams).promise();
    console.log(`Found ${listResult.Contents.length} files in test/ folder:`);
    listResult.Contents.forEach(file => {
      console.log(`  - ${file.Key} (${file.Size} bytes)`);
    });

    // 4. Test file download
    console.log('\n4. Testing file download...');
    const downloadParams = {
      Bucket: 'recipe-images',
      Key: testKey
    };

    const downloadResult = await s3.getObject(downloadParams).promise();
    const downloadedContent = downloadResult.Body.toString();
    console.log('✅ Download successful!');
    console.log(`   Content: ${downloadedContent}`);

    // 5. Clean up test file
    console.log('\n5. Cleaning up test file...');
    const deleteParams = {
      Bucket: 'recipe-images',
      Key: testKey
    };

    await s3.deleteObject(deleteParams).promise();
    console.log('✅ Test file cleaned up');

    console.log('\n🎉 S3 Storage is working correctly!');
    console.log('The bucket exists and file operations work.');

  } catch (error) {
    console.error('❌ Error testing S3 storage:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
  }
}

testS3Storage().catch(console.error);
